import os
from app import create_app
from app.services.mqtt_handler import MQTTHandler
from dotenv import load_dotenv

load_dotenv()

def run_worker():
    # Create the Flask app instance to get configuration and database context
    config_name = os.environ.get('FLASK_ENV', 'development')
    app = create_app(config_name)
    
    print(f"[*] Starting MQTT Worker in {config_name} mode...")
    
    # Initialize the MQTT Handler with the app context
    mqtt_handler = MQTTHandler(app)
    
    try:
        # Connect and start the loop (blocking)
        host = app.config['MQTT_BROKER_HOST']
        port = app.config['MQTT_BROKER_PORT']
        keepalive = app.config['MQTT_KEEPALIVE']
        
        print(f"[*] Connecting to MQTT Broker at {host}:{port}...")
        mqtt_handler.client.connect(host, port, keepalive)
        
        # Use loop_forever() for the standalone worker
        mqtt_handler.client.loop_forever()
        
    except KeyboardInterrupt:
        print("\n[*] MQTT Worker stopped by user.")
    except Exception as e:
        print(f"[!] MQTT Worker error: {e}")

if __name__ == "__main__":
    run_worker()
