#define soil_moisture_pin 4

void setup() {
  Serial.begin(9600);
}

void loop() {
  Serial.println(analogRead(soil_moisture_pin));
  delay(500);
  // put your main code here, to run repeatedly:

}
