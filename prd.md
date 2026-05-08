Baik, saya akan buatkan plan lengkap untuk sistem Penyiraman Otomatis Tanaman Cabai dengan arsitektur yang Anda inginkan.

## 📋 PLAN SISTEM PENYIRAMAN OTOMATIS TANAMAN CABAI

### 🏗️ **ARSITEKTUR SISTEM**

```
[ESP32 + Sensors] 
       ↓ (MQTT Publish)
   [MQTT Broker]
       ↓
   ┌───────────────────────────┐
   ↓                           ↓
[Flask App]              [React Frontend]
   ↓                           ↑
[PostgreSQL]                   |
   ↑                           |
[Node.js + Express API]────────┘
```

---

### 📦 **KOMPONEN SISTEM**

#### **1. Hardware (ESP32)**
- **ESP32 Dev Kit V1**
- **DHT22** - Sensor suhu & kelembapan udara
- **Soil Moisture Sensor** - Sensor kelembapan tanah (analog/capacitive)
- **Relay Module** - Kontrol pompa air (5V/12V)
- **Pompa Air**
- **Power Supply**

#### **2. MQTT Broker**
- **Mosquitto** atau **HiveMQ Cloud** (gratis)
- Topic structure:
  - `chili/sensors/data` - Data sensor
  - `chili/pump/status` - Status pompa
  - `chili/pump/control` - Kontrol pompa

#### **3. Flask App (Python)**
- **Tugas:**
  - Subscribe MQTT untuk data sensor
  - Implementasi Fuzzy Logic Mamdani
  - Insert data ke PostgreSQL
  - Publish keputusan penyiraman ke MQTT
- **Library:**
  - `paho-mqtt` - MQTT client
  - `scikit-fuzzy` - Fuzzy logic
  - `psycopg2` - PostgreSQL connector
  - `flask` - Web framework

#### **4. PostgreSQL Database**
- **Tables:**
  - `sensor_data` - Data sensor history
  - `irrigation_logs` - Log penyiraman
  - `fuzzy_decisions` - Keputusan fuzzy logic

#### **5. Node.js + Express Backend**
- **Endpoints:**
  - `GET /api/history` - Ambil data history
  - `GET /api/history/download` - Download CSV/Excel
  - `GET /api/irrigation-logs` - Log penyiraman
  - `GET /api/stats` - Statistik
- **Library:**
  - `express` - Framework
  - `pg` - PostgreSQL client
  - `cors` - CORS handling
  - `csv-writer` - Export CSV

#### **6. React Frontend**
- **Fitur:**
  - Real-time monitoring (MQTT WebSocket)
  - Dashboard grafik
  - History data table
  - Download history
  - Status pompa
- **Library:**
  - `mqtt` / `paho-mqtt` - MQTT client
  - `recharts` / `chart.js` - Grafik
  - `axios` - HTTP client
  - `react-table` - Tabel data

---

### 🔄 **ALUR KERJA SISTEM**

1. **ESP32** baca sensor setiap X detik → Publish ke MQTT
2. **Flask App** subscribe MQTT → Terima data sensor
3. **Flask** jalankan Fuzzy Logic Mamdani:
   - Input: Kelembapan tanah, Kelembapan udara, Suhu
   - Output: Durasi penyiraman (0-100%)
4. **Flask** simpan ke PostgreSQL
5. **Flask** publish keputusan ke MQTT → ESP32 kontrol relay
6. **React Frontend** subscribe MQTT → Update real-time
7. **React** request data history dari **Node.js API**
8. **Node.js** query PostgreSQL → Return data

---

### 🧮 **FUZZY LOGIC MAMDANI**

#### **Input Variables:**
1. **Kelembapan Tanah** (0-100%)
   - Kering: 0-30%
   - Lembab: 25-60%
   - Basah: 55-100%

2. **Kelembapan Udara** (0-100%)
   - Rendah: 0-40%
   - Sedang: 35-70%
   - Tinggi: 65-100%

3. **Suhu** (20-40°C)
   - Dingin: 20-28°C
   - Normal: 26-34°C
   - Panas: 32-40°C

#### **Output Variable:**
- **Durasi Penyiraman** (0-100%)
  - Tidak Perlu: 0-20%
  - Sedikit: 15-50%
  - Sedang: 45-75%
  - Banyak: 70-100%

#### **Rules (Contoh):**
- IF tanah KERING AND suhu PANAS → Penyiraman BANYAK
- IF tanah LEMBAB AND kelembapan_udara TINGGI → Penyiraman SEDIKIT
- IF tanah BASAH → Penyiraman TIDAK_PERLU

---

### 🗄️ **STRUKTUR DATABASE**

```sql
-- Table: sensor_data
CREATE TABLE sensor_data (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    soil_moisture FLOAT,
    air_humidity FLOAT,
    temperature FLOAT
);

-- Table: irrigation_logs
CREATE TABLE irrigation_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_percent FLOAT,
    pump_active BOOLEAN,
    sensor_data_id INTEGER REFERENCES sensor_data(id)
);

-- Table: fuzzy_decisions
CREATE TABLE fuzzy_decisions (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    soil_moisture_fuzzy VARCHAR(20),
    air_humidity_fuzzy VARCHAR(20),
    temperature_fuzzy VARCHAR(20),
    decision VARCHAR(20),
    confidence FLOAT
);
```

---

### 📁 **STRUKTUR PROJECT**

```
chili-irrigation-system/
│
├── hardware/
│   └── esp32_code/
│       └── main.ino
│
├── flask-app/
│   ├── app.py
│   ├── fuzzy_logic.py
│   ├── mqtt_handler.py
│   ├── db_manager.py
│   └── requirements.txt
│
├── nodejs-backend/
│   ├── server.js
│   ├── routes/
│   │   ├── history.js
│   │   └── stats.js
│   ├── db/
│   │   └── config.js
│   └── package.json
│
└── react-frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.jsx
    │   │   ├── RealtimeChart.jsx
    │   │   ├── HistoryTable.jsx
    │   │   └── PumpStatus.jsx
    │   ├── services/
    │   │   ├── mqttService.js
    │   │   └── apiService.js
    │   └── App.jsx
    └── package.json
```

---

### 🚀 **TAHAPAN DEVELOPMENT**

**Phase 1: Setup Infrastruktur**
- [ ] Install PostgreSQL
- [ ] Setup MQTT Broker (Mosquitto/Cloud)
- [ ] Setup database & tables

**Phase 2: Hardware**
- [ ] Code ESP32 + sensors
- [ ] Test MQTT publish
- [ ] Test relay control

**Phase 3: Flask App**
- [ ] MQTT subscriber
- [ ] Fuzzy logic implementation
- [ ] Database integration
- [ ] Testing fuzzy rules

**Phase 4: Node.js Backend**
- [ ] Setup Express server
- [ ] API endpoints
- [ ] Database queries
- [ ] Export CSV feature

**Phase 5: React Frontend**
- [ ] Dashboard layout
- [ ] MQTT real-time connection
- [ ] Charts & visualizations
- [ ] History table & download

**Phase 6: Integration & Testing**
- [ ] End-to-end testing
- [ ] Performance tuning
- [ ] Documentation

---

### 📊 **MQTT MESSAGE FORMAT**

```json
// Topic: chili/sensors/data
{
  "device_id": "ESP32_001",
  "timestamp": "2026-05-04T10:30:00Z",
  "soil_moisture": 45.5,
  "air_humidity": 65.2,
  "temperature": 28.3
}

// Topic: chili/pump/control
{
  "action": "ON",
  "duration_percent": 75,
  "reason": "Fuzzy decision: BANYAK"
}

// Topic: chili/pump/status
{
  "status": "ON",
  "started_at": "2026-05-04T10:30:05Z"
}
```

---


