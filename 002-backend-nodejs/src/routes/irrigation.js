const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/irrigation-logs - Ambil log penyiraman
router.get('/', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const countResult = await db.query('SELECT COUNT(*) FROM irrigation_logs');
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      'SELECT * FROM irrigation_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
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
