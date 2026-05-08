from app.extensions import db
from app.models.sensor_data import SensorData
from app.models.fuzzy_decision import FuzzyDecision
from app.models.irrigation_log import IrrigationLog
from datetime import datetime

class DatabaseManager:
    @staticmethod
    def save_sensor_data(soil_moisture, air_humidity, temperature, device_id="ESP32_001"):
        """Save sensor data to the database."""
        sensor_data = SensorData(
            soil_moisture=soil_moisture,
            air_humidity=air_humidity,
            temperature=temperature,
            device_id=device_id
        )
        db.session.add(sensor_data)
        db.session.commit()
        return sensor_data

    @staticmethod
    def save_fuzzy_decision(sensor_data_id, fuzzy_result):
        """Save fuzzy decision to the database."""
        decision = FuzzyDecision(
            sensor_data_id=sensor_data_id,
            soil_moisture_fuzzy=fuzzy_result.get('soil_moisture_fuzzy'),
            air_humidity_fuzzy=fuzzy_result.get('air_humidity_fuzzy'),
            temperature_fuzzy=fuzzy_result.get('temperature_fuzzy'),
            decision=fuzzy_result.get('decision'),
            duration_percent=fuzzy_result.get('duration_percent'),
            confidence=fuzzy_result.get('confidence', 1.0)
        )
        db.session.add(decision)
        db.session.commit()
        return decision

    @staticmethod
    def save_irrigation_log(sensor_data_id, duration_percent, duration_seconds, pump_active, reason):
        """Save irrigation log to the database."""
        log = IrrigationLog(
            sensor_data_id=sensor_data_id,
            duration_percent=duration_percent,
            duration_seconds=duration_seconds,
            pump_active=pump_active,
            reason=reason
        )
        db.session.add(log)
        db.session.commit()
        return log

    @staticmethod
    def get_latest_sensor_data(limit=10):
        """Get latest sensor data."""
        return SensorData.query.order_by(SensorData.timestamp.desc()).limit(limit).all()

    @staticmethod
    def get_irrigation_logs(limit=10):
        """Get latest irrigation logs."""
        return IrrigationLog.query.order_by(IrrigationLog.timestamp.desc()).limit(limit).all()
