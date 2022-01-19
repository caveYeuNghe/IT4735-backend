const mqtt = require('mqtt');
const Device = require("../model/device");

class MqttHandler {
    constructor() {
        this.mqttClient = null;
        this.host = 'tcp://broker.hivemq.com';
        this.subscribeTopic = "nhom10iot/data";
        // this.username = '';
        // this.password = '';
    }

    connect() {
        this.mqttClient = mqtt.connect(this.host, {port: 1883});
        // Mqtt error calback
        this.mqttClient.on('error', (err) => {
            console.log(err);
            this.mqttClient.end();
        });

        // Connection callback
        this.mqttClient.on('connect', () => {
            console.log(`mqtt client connected`);
            this.mqttClient.subscribe(this.subscribeTopic, (err) => {
                if (err) console.log(err);
            })
        });


        this.mqttClient.on('close', () => {
            console.log(`mqtt client disconnected`);
        });

        this.mqttClient.on('message', async (subscribeTopic, payload) => {
            try {
                var jsonMessage = JSON.parse(payload.toString());
                console.log("jsonMessage: ", jsonMessage);

                const device = await Device.findById(jsonMessage.deviceId);
                if (device) {
                    device.connectState = jsonMessage.connectState;
                    device.location = jsonMessage.location;
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
    }

    sendMessage(topic, message) {
        this.mqttClient.publish(topic, message);
    }
}

module.exports = MqttHandler;