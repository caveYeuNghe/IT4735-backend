const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const expressSession = require("express-session");
const Device = require('./app/model/device');
const User = require('./app/model/user');
var mqttClient = require('./app/mqttWrapper/mqttClient');
const subscribeTopic = "nhom10iot/data";

const server = express().use(express.json()).use(express.urlencoded({extended: true})).use(cors());

server.use(expressSession({secret: "secret"}))
server.use(passport.initialize());
server.use(passport.session());
require("./passportConfig")(passport);

const userRouter = require('./app/router/userRouter');
const deviceRouter = require('./app/router/deviceRouter');
const user = require('./app/model/user');

server.use('/users', userRouter);
server.use('/devices', deviceRouter);
server.use(express.static('public'));

//connect db mongo atlas
const url = "mongodb+srv://hanh-nh_18:123321@cluster0.iabfh.mongodb.net/IoTDB?retryWrites=true&w=majority"
const connect = mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,});
connect.then((db) => {
    console.log("Connected to the database.");
}, (err) => {
    console.log(err);
});

const http = require('http').createServer(server);

mqttClient.on('connect', () => {
    mqttClient.subscribe(subscribeTopic, (err) => {
        if (err) console.log(err);
    })
})

mqttClient.on('message', async (subscribeTopic, payload) => {
    try {
        var jsonMessage = JSON.parse(payload.toString());
        console.log("jsonMessage: ", jsonMessage)

        const device = await Device.findById(jsonMessage.deviceId);
        if (device) {
            device.stateHistory.push({
                at: jsonMessage.at,
                temperature: jsonMessage.temperature,
                humidity: jsonMessage.humidity,
                co2: jsonMessage.co2,
                dust: jsonMessage.dust
            })

            await Device.findByIdAndUpdate(device._id, {
                $set: device
            })
        }
    } catch (error) {
        console.log(error);
    }
})

http.mqttClient = mqttClient;
http.listen(3000);

console.log("Listen at port 3000");