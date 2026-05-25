-- Grant permissions (Run this as superuser if needed)
GRANT ALL ON SCHEMA public TO kams;

-- Create schema for Chili Automatic Irrigation System

-- 1. Table for raw sensor data
CREATE TABLE IF NOT EXISTS sensor_data (
    id SERIAL PRIMARY KEY,
    suhu FLOAT NOT NULL,
    kelembapan_udara FLOAT NOT NULL,
    kelembapan_tanah FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table for fuzzy logic decisions
CREATE TABLE IF NOT EXISTS fuzzy_decisions (
    id SERIAL PRIMARY KEY,
    sensor_data_id INTEGER REFERENCES sensor_data(id),
    kelembapan_tanah_val FLOAT,
    kelembapan_udara_val FLOAT,
    suhu_val FLOAT,
    output_durasi FLOAT,
    rule_applied TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table for irrigation logs (pumping events)
CREATE TABLE IF NOT EXISTS irrigation_logs (
    id SERIAL PRIMARY KEY,
    durasi FLOAT NOT NULL, -- in seconds or percentage as per logic
    triggered_by VARCHAR(50) DEFAULT 'fuzzy_logic', -- 'manual' or 'fuzzy_logic'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance on history queries
CREATE INDEX IF NOT EXISTS idx_sensor_data_created_at ON sensor_data(created_at);
CREATE INDEX IF NOT EXISTS idx_irrigation_logs_created_at ON irrigation_logs(created_at);
