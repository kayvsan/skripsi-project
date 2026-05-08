import json
import paho.mqtt.client as mqtt
from flask import current_app
from app.services.fuzzy_engine import FuzzyIrrigationEngine
from app.services.db_manager import DatabaseManager
import threading

class MQTTHandler:
    def __init__(self, app):
        self.app = app
        self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        
        # Configure callbacks
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.on_disconnect = self.on_disconnect
        
        # Authentication
        if app.config.get('MQTT_USERNAME'):
            self.client.username_pw_set(
                app.config['MQTT_USERNAME'], 
                app.config['MQTT_PASSWORD']
            )

    def on_connect(self, client, userdata, flags, rc, properties=None):
        if rc == 0:
            print("Connected to MQTT Broker successfully")
            # Subscribe to sensor data
            client.subscribe(self.app.config['MQTT_TOPIC_SENSOR_DATA'])
            client.subscribe(self.app.config['MQTT_TOPIC_PUMP_STATUS'])
        else:
            print(f"Failed to connect to MQTT Broker, return code {rc}")

    def on_disconnect(self, client, userdata, rc, properties=None):
        print("Disconnected from MQTT Broker")

    def on_message(self, client, userdata, msg):
        payload = msg.payload.decode('utf-8')
        # print(f"Received message on {msg.topic}: {payload}")
        
        if msg.topic == self.app.config['MQTT_TOPIC_SENSOR_DATA']:
            self.process_sensor_data(payload)
        elif msg.topic == self.app.config['MQTT_TOPIC_PUMP_STATUS']:
            print(f"Pump Status Update: {payload}")

    def process_sensor_data(self, payload):
        try:
            data = json.loads(payload)
            soil_moisture = data.get('soil_moisture')
            air_humidity = data.get('air_humidity')
            temperature = data.get('temperature')
            device_id = data.get('device_id', 'ESP32_001')

            if None in [soil_moisture, air_humidity, temperature]:
                print("Incomplete sensor data received")
                return

            with self.app.app_context():
                # 1. Save Raw Sensor Data
                sensor_record = DatabaseManager.save_sensor_data(
                    soil_moisture, air_humidity, temperature, device_id
                )

                # 2. Run Fuzzy Logic
                fuzzy_engine = FuzzyIrrigationEngine()
                fuzzy_result = fuzzy_engine.compute(soil_moisture, air_humidity, temperature)

                if fuzzy_result:
                    # 3. Save Fuzzy Decision
                    DatabaseManager.save_fuzzy_decision(sensor_record.id, fuzzy_result)

                    # 4. Determine Action
                    duration_percent = fuzzy_result['duration_percent']
                    threshold = self.app.config.get('PUMP_THRESHOLD_PERCENT', 10.0)
                    
                    pump_active = duration_percent >= threshold
                    duration_seconds = 0
                    
                    if pump_active:
                        max_duration = self.app.config.get('PUMP_DURATION_MAX_SECONDS', 60)
                        duration_seconds = int((duration_percent / 100.0) * max_duration)
                        
                        # Publish Control Message
                        control_payload = {
                            "action": "ON",
                            "duration_seconds": duration_seconds,
                            "reason": f"Fuzzy: {fuzzy_result['decision']} ({duration_percent:.1f}%)"
                        }
                        self.client.publish(
                            self.app.config['MQTT_TOPIC_PUMP_CONTROL'],
                            json.dumps(control_payload)
                        )
                    else:
                        # Optional: Publish OFF if needed, but usually pump just stops after duration
                        pass

                    # 5. Log Irrigation Action
                    DatabaseManager.save_irrigation_log(
                        sensor_record.id,
                        duration_percent,
                        duration_seconds,
                        pump_active,
                        f"Fuzzy Decision: {fuzzy_result['decision']}"
                    )

        except Exception as e:
            print(f"Error processing sensor data: {e}")

    def start(self):
        host = self.app.config['MQTT_BROKER_HOST']
        port = self.app.config['MQTT_BROKER_PORT']
        keepalive = self.app.config['MQTT_KEEPALIVE']
        
        self.client.connect(host, port, keepalive)
        self.client.loop_start()

def start_mqtt(app):
    mqtt_handler = MQTTHandler(app)
    mqtt_handler.start()
    return mqtt_handler
