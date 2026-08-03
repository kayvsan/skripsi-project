import time
import json
import os
from apscheduler.schedulers.background import BackgroundScheduler
from fuzzy_engine import engine
from db import db

class IrrigationScheduler:
    def __init__(self, mqtt_handler):
        self.mqtt = mqtt_handler
        # Menggunakan timezone Jakarta
        self.scheduler = BackgroundScheduler(timezone='Asia/Jakarta')
        self.soil_cutoff = float(os.getenv("SOIL_MOISTURE_CUTOFF", 70.0))
        self.threshold = float(os.getenv("PUMP_THRESHOLD", 20.0))
    
    def check_and_irrigate(self, session_name):
        print(f"\n[{session_name.upper()}] Memulai sesi pengecekan jadwal penyiraman...")
        data = self.mqtt.latest_data
        
        if data['suhu'] is None:
            print(f"[{session_name}] Tidak ada data sensor yang tersedia, skip penyiraman.")
            return
        
        age = time.time() - data['timestamp']
        if age > 300:
            print(f"[{session_name}] Data sensor terakhir sudah {int(age)} detik yang lalu (terlalu lama), skip penyiraman.")
            return
        
        if data['kelembapan_tanah'] >= self.soil_cutoff:
            print(f"[{session_name}] Tanah sudah cukup basah ({data['kelembapan_tanah']:.1f}% >= {self.soil_cutoff}%), skip penyiraman.")
            sensor_id = db.save_sensor_data(data['suhu'], data['kelembapan_udara'], data['kelembapan_tanah'])
            db.save_fuzzy_decision(sensor_id, {'suhu': data['suhu'], 'humidity': data['kelembapan_udara'], 'soil': data['kelembapan_tanah']}, 0)
            return
        
        print(f"[{session_name}] Data valid (Suhu:{data['suhu']}C, Hum:{data['kelembapan_udara']}%, Soil:{data['kelembapan_tanah']}%)")
        duration = engine.calculate(
            data['suhu'], 
            data['kelembapan_udara'], 
            data['kelembapan_tanah']
        )
        
        print(f"[{session_name}] Hasil Fuzzy Logic: {duration:.1f}%")
        
        sensor_id = db.save_sensor_data(data['suhu'], data['kelembapan_udara'], data['kelembapan_tanah'])
        db.save_fuzzy_decision(sensor_id, {'suhu': data['suhu'], 'humidity': data['kelembapan_udara'], 'soil': data['kelembapan_tanah']}, duration)
        
        if duration > self.threshold:
            command = {"action": "pump_on", "duration_percent": duration}
            self.mqtt.client.publish(self.mqtt.topic_control, json.dumps(command))
            
            db.save_irrigation_log(duration, trigger=f"schedule_{session_name}")
            print(f"[{session_name}] PUMP ON dikirim ke ESP32 — Durasi: {duration:.1f}%")
        else:
            print(f"[{session_name}] Keputusan: TIDAK PERLU SIRAM — Hasil ({duration:.1f}%) <= Threshold ({self.threshold}%)")
    
    def start(self):
        # Pagi: 06:00
        self.scheduler.add_job(
            self.check_and_irrigate, 'cron',
            hour=6, minute=0, args=['pagi'],
            id='irrigation_pagi'
        )
        # Siang: 12:00
        self.scheduler.add_job(
            self.check_and_irrigate, 'cron',
            hour=12, minute=0, args=['siang'],
            id='irrigation_siang'
        )
        # Malam: 18:00
        self.scheduler.add_job(
            self.check_and_irrigate, 'cron',
            hour=18, minute=0, args=['malam'],
            id='irrigation_malam'
        )
        self.scheduler.start()
        print("⏰ Jadwal Penyiraman Aktif: Pagi (06:00), Siang (12:00), Malam (18:00) WIB")
