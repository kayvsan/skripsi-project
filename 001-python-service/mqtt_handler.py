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

# Cooldown antara sesi penyiraman (detik)
# Default: 300 detik = 5 menit — beri waktu tanah menyerap air
PUMP_COOLDOWN = int(os.getenv("PUMP_COOLDOWN", 300))

# Batas kelembapan tanah — jangan siram jika sudah basah
SOIL_MOISTURE_CUTOFF = float(os.getenv("SOIL_MOISTURE_CUTOFF", 70.0))

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

        # Timer untuk throttle penyimpanan ke database
        # Set ke 0 agar data pertama langsung disimpan saat service mulai
        self.last_db_save = 0
        
        # Buffer untuk data sensor terbaru
        self.latest_data = {
            'suhu': None,
            'kelembapan_udara': None,
            'kelembapan_tanah': None,
            'timestamp': 0
        }

    def on_connect(self, client, userdata, flags, rc):
        print(f"Connected to MQTT Broker with result code {rc}")
        print(f"DB save interval: {DB_SAVE_INTERVAL} seconds ({DB_SAVE_INTERVAL // 60} minutes)")
        client.subscribe(self.topic_sensor)
        client.subscribe(self.topic_status)

    def on_message(self, client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode())

            # === Handle pump status feedback dari ESP32 ===
            if msg.topic == self.topic_status:
                pump_state = payload.get("pump", "")
                if pump_state == "OFF":
                    print("[PUMP] ESP32 reported pump OFF")
                return

            # === Handle sensor data ===
            suhu = payload.get('suhu')
            humidity = payload.get('kelembapan_udara')
            soil = payload.get('kelembapan_tanah')

            if None in [suhu, humidity, soil]:
                print("Invalid sensor data received")
                return

            # Simpan ke buffer data terbaru (untuk diambil oleh scheduler)
            self.latest_data = {
                'suhu': suhu,
                'kelembapan_udara': humidity,
                'kelembapan_tanah': soil,
                'timestamp': time.time()
            }
            
            # Print lebih singkat agar tidak spam log
            print(f"Received sensor data: Suhu={suhu}, Hum={humidity}, Soil={soil}")

            # Simpan ke DB hanya setiap 10 menit (sensor_data)
            current_time = time.time()
            if current_time - self.last_db_save >= DB_SAVE_INTERVAL:
                self.last_db_save = current_time
                sensor_id = db.save_sensor_data(suhu, humidity, soil)
                print(f"[DB] Routine data saved to database (next save in {DB_SAVE_INTERVAL // 60} minutes)")
                # Catatan: save_fuzzy_decision sekarang dipindah ke scheduler.py

        except Exception as e:
            print(f"Error processing MQTT message: {e}")

    def run(self):
        self.client.connect(self.host, self.port, 60)
        self.client.loop_forever()

mqtt_service = MQTTHandler()
