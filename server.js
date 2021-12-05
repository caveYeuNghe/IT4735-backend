const express = require('express');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const cors = require('cors');
const mqttClient = mqtt.connect('tcp://broker.hivemq.com:1883');
const Device = require('./app/model/device');
const User = require('./app/model/user');
const subscribeTopic = "nhom24Sub"
const publishTopic = "nhom24Pub"


const server = express().use(express.json()).use(express.urlencoded({ extended: true })).use(cors());

const userRouter = require('./app/router/userRouter');
const deviceRouter = require('./app/router/deviceRouter');
const user = require('./app/model/user');

server.use('/users', userRouter);
server.use('/devices', deviceRouter);
server.use(express.static('public'));

//connect db mongo atlas
const url = "mongodb+srv://hanh-nh_18:123321@cluster0.iabfh.mongodb.net/IoTDB?retryWrites=true&w=majority"
const connect = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, });
connect.then((db) => {
  console.log("Connected to the database.");
}, (err) => { console.log(err); });

const http = require('http').createServer(server);

mqttClient.on('connect', () => {
    mqttClient.subscribe(subscribeTopic, (err) => {
        if (err) console.log(err);
    })
})

mqttClient.on('message', async (subscribeTopic, payload) => {
    try {
        var jsonMessage = JSON.parse(payload.toString());
        console.log("Update from device: " + jsonMessage.deviceId);
        const device = await Device.findById(jsonMessage.deviceId);
        if (device) {
            if (device.connectState == 'pending') {
                device.connectState = 'active';
                await User.findOneAndUpdate({ _id: device.creatorId, "devices.connectState": "pending" }, {
                    $set: {
                        "devices.$.connectState": "active"
                    }
                })
            }

            if (device.stateHistory.length >= 50) {
                device.stateHistory.shift();
            }

            // User time limit outdate
            if (device.actionHistory[device.actionHistory.length - 1].keepTo < Date.now()) {
                device.stateHistory.push({
                    temperature: jsonMessage.temperature,
                    humidity: jsonMessage.humidity,
                    actorState: jsonMessage.actorStateRequest
                })
                if (device.actionHistory.length > 50) device.actionHistory.shift();
                device.actionHistory.push({
                    from: "device",
                    action: device.stateHistory[device.stateHistory.length - 1].actorState,
                    keepTo: Date.now()
                })
            } else {
                device.stateHistory.push({
                    temperature: jsonMessage.temperature,
                    humidity: jsonMessage.humidity,
                    actorState: device.actionHistory[device.actionHistory.length - 1].action
                })
            }

            mqttClient.publish(publishTopic, JSON.stringify({
                actorState: device.actionHistory[device.actionHistory.length - 1].action,
                keepTo: device.actionHistory[device.actionHistory.length - 1].keepTo,
                from: device.actionHistory[device.actionHistory.length - 1].from
            }))

            await Device.findByIdAndUpdate(jsonMessage.deviceId, {
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