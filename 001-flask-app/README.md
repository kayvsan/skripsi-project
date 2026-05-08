# backend_app

## Quick Start
1. Buat virtual environment: python -m venv venv
2. Aktifkan: venv\Scripts\activate (Windows) atau source venv/bin/activate (Linux/Mac)
3. Install dependencies: pip install -r requirements-dev.txt
4. Setup env: copy .env.example .env lalu isi variabel rahasia
5. Inisialisasi DB: flask db init (hanya sekali), lalu flask db migrate & flask db upgrade
6. Jalankan dev server: python run.py

## Testing
pytest

## Docker
docker-compose up -d
