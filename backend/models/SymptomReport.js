const mongoose = require('mongoose');

const symptomReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symptoms: [{
    type: String,
    enum: ['Dizziness', 'Headache', 'Excessive fatigue', 'Muscle cramps', 'Nausea/vomiting', 'Weakness', 'Confusion', 'Fainting', 'Other']
  }],
  otherSymptoms: {
    type: String
  },
  severity: {
    type: String,
    enum: ['Mild', 'Moderate', 'Severe']
  },
  reportedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
});

module.exports = mongoose.model('SymptomReport', symptomReportSchema);
