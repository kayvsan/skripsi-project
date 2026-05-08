import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # MQTT Configuration
    MQTT_BROKER_HOST = os.environ.get("MQTT_BROKER_HOST", "localhost")
    MQTT_BROKER_PORT = int(os.environ.get("MQTT_BROKER_PORT", 1883))
    MQTT_USERNAME = os.environ.get("MQTT_USERNAME", None)
    MQTT_PASSWORD = os.environ.get("MQTT_PASSWORD", None)
    MQTT_KEEPALIVE = int(os.environ.get("MQTT_KEEPALIVE", 60))

    # MQTT Topics
    MQTT_TOPIC_SENSOR_DATA = "chili/sensors/data"
    MQTT_TOPIC_PUMP_STATUS = "chili/pump/status"
    MQTT_TOPIC_PUMP_CONTROL = "chili/pump/control"

    # Fuzzy Logic Configuration
    PUMP_DURATION_MAX_SECONDS = int(os.environ.get("PUMP_DURATION_MAX_SECONDS", 60))
    PUMP_THRESHOLD_PERCENT = float(os.environ.get("PUMP_THRESHOLD_PERCENT", 10.0))

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get("DEV_DATABASE_URL", "sqlite:///dev.db")

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get("TEST_DATABASE_URL", "sqlite:///:memory:")

class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")

config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig
}
