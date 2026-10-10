const express = require('express');
const User = require('../models/User');
const TrainingSession = require('../models/TrainingSession');
const SymptomReport = require('../models/SymptomReport');
const Incident = require('../models/Incident');
const RiskAssessment = require('../models/RiskAssessment');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/stats/admin
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/admin', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const [
      totalUsers,
      admins,
      coaches,
      athletes,
      unassignedAthletes,
      coachesWithNoAthletes,
      pendingInvites,
      totalSessions,
      totalRiskAssessments,
      totalIncidents,
      totalSymptomReports,
      activeIncidents
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'ADMIN', isActive: true }),
      User.countDocuments({ role: 'COACH', isActive: true }),
      User.countDocuments({ role: 'ATHLETE', isActive: true }),
      User.countDocuments({ role: 'ATHLETE', assignedCoach: { $exists: false }, isActive: true }),
      User.countDocuments({ role: 'COACH', isActive: true, assignedAthletes: { $size: 0 } }),
      User.countDocuments({ inviteToken: { $exists: true }, isActive: false }),
      TrainingSession.countDocuments(),
      RiskAssessment.countDocuments(),
      Incident.countDocuments(),
      SymptomReport.countDocuments(),
      Incident.countDocuments({ status: 'active' })
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        admins,
        coaches,
        athletes,
        unassignedAthletes,
        coachesWithNoAthletes,
        pendingInvites,
        totalSessions,
        totalRiskAssessments,
        totalIncidents,
        totalSymptomReports,
        activeIncidents
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/stats/coach
// @desc    Get coach dashboard statistics
// @access  Private (Coach only)
router.get('/coach', protect, authorize('COACH'), async (req, res) => {
  try {
    const coachId = req.user._id;

    // Get all assigned athlete IDs
    const assignedAthleteIds = await User.find({ assignedCoach: coachId, role: 'ATHLETE' }).distinct('_id');

    const [
      assignedAthletes,
      trainingSessions,
      symptomReports,
      incidents
    ] = await Promise.all([
      User.countDocuments({ assignedCoach: coachId, role: 'ATHLETE', isActive: true }),
      TrainingSession.countDocuments({ coach: coachId }),
      SymptomReport.countDocuments({ userId: { $in: assignedAthleteIds } }),
      Incident.countDocuments({ reportedBy: { $in: assignedAthleteIds } })
    ]);

    res.json({
      success: true,
      stats: {
        assignedAthletes,
        trainingSessions,
        symptomReports,
        incidents
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/stats/athlete
// @desc    Get athlete dashboard statistics
// @access  Private (Athlete only)
router.get('/athlete', protect, authorize('ATHLETE'), async (req, res) => {
  try {
    const athleteId = req.user._id;

    const [
      trainingSessions,
      riskAssessments,
      symptomReports,
      incidents
    ] = await Promise.all([
      TrainingSession.countDocuments({ athlete: athleteId }),
      RiskAssessment.countDocuments({ athlete: athleteId }),
      SymptomReport.countDocuments({ userId: athleteId }),
      Incident.countDocuments({ reportedBy: athleteId })
    ]);

    res.json({
      success: true,
      stats: {
        trainingSessions,
        riskAssessments,
        symptomReports,
        incidents
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
