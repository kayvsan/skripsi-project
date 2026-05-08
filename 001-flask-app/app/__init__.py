from flask import Flask
from app.config import config_by_name
from app.extensions import db, migrate

def create_app(config_name="development"):
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    db.init_app(app)
    migrate.init_app(app, db)

    # Import models for migrations
    from app import models

    # Register blueprints
    from app.routes.api.v1 import api_v1_bp
    app.register_blueprint(api_v1_bp, url_prefix='/api/v1')

    return app
