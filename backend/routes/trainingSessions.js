const express = require('express');
const TrainingSession = require('../models/TrainingSession');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/training-sessions
// @desc    Create a training session
// @access  Private (Coach or Admin)
router.post('/', protect, authorize('COACH', 'ADMIN'), async (req, res) => {
  try {
    const sessionData = {
      ...req.body,
      createdBy: req.user.id
    };

    const session = await TrainingSession.create(sessionData);

    res.status(201).json({
      success: true,
      session
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/training-sessions
// @desc    Get all training sessions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let sessions;
    if (req.user.role === 'ADMIN') {
      // Admins see all sessions
      sessions = await TrainingSession.find().sort({ date: -1 });
    } else if (req.user.role === 'COACH') {
      // Coaches see sessions they created or are assigned to
      sessions = await TrainingSession.find({
        $or: [
          { createdBy: req.user._id },
          { coach: req.user._id }
        ]
      }).sort({ date: -1 });
    } else {
      // Athletes see sessions assigned to them (if implemented)
      sessions = await TrainingSession.find().sort({ date: -1 });
    }
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/training-sessions/today
// @desc    Get today's training sessions
// @access  Private
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions = await TrainingSession.find({
      date: { $gte: today, $lt: tomorrow }
    }).sort({ startTime: 1 });

    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/training-sessions/:id
// @desc    Update training session
// @access  Private (Coach or Admin)
router.put('/:id', protect, authorize('COACH', 'ADMIN'), async (req, res) => {
  try {
    const session = await TrainingSession.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/training-sessions/:id
// @desc    Delete training session
// @access  Private (Coach or Admin)
router.delete('/:id', protect, authorize('COACH', 'ADMIN'), async (req, res) => {
  try {
    const session = await TrainingSession.findByIdAndDelete(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ success: true, message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
