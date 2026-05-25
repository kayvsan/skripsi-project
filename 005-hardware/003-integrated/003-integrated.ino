#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ========================================
//         KONFIGURASI WIFI & MQTT
// ========================================
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "YOUR_PC_IP_ADDRESS"; // Contoh: 192.168.1.10

// Topic MQTT
const char* topic_sensor = "chili/sensors/data";
const char* topic_control = "chili/pump/control";
const char* topic_status = "chili/pump/status";

// ========================================
//         KONFIGURASI PIN SENSOR
// ========================================
#define DHTPIN 4          // DHT22 di GPIO 4 (D4)
#define DHTTYPE DHT22
#define SOIL_PIN 34       // Soil Moisture di GPIO 34 (Analog)
#define RELAY_PIN 5       // Relay Pompa di GPIO 5

DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

long lastMsg = 0;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);

  // Parse JSON command from Python Service
  StaticJsonDocument<200> doc;
  deserializeJson(doc, message);
  
  const char* action = doc["action"];
  float duration_percent = doc["duration_percent"];

  if (String(action) == "pump_on") {
    Serial.println("PUMP ON triggered by Fuzzy Logic");
    digitalWrite(RELAY_PIN, HIGH); // Nyalakan pompa
    
    // Hitung durasi nyala (mapping 0-100% ke misal 0-10 detik)
    int pump_time_ms = map(duration_percent, 0, 100, 0, 10000); 
    delay(pump_time_ms);
    
    digitalWrite(RELAY_PIN, LOW); // Matikan pompa
    Serial.println("PUMP OFF");
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP32ChiliClient")) {
      Serial.println("connected");
      client.subscribe(topic_control);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // Pastikan mati di awal

  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  
  dht.begin();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  long now = millis();
  // Kirim data setiap 5 detik
  if (now - lastMsg > 5000) {
    lastMsg = now;

    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int soilRaw = analogRead(SOIL_PIN);
    
    // Map analog soil (0-4095) ke 0-100%
    // Catatan: Nilai analogRead tergantung jenis sensor (capacitive/resistive)
    // 4095 biasanya sangat kering, 1500 biasanya basah. Silakan kalibrasi.
    float soilPercent = map(soilRaw, 4095, 1500, 0, 100);
    if (soilPercent > 100) soilPercent = 100;
    if (soilPercent < 0) soilPercent = 0;

    if (isnan(h) || isnan(t)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["suhu"] = t;
    doc["kelembapan_udara"] = h;
    doc["kelembapan_tanah"] = soilPercent;

    char buffer[256];
    serializeJson(doc, buffer);

    Serial.print("Publish message: ");
    Serial.println(buffer);
    client.publish(topic_sensor, buffer);
  }
}
