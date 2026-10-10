const express = require('express');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/assignments/assign
// @desc    Assign a coach to athletes
// @access  Private (Admin only)
router.post('/assign', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { coachId, athleteIds } = req.body;

    // Validate inputs
    if (!coachId || !Array.isArray(athleteIds) || athleteIds.length === 0) {
      return res.status(400).json({ message: 'Coach ID and athlete IDs are required' });
    }

    // Verify coach has COACH role
    const coach = await User.findById(coachId);
    if (!coach || coach.role !== 'COACH') {
      return res.status(400).json({ message: 'Invalid coach: user must have COACH role' });
    }

    // Verify all athletes have ATHLETE role
    const athletes = await User.find({ _id: { $in: athleteIds } });
    if (athletes.length !== athleteIds.length) {
      return res.status(400).json({ message: 'One or more athletes not found' });
    }
    
    const invalidAthletes = athletes.filter(a => a.role !== 'ATHLETE');
    if (invalidAthletes.length > 0) {
      return res.status(400).json({ message: 'All target users must have ATHLETE role' });
    }

    // Assign athletes to coach in a transaction
    const assignmentResults = [];
    for (const athlete of athletes) {
      const oldCoachId = athlete.assignedCoach;
      
      // Update athlete's assigned coach
      athlete.assignedCoach = coachId;
      await athlete.save();

      // Update coach's assigned athletes array
      if (!coach.assignedAthletes.includes(athlete._id)) {
        coach.assignedAthletes.push(athlete._id);
      }

      // Log audit
      await AuditLog.create({
        action: 'ASSIGN_COACH',
        actor: req.user._id,
        targetUser: athlete._id,
        oldValue: { assignedCoach: oldCoachId },
        newValue: { assignedCoach: coachId },
        metadata: { coachName: coach.name, athleteName: athlete.name }
      });

      assignmentResults.push({
        athleteId: athlete._id,
        athleteName: athlete.name,
        oldCoachId,
        newCoachId: coachId
      });
    }

    await coach.save();

    res.json({
      success: true,
      message: `Assigned ${athleteIds.length} athletes to coach`,
      assignments: assignmentResults
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/assignments/unassign
// @desc    Unassign a coach from an athlete
// @access  Private (Admin only)
router.post('/unassign', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { athleteId } = req.body;

    if (!athleteId) {
      return res.status(400).json({ message: 'Athlete ID is required' });
    }

    const athlete = await User.findById(athleteId);
    if (!athlete || athlete.role !== 'ATHLETE') {
      return res.status(400).json({ message: 'Invalid athlete' });
    }

    const oldCoachId = athlete.assignedCoach;
    if (!oldCoachId) {
      return res.status(400).json({ message: 'Athlete is not assigned to any coach' });
    }

    // Remove assignment from athlete
    athlete.assignedCoach = null;
    await athlete.save();

    // Remove athlete from coach's array
    const oldCoach = await User.findById(oldCoachId);
    if (oldCoach) {
      oldCoach.assignedAthletes = oldCoach.assignedAthletes.filter(
        id => id.toString() !== athleteId
      );
      await oldCoach.save();
    }

    // Log audit
    await AuditLog.create({
      action: 'UNASSIGN_COACH',
      actor: req.user._id,
      targetUser: athlete._id,
      oldValue: { assignedCoach: oldCoachId },
      newValue: { assignedCoach: null },
      metadata: { athleteName: athlete.name }
    });

    res.json({
      success: true,
      message: 'Unassigned athlete from coach'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/assignments
// @desc    Get all assignments
// @access  Private (Admin only)
router.get('/', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const athletes = await User.find({ role: 'ATHLETE' })
      .populate('assignedCoach', 'name email role')
      .select('name email role assignedCoach createdAt');

    const coaches = await User.find({ role: 'COACH' })
      .populate('assignedAthletes', 'name email role')
      .select('name email role assignedAthletes createdAt');

    res.json({
      success: true,
      athletes,
      coaches
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/assignments/coach/:coachId
// @desc    Get athletes assigned to a specific coach
// @access  Private (Admin or the coach themselves)
router.get('/coach/:coachId', protect, async (req, res) => {
  try {
    const { coachId } = req.params;

    // Authorization: Admin can see any coach, coaches can only see themselves
    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== coachId) {
      return res.status(403).json({ message: 'Not authorized to view this coach\'s assignments' });
    }

    const coach = await User.findById(coachId).populate('assignedAthletes', 'name email role profile');
    
    if (!coach || coach.role !== 'COACH') {
      return res.status(404).json({ message: 'Coach not found' });
    }

    res.json({
      success: true,
      coach: {
        id: coach._id,
        name: coach.name,
        email: coach.email,
        role: coach.role,
        assignedAthletes: coach.assignedAthletes
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
