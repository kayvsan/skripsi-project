const express = require('express');
const cors = require('cors');
require('dotenv').config();

const historyRoutes = require('./routes/history');
const irrigationRoutes = require('./routes/irrigation');
const statsRoutes = require('./routes/stats');
const fuzzyRoutes = require('./routes/fuzzy');
const kpiRoutes = require('./routes/kpi');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/history', historyRoutes);
app.use('/api/irrigation-logs', irrigationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/fuzzy', fuzzyRoutes);
app.use('/api/kpi', kpiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Node.js Backend is running on port ${PORT}`);
});
