from flask import Blueprint

api_v1_bp = Blueprint('api_v1', __name__)

from app.routes.api.v1 import sensors, health
