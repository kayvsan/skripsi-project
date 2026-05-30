const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/fuzzy - Ambil riwayat keputusan fuzzy
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, startDate, endDate } = req.query;
    let query = `
      SELECT 
        f.id,
        f.suhu_val, 
        f.kelembapan_udara_val, 
        f.kelembapan_tanah_val, 
        f.output_durasi,
        COALESCE(f.created_at, s.created_at) as created_at
      FROM fuzzy_decisions f
      LEFT JOIN sensor_data s ON f.sensor_data_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      params.push(startDate);
      query += ` AND COALESCE(f.created_at, s.created_at) >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND COALESCE(f.created_at, s.created_at) <= $${params.length}`;
    }

    params.push(limit);
    query += ` ORDER BY COALESCE(f.created_at, s.created_at) DESC LIMIT $${params.length}`;
    
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
