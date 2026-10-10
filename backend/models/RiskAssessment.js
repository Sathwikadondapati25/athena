const mongoose = require('mongoose');

const riskAssessmentSchema = new mongoose.Schema({
  sport: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  intensity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  numberOfAthletes: {
    type: Number,
    required: true
  },
  hydrationAvailable: {
    type: Boolean,
    required: true
  },
  shadeAvailable: {
    type: Boolean,
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  weatherCondition: {
    type: String,
    required: true
  },
  weatherWarning: {
    type: String
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH', 'VERY HIGH'],
    required: true
  },
  recommendation: {
    type: String,
    enum: ['GO', 'MODIFY', 'NO-GO'],
    required: true
  },
  factors: {
    type: [String]
  },
  assessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema);
