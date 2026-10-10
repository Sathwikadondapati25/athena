const express = require('express');
const TrainingSession = require('../models/TrainingSession');
const Incident = require('../models/Incident');
const SymptomReport = require('../models/SymptomReport');
const RiskAssessment = require('../models/RiskAssessment');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/overview
// @desc    Get analytics overview (admin only)
// @access  Private/Admin
router.get('/overview', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSessions = await TrainingSession.countDocuments();
    const totalAssessments = await RiskAssessment.countDocuments();
    const totalIncidents = await Incident.countDocuments();
    
    const highRiskSessions = await TrainingSession.countDocuments({ 
      riskLevel: { $in: ['HIGH', 'VERY HIGH'] } 
    });

    // Risk distribution
    const riskDistribution = await RiskAssessment.aggregate([
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ]);

    // Incidents by month
    const incidentsByMonth = await Incident.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Incidents by sport
    const incidentsBySport = await Incident.aggregate([
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Common symptoms
    const commonSymptoms = await SymptomReport.aggregate([
      { $unwind: '$symptoms' },
      { $group: { _id: '$symptoms', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalSessions,
        totalAssessments,
        totalIncidents,
        highRiskSessions,
        riskDistribution,
        incidentsByMonth,
        incidentsBySport,
        commonSymptoms
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/risk-distribution
// @desc    Get risk distribution chart data
// @access  Private
router.get('/risk-distribution', protect, async (req, res) => {
  try {
    const distribution = await RiskAssessment.aggregate([
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ]);

    res.json({ success: true, data: distribution });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/incidents-by-month
// @desc    Get incidents by month
// @access  Private
router.get('/incidents-by-month', protect, async (req, res) => {
  try {
    const data = await Incident.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/incidents-by-sport
// @desc    Get incidents by sport
// @access  Private
router.get('/incidents-by-sport', protect, async (req, res) => {
  try {
    const data = await Incident.aggregate([
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
