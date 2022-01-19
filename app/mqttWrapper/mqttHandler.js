const mqtt = require('mqtt');

class MqttHandler {
    constructor() {
        this.mqttClient = null;
        this.host = 'tcp://broker.hivemq.com';
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
        });


        this.mqttClient.on('close', () => {
            console.log(`mqtt client disconnected`);
        });
    }
}

module.exports = MqttHandler;