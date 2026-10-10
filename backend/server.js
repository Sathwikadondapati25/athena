const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3003',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/athena')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/risk-assessments', require('./routes/riskAssessments'));
app.use('/api/training-sessions', require('./routes/trainingSessions'));
app.use('/api/symptoms', require('./routes/symptoms'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ATHENA API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
