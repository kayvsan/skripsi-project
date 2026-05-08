// Memasukkan library yang diperlukan
#include "DHT.h"

// ========================================
//         KONFIGURASI PIN & SENSOR
// ========================================

// Tentukan pin yang digunakan untuk data sensor.
// D4 pada ESP32 Devkit V1 adalah GPIO 4.
#define DHTPIN 4

// Tentukan tipe sensor yang digunakan.
// Karena kamu memakai DHT22 (juga dikenal sebagai AM2302),
// kita pilih DHT22. Kalau nanti pakai DHT11, ganti dengan DHT11.
#define DHTTYPE DHT22

// Membuat objek sensor dengan parameter pin dan tipe sensor
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  // Memulai komunikasi serial untuk menampilkan data di Serial Monitor
  Serial.begin(115200);
  Serial.println(F("Memulai pembacaan sensor DHT22 di pin D4 (GPIO 4)..."));

  // Memulai sensor DHT
  dht.begin();
}

void loop() {
  // Beri jeda 2 detik antar pembacaan.
  // Sensor DHT22 butuh jeda minimal sekitar 2 detik untuk pembacaan yang stabil.
  delay(2000);

  // Membaca nilai kelembaban udara (dalam persen)
  float kelembaban = dht.readHumidity();
  // Membaca nilai suhu udara (dalam derajat Celcius)
  float suhu = dht.readTemperature();

  // Memeriksa apakah pembacaan gagal dan langsung keluar dari fungsi loop().
  // Ini mencegah program melanjutkan ke perintah di bawahnya jika ada error.
  if (isnan(suhu) || isnan(kelembaban)) { // isnan = is Not a Number
    Serial.println(F("Gagal membaca dari sensor DHT22!"));
    return;
  }

  // ========================================
  //        MENAMPILKAN DATA KE MONITOR
  // ========================================
  
  // Tampilkan nilai kelembaban
  Serial.print(F("Kelembaban: "));
  Serial.print(kelembaban);
  Serial.print(F("%  ")); // Tambah spasi biar rapi

  // Tampilkan nilai suhu
  Serial.print(F("Suhu: "));
  Serial.print(suhu);
  Serial.println(F("°C"));
}