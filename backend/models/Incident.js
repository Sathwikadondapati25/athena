const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  sport: {
    type: String,
    required: true
  },
  numberAffected: {
    type: Number,
    required: true
  },
  symptoms: [{
    type: String
  }],
  temperature: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  trainingDuration: {
    type: Number,
    required: true
  },
  trainingIntensity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  actionTaken: {
    type: String,
    required: true
  },
  medicalAssistance: {
    type: Boolean,
    required: true
  },
  outcome: {
    type: String
  },
  notes: {
    type: String
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Incident', incidentSchema);
