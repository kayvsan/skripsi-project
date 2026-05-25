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
[Python Service]         [React Frontend]
(Fuzzy Logic + DB)              ↓
       ↓                   [Node.js API]
  [PostgreSQL] ←───────────────┘
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

ESP32 → Publish sensor ke MQTT

Python Service → Subscribe MQTT → Fuzzy Logic → Insert ke DB

Python Service → Publish keputusan ke MQTT

ESP32 → Subscribe MQTT → Control relay

React Frontend → Subscribe MQTT (update real-time)

React Frontend → Request API ke Node.js untuk history data

Node.js → Query PostgreSQL → Return JSON

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







