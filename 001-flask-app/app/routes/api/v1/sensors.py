from flask import jsonify, request
from app.routes.api.v1 import api_v1_bp
from app.services.db_manager import DatabaseManager
from app.models.sensor_data import SensorData
from app.models.irrigation_log import IrrigationLog
from app.models.fuzzy_decision import FuzzyDecision

@api_v1_bp.route('/sensors/latest', methods=['GET'])
def get_latest_sensors():
    limit = request.args.get('limit', 10, type=int)
    data = DatabaseManager.get_latest_sensor_data(limit)
    return jsonify([{
        "id": d.id,
        "timestamp": d.timestamp.isoformat(),
        "soil_moisture": d.soil_moisture,
        "air_humidity": d.air_humidity,
        "temperature": d.temperature,
        "device_id": d.device_id
    } for d in data])

@api_v1_bp.route('/irrigation/logs', methods=['GET'])
def get_irrigation_logs():
    limit = request.args.get('limit', 10, type=int)
    logs = DatabaseManager.get_irrigation_logs(limit)
    return jsonify([{
        "id": l.id,
        "timestamp": l.timestamp.isoformat(),
        "duration_percent": l.duration_percent,
        "duration_seconds": l.duration_seconds,
        "pump_active": l.pump_active,
        "reason": l.reason
    } for d in logs])

@api_v1_bp.route('/fuzzy/decisions', methods=['GET'])
def get_fuzzy_decisions():
    limit = request.args.get('limit', 10, type=int)
    decisions = FuzzyDecision.query.order_by(FuzzyDecision.timestamp.desc()).limit(limit).all()
    return jsonify([{
        "id": d.id,
        "timestamp": d.timestamp.isoformat(),
        "decision": d.decision,
        "duration_percent": d.duration_percent,
        "soil_moisture_fuzzy": d.soil_moisture_fuzzy,
        "air_humidity_fuzzy": d.air_humidity_fuzzy,
        "temperature_fuzzy": d.temperature_fuzzy
    } for d in decisions])
