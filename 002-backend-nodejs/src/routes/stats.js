const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/stats - Ambil ringkasan statistik
router.get('/', async (req, res) => {
  try {
    const stats = {};
    
    // 1. Rata-rata sensor hari ini
    const avgSensor = await db.query(`
      SELECT 
        AVG(suhu) as avg_suhu, 
        AVG(kelembapan_udara) as avg_hum, 
        AVG(kelembapan_tanah) as avg_soil 
      FROM sensor_data 
      WHERE created_at >= CURRENT_DATE
    `);
    stats.averageToday = avgSensor.rows[0];

    // 2. Total penyiraman hari ini
    const totalIrrigation = await db.query(`
      SELECT COUNT(*) as total_count 
      FROM irrigation_logs 
      WHERE created_at >= CURRENT_DATE
    `);
    stats.totalIrrigationToday = totalIrrigation.rows[0].total_count;

    // 3. Status Terakhir
    const latest = await db.query('SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 1');
    stats.latestData = latest.rows[0];

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
