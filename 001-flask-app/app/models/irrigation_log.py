from datetime import datetime
from app.extensions import db

class IrrigationLog(db.Model):
    __tablename__ = 'irrigation_logs'

    id               = db.Column(db.Integer, primary_key=True)
    timestamp        = db.Column(db.DateTime, default=datetime.utcnow)
    sensor_data_id   = db.Column(db.Integer, db.ForeignKey('sensor_data.id'))
    duration_percent = db.Column(db.Float, nullable=False)
    duration_seconds = db.Column(db.Integer, nullable=False)
    pump_active      = db.Column(db.Boolean, nullable=False)
    reason           = db.Column(db.String(100))
