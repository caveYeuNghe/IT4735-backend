const {json} = require('express');
const Device = require('./app/model/device');

const mqtt = require('mqtt');
const mqttClient = mqtt.connect('tcp://broker.hivemq.com');
const subscribeTopic = "nhom06Pub";
const publishTopic = "nhom06Sub";
let at = Date.now()
let co2 = 0;
let dust = 0;
let temperature = 0;
let humidity = 0;


mqttClient.on('connect', () => {
    mqttClient.subscribe(subscribeTopic, (error) => {
        if (error) console.log(error);
    })
})

// const interval = setInterval(every5SecondsFunction, 5000);
const interval = setInterval(async () =>{
    await every5SecondsFunction()
},5000);

function fakeData() {
    temperature = (30 + 10 * Math.random()).toFixed(1);
    humidity = (100 * Math.random()).toFixed(1);
    at = Date.now();
    co2 = (30 + 10 * Math.random()).toFixed(1);
    dust = (30 + 10 * Math.random()).toFixed(1);
    console.log("We got the fake data")


}

async function every5SecondsFunction() {
    fakeData();
    mqttClient.publish(publishTopic, JSON.stringify(
        {
            at: at,
            temperature: temperature,
            humidity: humidity,
            co2:co2,
            dust:dust
        }
    ))
}
