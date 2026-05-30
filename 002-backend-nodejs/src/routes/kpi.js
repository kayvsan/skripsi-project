const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/kpi - Ambil data KPI Analytics
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Helper function to build WHERE clause
    const buildWhereClause = (tablePrefix = '') => {
      let clause = 'WHERE 1=1';
      const params = [];
      if (startDate) {
        params.push(startDate);
        clause += ` AND ${tablePrefix}created_at >= $${params.length}`;
      }
      if (endDate) {
        params.push(endDate);
        clause += ` AND ${tablePrefix}created_at <= $${params.length}`;
      }
      return { clause, params };
    };

    const kpiData = {};

    // 1. Daily Averages
    const dailyAvgQuery = buildWhereClause();
    const dailyAvg = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as date, 
        AVG(suhu) as avg_suhu, 
        AVG(kelembapan_udara) as avg_hum, 
        AVG(kelembapan_tanah) as avg_soil 
      FROM sensor_data 
      ${dailyAvgQuery.clause}
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY date ASC
    `, dailyAvgQuery.params);
    kpiData.dailyAverages = dailyAvg.rows;

    // 2. Ideal Zone Percentage (40-70%)
    const idealZoneQuery = buildWhereClause();
    const idealZone = await db.query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN kelembapan_tanah BETWEEN 40 AND 70 THEN 1 END) as ideal_records
      FROM sensor_data
      ${idealZoneQuery.clause}
    `, idealZoneQuery.params);
    
    const total = parseInt(idealZone.rows[0].total_records);
    const ideal = parseInt(idealZone.rows[0].ideal_records);
    kpiData.idealZonePercentage = total > 0 ? (ideal / total) * 100 : 0;

    // 3. Daily Irrigation (Frequency and Total Duration)
    const dailyIrrigationQuery = buildWhereClause();
    const dailyIrrigation = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as date, 
        COUNT(*) as frequency, 
        SUM(durasi) as total_duration 
      FROM irrigation_logs 
      ${dailyIrrigationQuery.clause}
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY date ASC
    `, dailyIrrigationQuery.params);
    kpiData.dailyIrrigation = dailyIrrigation.rows;

    // 4. Fuzzy Distribution
    const fuzzyDistQuery = buildWhereClause('f.');
    // Since fuzzy_decisions might not have created_at populated properly, we join with sensor_data if needed, but schema says it has created_at
    // But earlier I noticed fuzzy_decisions created_at might be missing or relying on DB default. The schema says it has DEFAULT CURRENT_TIMESTAMP, so it's safe to query directly.
    const fuzzyDistribution = await db.query(`
      SELECT 
        CASE 
          WHEN output_durasi <= 25 THEN 'Tidak Perlu'
          WHEN output_durasi <= 50 THEN 'Sedikit'
          WHEN output_durasi <= 75 THEN 'Sedang'
          ELSE 'Banyak'
        END as category,
        COUNT(*) as count
      FROM fuzzy_decisions f
      ${fuzzyDistQuery.clause}
      GROUP BY category
    `, fuzzyDistQuery.params);
    
    kpiData.fuzzyDistribution = fuzzyDistribution.rows;

    res.json(kpiData);
  } catch (err) {
    console.error('Error fetching KPI data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
