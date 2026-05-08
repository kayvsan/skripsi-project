from datetime import datetime
from app.extensions import db

class FuzzyDecision(db.Model):
    __tablename__ = 'fuzzy_decisions'

    id                   = db.Column(db.Integer, primary_key=True)
    timestamp            = db.Column(db.DateTime, default=datetime.utcnow)
    sensor_data_id       = db.Column(db.Integer, db.ForeignKey('sensor_data.id'))
    soil_moisture_fuzzy  = db.Column(db.String(20))   # "kering", "lembab", "basah"
    air_humidity_fuzzy   = db.Column(db.String(20))    # "rendah", "sedang", "tinggi"
    temperature_fuzzy    = db.Column(db.String(20))    # "dingin", "normal", "panas"
    decision             = db.Column(db.String(20))    # "tidak_perlu", "sedikit", "sedang", "banyak"
    duration_percent     = db.Column(db.Float)          # 0-100 output defuzzifikasi
    confidence           = db.Column(db.Float)          # 0-1
