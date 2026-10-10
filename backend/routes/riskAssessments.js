const express = require('express');
const RiskAssessment = require('../models/RiskAssessment');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Risk calculation engine
const calculateRisk = (data) => {
  const { temperature, humidity, duration, intensity, hydrationAvailable, shadeAvailable, weatherWarning } = data;
  
  let riskScore = 0;
  const factors = [];

  // Temperature factor
  if (temperature >= 40) {
    riskScore += 4;
    factors.push('Extreme temperature (≥40°C)');
  } else if (temperature >= 35) {
    riskScore += 3;
    factors.push('High temperature (35-39°C)');
  } else if (temperature >= 30) {
    riskScore += 2;
    factors.push('Moderate temperature (30-34°C)');
  } else if (temperature >= 25) {
    riskScore += 1;
    factors.push('Warm temperature (25-29°C)');
  }

  // Humidity factor
  if (humidity >= 80) {
    riskScore += 2;
    factors.push('Very high humidity (≥80%)');
  } else if (humidity >= 60) {
    riskScore += 1;
    factors.push('High humidity (60-79%)');
  }

  // Duration factor
  if (duration >= 120) {
    riskScore += 2;
    factors.push('Long duration (≥120 min)');
  } else if (duration >= 90) {
    riskScore += 1;
    factors.push('Extended duration (90-119 min)');
  }

  // Intensity factor
  if (intensity === 'High') {
    riskScore += 2;
    factors.push('High intensity training');
  } else if (intensity === 'Medium') {
    riskScore += 1;
    factors.push('Medium intensity training');
  }

  // Safety factors
  if (!hydrationAvailable) {
    riskScore += 2;
    factors.push('No hydration available');
  }
  if (!shadeAvailable) {
    riskScore += 1;
    factors.push('No shade/rest available');
  }

  // Weather warning
  if (weatherWarning) {
    riskScore += 2;
    factors.push('Weather warning in effect');
  }

  // Determine risk level
  let riskLevel;
  if (riskScore >= 8) {
    riskLevel = 'VERY HIGH';
  } else if (riskScore >= 5) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 3) {
    riskLevel = 'MODERATE';
  } else {
    riskLevel = 'LOW';
  }

  // Determine recommendation
  let recommendation;
  if (riskLevel === 'VERY HIGH') {
    recommendation = 'NO-GO';
  } else if (riskLevel === 'HIGH') {
    recommendation = 'MODIFY';
  } else if (riskLevel === 'MODERATE') {
    recommendation = 'MODIFY';
  } else {
    recommendation = 'GO';
  }

  return { riskLevel, recommendation, factors };
};

// @route   POST /api/risk-assessments
// @desc    Create a risk assessment
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const assessmentData = {
      ...req.body,
      assessedBy: req.user.id
    };

    // Calculate risk
    const { riskLevel, recommendation, factors } = calculateRisk(req.body);
    assessmentData.riskLevel = riskLevel;
    assessmentData.recommendation = recommendation;
    assessmentData.factors = factors;

    const assessment = await RiskAssessment.create(assessmentData);

    res.status(201).json({
      success: true,
      assessment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/risk-assessments
// @desc    Get all risk assessments for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const assessments = await RiskAssessment.find({ assessedBy: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ success: true, assessments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/risk-assessments/:id
// @desc    Get single risk assessment
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const assessment = await RiskAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
