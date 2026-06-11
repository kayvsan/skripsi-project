import signal
import sys
import threading
from mqtt_handler import mqtt_service
from scheduler import IrrigationScheduler

def signal_handler(sig, frame):
    print("\nShutting down Python service...")
    # Add any cleanup here if needed
    sys.exit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    print("=== Chili Irrigation Python Service Started ===")
    print("Listening for sensor data via MQTT...")
    
    try:
        # Jalankan MQTT service di thread terpisah agar tidak memblokir
        mqtt_thread = threading.Thread(target=mqtt_service.run, daemon=True)
        mqtt_thread.start()

        # Inisialisasi dan jalankan scheduler
        scheduler = IrrigationScheduler(mqtt_service)
        scheduler.start()

        # Tetap hidupkan main thread
        signal.pause()
    except KeyboardInterrupt:
        print("\nService stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)
