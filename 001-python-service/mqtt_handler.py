import paho.mqtt.client as mqtt
import json
import os
import time
from dotenv import load_dotenv
from fuzzy_engine import engine
from db import db

load_dotenv()

# Interval penyimpanan data ke database (dalam detik)
# Default: 900 detik = 15 menit
DB_SAVE_INTERVAL = int(os.getenv("DB_SAVE_INTERVAL", 900))

class MQTTHandler:
    def __init__(self):
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        
        self.host = os.getenv("MQTT_HOST", "localhost")
        self.port = int(os.getenv("MQTT_PORT", 1883))
        self.topic_sensor = os.getenv("MQTT_TOPIC_SENSOR", "chili/sensors/data")
        self.topic_control = os.getenv("MQTT_TOPIC_CONTROL", "chili/pump/control")
        self.topic_status = os.getenv("MQTT_TOPIC_STATUS", "chili/pump/status")
        self.threshold = float(os.getenv("PUMP_THRESHOLD", 20))

        # Timer untuk throttle penyimpanan ke database
        # Set ke 0 agar data pertama langsung disimpan saat service mulai
        self.last_db_save = 0

    def on_connect(self, client, userdata, flags, rc):
        print(f"Connected to MQTT Broker with result code {rc}")
        print(f"DB save interval: {DB_SAVE_INTERVAL} seconds ({DB_SAVE_INTERVAL // 60} minutes)")
        client.subscribe(self.topic_sensor)

    def on_message(self, client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode())
            suhu = payload.get('suhu')
            humidity = payload.get('kelembapan_udara')
            soil = payload.get('kelembapan_tanah')

            if None in [suhu, humidity, soil]:
                print("Invalid sensor data received")
                return

            print(f"Received data: Suhu={suhu}, Hum={humidity}, Soil={soil}")

            # 1. Run Fuzzy Logic (SELALU jalan setiap data masuk - real-time)
            duration = engine.calculate(suhu, humidity, soil)
            print(f"Fuzzy decision: duration={duration}%")

            # 2. Simpan ke DB hanya setiap 15 menit (sensor_data + fuzzy_decision)
            current_time = time.time()
            if current_time - self.last_db_save >= DB_SAVE_INTERVAL:
                self.last_db_save = current_time
                sensor_id = db.save_sensor_data(suhu, humidity, soil)
                db.save_fuzzy_decision(sensor_id, {'suhu': suhu, 'humidity': humidity, 'soil': soil}, duration)
                print(f"[DB] Data saved to database (next save in {DB_SAVE_INTERVAL // 60} minutes)")
            else:
                remaining = DB_SAVE_INTERVAL - (current_time - self.last_db_save)
                print(f"[DB] Skipped DB save (next save in {int(remaining)}s)")

            # 3. Control Logic & Logs (SELALU jalan - pompa harus responsif)
            if duration > self.threshold:
                # Command to ESP32
                command = {"action": "pump_on", "duration_percent": duration}
                self.client.publish(self.topic_control, json.dumps(command))
                
                # Log penyiraman SELALU disimpan (event penting)
                db.save_irrigation_log(duration)
                
                # Broadcast status
                status = {"pump": "ON", "duration_percent": duration}
                self.client.publish(self.topic_status, json.dumps(status))
            else:
                status = {"pump": "OFF", "duration_percent": duration}
                self.client.publish(self.topic_status, json.dumps(status))

        except Exception as e:
            print(f"Error processing MQTT message: {e}")

    def run(self):
        self.client.connect(self.host, self.port, 60)
        self.client.loop_forever()

mqtt_service = MQTTHandler()
