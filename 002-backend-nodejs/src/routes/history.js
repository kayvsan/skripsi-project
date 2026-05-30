const express = require('express');
const router = express.Router();
const db = require('../db');
const { createObjectCsvStringifier } = require('csv-writer');

// GET /api/history - Ambil data history sensor
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, startDate, endDate } = req.query;
    
    let query = 'SELECT * FROM sensor_data WHERE 1=1';
    const params = [];

    if (startDate) {
      params.push(startDate);
      query += ` AND created_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND created_at <= $${params.length}`;
    }

    params.push(limit);
    query += ` ORDER BY created_at DESC LIMIT $${params.length}`;
    
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/history/download - Download data history dalam format CSV
router.get('/download', async (req, res) => {
  try {
    const result = await db.query('SELECT created_at as waktu, suhu, kelembapan_udara, kelembapan_tanah FROM sensor_data ORDER BY created_at DESC');
    
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'waktu', title: 'Waktu' },
        { id: 'suhu', title: 'Suhu (C)' },
        { id: 'kelembapan_udara', title: 'Kelembapan Udara (%)' },
        { id: 'kelembapan_tanah', title: 'Kelembapan Tanah (%)' },
      ]
    });

    const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(result.rows);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=history_sensor.csv');
    res.status(200).send(csvString);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate CSV' });
  }
});

module.exports = router;
