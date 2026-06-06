const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/fuzzy - Ambil riwayat keputusan fuzzy
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, startDate, endDate } = req.query;
    
    let baseQuery = `
      FROM fuzzy_decisions f
      LEFT JOIN sensor_data s ON f.sensor_data_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      params.push(startDate);
      baseQuery += ` AND COALESCE(f.created_at, s.created_at) >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      baseQuery += ` AND COALESCE(f.created_at, s.created_at) <= $${params.length}`;
    }

    // Get Total Count
    const countResult = await db.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countResult.rows[0].count);

    // Get Data
    let dataQuery = `
      SELECT 
        f.id,
        f.suhu_val, 
        f.kelembapan_udara_val, 
        f.kelembapan_tanah_val, 
        f.output_durasi,
        COALESCE(f.created_at, s.created_at) as created_at
      ${baseQuery}
      ORDER BY COALESCE(f.created_at, s.created_at) DESC
    `;
    
    params.push(limit);
    dataQuery += ` LIMIT $${params.length}`;
    
    params.push(offset);
    dataQuery += ` OFFSET $${params.length}`;

    const result = await db.query(dataQuery, params);
    
    res.json({
      data: result.rows,
      total: total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit) || 1
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
