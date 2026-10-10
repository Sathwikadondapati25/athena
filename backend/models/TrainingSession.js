const mongoose = require('mongoose');

const trainingSessionSchema = new mongoose.Schema({
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
    default: true
  },
  shadeAvailable: {
    type: Boolean,
    default: true
  },
  temperature: {
    type: Number
  },
  humidity: {
    type: Number
  },
  weatherCondition: {
    type: String
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH', 'VERY HIGH']
  },
  recommendation: {
    type: String,
    enum: ['GO', 'MODIFY', 'NO-GO']
  },
  decision: {
    type: String,
    enum: ['GO', 'MODIFY', 'NO-GO', 'PENDING']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TrainingSession', trainingSessionSchema);
