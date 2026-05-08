from datetime import datetime
from app.extensions import db

class SensorData(db.Model):
    __tablename__ = 'sensor_data'

    id            = db.Column(db.Integer, primary_key=True)
    timestamp     = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    device_id     = db.Column(db.String(50), nullable=False, default="ESP32_001")
    soil_moisture = db.Column(db.Float, nullable=False)   # 0-100%
    air_humidity  = db.Column(db.Float, nullable=False)    # 0-100%
    temperature   = db.Column(db.Float, nullable=False)    # °C

    # Relationships
    irrigation_log  = db.relationship('IrrigationLog', backref='sensor_data', uselist=False)
    fuzzy_decision  = db.relationship('FuzzyDecision', backref='sensor_data', uselist=False)
