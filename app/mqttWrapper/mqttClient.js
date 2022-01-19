 var mqttHandler = require('./mqttHandler');

 var mqttClient = new mqttHandler();

 mqttClient.connect();

 module.exports = mqttClient;