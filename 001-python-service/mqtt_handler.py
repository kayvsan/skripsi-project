import paho.mqtt.client as mqtt
import json
import os
from dotenv import load_dotenv
from fuzzy_engine import engine
from db import db

load_dotenv()

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

    def on_connect(self, client, userdata, flags, rc):
        print(f"Connected to MQTT Broker with result code {rc}")
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

            # 1. Save to DB
            sensor_id = db.save_sensor_data(suhu, humidity, soil)

            # 2. Run Fuzzy Logic
            duration = engine.calculate(suhu, humidity, soil)
            print(f"Fuzzy decision: duration={duration}%")

            # 3. Save Decision to DB
            db.save_fuzzy_decision(sensor_id, {'suhu': suhu, 'humidity': humidity, 'soil': soil}, duration)

            # 4. Control Logic & Logs
            if duration > self.threshold:
                # Command to ESP32
                command = {"action": "pump_on", "duration_percent": duration}
                self.client.publish(self.topic_control, json.dumps(command))
                
                # Log to DB
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
