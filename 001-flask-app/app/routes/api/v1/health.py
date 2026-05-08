from flask import jsonify
from app.routes.api.v1 import api_v1_bp
from app.extensions import db

@api_v1_bp.route('/health', methods=['GET'])
def health_check():
    db_ok = True
    try:
        db.session.execute(db.text('SELECT 1'))
    except Exception:
        db_ok = False

    return jsonify({
        "status": "ok" if db_ok else "unhealthy",
        "database": "connected" if db_ok else "disconnected",
        "service": "flask-app"
    })
