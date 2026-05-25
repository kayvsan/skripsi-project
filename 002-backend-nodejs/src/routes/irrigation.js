const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/irrigation-logs - Ambil log penyiraman
router.get('/', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const result = await db.query(
      'SELECT * FROM irrigation_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
