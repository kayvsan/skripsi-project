import psycopg
from psycopg_pool import ConnectionPool
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseHandler:
    def __init__(self):
        try:
            # DSN (Database Source Name) string
            self.conn_str = (
                f"user={os.getenv('DB_USER')} "
                f"password={os.getenv('DB_PASSWORD')} "
                f"host={os.getenv('DB_HOST')} "
                f"port={os.getenv('DB_PORT')} "
                f"dbname={os.getenv('DB_NAME')}"
            )
            
            # psycopg3 uses ConnectionPool from psycopg_pool package
            self.pool = ConnectionPool(self.conn_str, min_size=1, max_size=10)
            print("Database connection pool created successfully (psycopg v3)")
        except Exception as e:
            print(f"Error creating database pool: {e}")

    def save_sensor_data(self, suhu, hum, soil):
        try:
            with self.pool.connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "INSERT INTO sensor_data (suhu, kelembapan_udara, kelembapan_tanah) VALUES (%s, %s, %s) RETURNING id",
                        (suhu, hum, soil)
                    )
                    id = cur.fetchone()[0]
                    # conn.commit() is handled automatically by the connection context manager in psycopg3
                    return id
        except Exception as e:
            print(f"Error saving sensor data: {e}")
            return None

    def save_fuzzy_decision(self, sensor_data_id, inputs, output):
        try:
            with self.pool.connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """INSERT INTO fuzzy_decisions 
                           (sensor_data_id, suhu_val, kelembapan_udara_val, kelembapan_tanah_val, output_durasi) 
                           VALUES (%s, %s, %s, %s, %s)""",
                        (sensor_data_id, inputs['suhu'], inputs['humidity'], inputs['soil'], output)
                    )
        except Exception as e:
            print(f"Error saving fuzzy decision: {e}")

    def save_irrigation_log(self, durasi, trigger="fuzzy_logic"):
        try:
            with self.pool.connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "INSERT INTO irrigation_logs (durasi, triggered_by) VALUES (%s, %s)",
                        (durasi, trigger)
                    )
        except Exception as e:
            print(f"Error saving irrigation log: {e}")

db = DatabaseHandler()
