import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime

# Konfigurasi Database (dari docker-compose)
DB_HOST = "103.103.20.214"
DB_PORT = "5432"
DB_NAME = "irrigation_db"
DB_USER = "kams"
DB_PASSWORD = "kam439"

CSV_FILE = "C:/Users/KAMS/Documents/Project/skripsi-project/sensor_28hari_lengkap.csv"

def import_missing_data():
    print("Menghubungkan ke database...")
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    cursor = conn.cursor()

    # 1. Ambil data tanggal yang sudah ada di database untuk mencegah duplikasi
    print("Mengambil data waktu yang sudah ada di database...")
    cursor.execute("SELECT created_at FROM sensor_data;")
    existing_records = cursor.fetchall()
    
    # Simpan dalam bentuk set format string 'YYYY-MM-DD HH:MM' untuk pencocokan cepat
    existing_times = set()
    for record in existing_records:
        # Konversi ke waktu lokal atau format seragam sesuai yang ada di DB (asumsi UTC/Local)
        time_str = record[0].strftime("%Y-%m-%d %H:%M")
        existing_times.add(time_str)

    # 2. Baca CSV
    print("Membaca file CSV...")
    df = pd.read_csv(CSV_FILE)

    # Kolom: Waktu, Suhu (C), Kelembapan Udara (%), Kelembapan Tanah (%)
    # Parse waktu di CSV (contoh: Thu Jun 25 2026 14:00:00 GMT+0000)
    # Kita bersihkan string waktu untuk parsing (ambil 24 karakter pertama: Thu Jun 25 2026 14:00:00)
    
    def parse_time(t_str):
        try:
            clean_str = t_str[:24] # "Thu Jun 25 2026 14:00:00"
            return datetime.strptime(clean_str, "%a %b %d %Y %H:%M:%S")
        except Exception as e:
            return None

    new_data = []
    
    print("Memfilter data yang belum ada di database...")
    for index, row in df.iterrows():
        parsed_time = parse_time(str(row['Waktu']))
        if not parsed_time:
            continue
            
        time_check_str = parsed_time.strftime("%Y-%m-%d %H:%M")
        
        # Jika belum ada di database, kita siapkan untuk di-insert
        if time_check_str not in existing_times:
            new_data.append((
                row['Suhu (C)'],
                row['Kelembapan Udara (%)'],
                row['Kelembapan Tanah (%)'],
                parsed_time
            ))
            
    if len(new_data) > 0:
        print(f"Ditemukan {len(new_data)} data baru. Memasukkan ke database...")
        insert_query = """
            INSERT INTO sensor_data (suhu, kelembapan_udara, kelembapan_tanah, created_at)
            VALUES %s
        """
        execute_values(cursor, insert_query, new_data)
        conn.commit()
        print(f"Berhasil menambahkan {len(new_data)} data ke tabel sensor_data!")
    else:
        print("Tidak ada data baru yang ditambahkan. Semua data di CSV sudah ada di database.")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    import_missing_data()
