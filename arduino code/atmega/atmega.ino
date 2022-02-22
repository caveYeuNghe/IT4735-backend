#include <LowPower.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <LiquidCrystal_I2C.h>

int period = 10000;
unsigned long time_now = 0;
volatile byte state = HIGH;
byte justWakeUp = LOW;

const byte AWAKE_LED = 9;
const byte BUTTON = 3;

const int DHTTYPE = DHT11; 
const int DHTPIN = 8; 
DHT dht(DHTPIN, DHTTYPE);

LiquidCrystal_I2C lcd(0x27,16,2);

void setup() {
  pinMode (BUTTON, INPUT);
  
  pinMode (AWAKE_LED, OUTPUT);
  digitalWrite (AWAKE_LED, HIGH);

  dht.begin();

  lcd.init();                    
  lcd.backlight();

  Serial.begin (9600);

  attachInterrupt(1, button_interrupt, FALLING);
}

void loop() {
  time_now = millis();

  do {
    if (Serial.available() > 0) {
      String cmd = Serial.readStringUntil('\\');
       if (cmd.indexOf("OFF") != -1)
            state = LOW;
       else if (cmd.indexOf("ON") != -1)
            state = HIGH;
    }

    if (justWakeUp == HIGH) {
      justWakeUp = LOW;
      break;
    }
    
  }
  while (state == HIGH && millis() < time_now + period);
  
  if (state == LOW) {
    sendData("OFF");
    delay(100);
    enterSleep();
  }
  else {
    sendData("ON");
  }
}

void enterSleep() {
  digitalWrite (AWAKE_LED, LOW);
  lcd.noBacklight();
  attachInterrupt(0, rx_interrupt, HIGH);
  
  LowPower.powerDown(SLEEP_FOREVER, ADC_OFF, BOD_OFF);
  
  detachInterrupt(0);
  lcd.backlight();
  digitalWrite (AWAKE_LED, HIGH);
  justWakeUp = HIGH;
  delay(10);
}

void button_interrupt() {
  static unsigned long last_interrupt_time = 0;
  unsigned long interrupt_time = millis();
  if (interrupt_time - last_interrupt_time > 100) {
    state = !state;
  }
  last_interrupt_time = interrupt_time;
}

void rx_interrupt() {
}

void sendData(String connectState){
  StaticJsonDocument<120> doc;
  int temp = random(10, 13);
  int humid = random(60, 70);
//  int temp = dht.readTemperature();
//  int humid = dht.readHumidity();
  int co2 = random(35, 40);
  int dust = random(30, 35);
  
  lcd.setCursor(0,0);
  lcd.print("Temperature:");
  lcd.print(temp);
  lcd.print(char(0xDF));
  lcd.print('C');
  lcd.setCursor(0,1);
  lcd.print("Humidity:");
  lcd.print(humid);
  lcd.print(char(0x25));
  
  
  doc["temperature"] = temp;
  doc["humidity"] = humid;
  doc["co2"] = co2;
  doc["dust"] = dust;
  doc["connectState"] = connectState;
  serializeJsonPretty(doc, Serial);
}
