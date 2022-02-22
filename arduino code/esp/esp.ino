#define ARDUINOJSON_USE_LONG_LONG 1

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <WiFiUdp.h>
#include <NTPClient.h>
#include <IPGeolocation.h>

#define ssid "Quang Huy"
#define password "abcd1234"
#define mqtt_server "broker.hivemq.com"
#define embedId "riu"

const uint16_t mqtt_port = 1883; //Port của CloudMQTT TCP
const char *pub = "nhom10iot/data";
const char *sub = "nhom10iot/riu/command";

WiFiClient espClient;
PubSubClient client(espClient);
WiFiUDP ntpUDP;

NTPClient timeClient(ntpUDP, "pool.ntp.org");

String Key = "67f3d33d09ca4775a0895ce1d3c7c346";
IPGeolocation location(Key);
float latitude;
float longitude;

volatile byte state = HIGH;
char buffer[256];

void setup() {
  Serial.begin(9600);
  setup_wifi();
  
  client.setServer(mqtt_server, mqtt_port); 
  client.setCallback(callback);
  
  setup_location();
  
  timeClient.begin();
  timeClient.setTimeOffset(0);
}

void setup_wifi() {
  delay(10);
  WiFi.begin(ssid, password);
}

void setup_location() {
  IPGeo IPG;
  location.updateStatus(&IPG);
  latitude = IPG.latitude;
  longitude = IPG.longitude;
}

void callback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<16> doc;
  deserializeJson(doc, payload, length);
  
  if ( doc["connectState"] == "ON" && state == LOW ) {
    Serial.print('>');
    delay(5);
    Serial.print("ON\n");
  }
  else if (doc["connectState"] == "OFF" && state == HIGH) {
    Serial.print('>');
    delay(5);
    Serial.print("OFF\n");
  }
}

void loop() {
  while (!client.connected()) {
    if (client.connect("riudevice"))
      client.subscribe(sub);
    else {
      delay(3000);
    }
  }
  
  client.loop();

  if (Serial.available () > 0) {
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, Serial);
    if (!error) {
      if (doc["connectState"] == "OFF") {
        if (state == LOW)
          return;
        else
          state = LOW;
      }
      else 
        state = HIGH;
  
      doc["embedId"] = embedId;
      
      timeClient.update();
      doc["at"] = ((uint64)timeClient.getEpochTime()) * 1000;
  
      JsonArray location = doc.createNestedArray("location");
      location.add(latitude);
      location.add(longitude);
      
      size_t n = serializeJsonPretty(doc, buffer); 
      client.publish(pub, buffer, n);
    }
  }
  
  delay(4000);
}
