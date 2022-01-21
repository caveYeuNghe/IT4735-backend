#include <LowPower.h>
#include <ArduinoJson.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27,16,2);

const byte AWAKE_LED = 8;
const byte BUTTON = 3;

volatile byte state = HIGH;

void setup() {
  pinMode (BUTTON, INPUT);
  pinMode (AWAKE_LED, OUTPUT);
  digitalWrite (AWAKE_LED, HIGH);

  attachInterrupt(1, button_interrupt, FALLING);

  lcd.init();                    
  lcd.backlight();
  lcd.setCursor(0,0);
  lcd.print("Temp: ");
  lcd.setCursor(0,1);
  lcd.print("Humid: ");
  
  Serial.begin (9600);
}

void loop() {
 delay(10000);
 
 if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\\');
     if (cmd.indexOf("OFF") != -1)
          state = LOW;
      else if (cmd.indexOf("ON") != -1)
          state = HIGH;
  }
  
  if (!state) {
    sendData("OFF");
    delay(100);
    enterSleep();
  }
  else
    sendData("ON");
}

void enterSleep() {
   digitalWrite (AWAKE_LED, LOW);
   lcd.noBacklight();
   attachInterrupt(0, rx_interrupt, HIGH);
   
   LowPower.powerDown(SLEEP_FOREVER, ADC_OFF, BOD_OFF);
   
   detachInterrupt(0);
   lcd.backlight();
   digitalWrite (AWAKE_LED, HIGH);
}

void button_interrupt() {
  static unsigned long last_interrupt_time = 0;
  unsigned long interrupt_time = millis();
  if (interrupt_time - last_interrupt_time > 200) {
    state = !state;
  }
  last_interrupt_time = interrupt_time;
}

void rx_interrupt() {
}

void sendData(String connectState){
  StaticJsonDocument<120> doc;
  int temp = random(20, 40);
  int humid = random(200, 800);
  int co2 = random(300, 600);
  int dust = random(200, 500);


  lcd.setCursor(6,0);
  lcd.print(temp);
  lcd.setCursor(7,1);
  lcd.print(humid);
  
  
  doc["temperature"] = temp;
  doc["humidity"] = humid;
  doc["co2"] = co2;
  doc["dust"] = dust;
  doc["connectState"] = connectState;
  serializeJsonPretty(doc, Serial);
}
