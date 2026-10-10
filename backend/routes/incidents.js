const express = require('express');
const Incident = require('../models/Incident');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/incidents
// @desc    Record an incident
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const incidentData = {
      ...req.body,
      reportedBy: req.user.id
    };

    const incident = await Incident.create(incidentData);

    res.status(201).json({
      success: true,
      incident
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/incidents
// @desc    Get all incidents
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let incidents;
    if (req.user.role === 'ADMIN' || req.user.role === 'COACH') {
      incidents = await Incident.find()
        .populate('reportedBy', 'name email role')
        .sort({ date: -1 });
    } else {
      incidents = await Incident.find({ reportedBy: req.user.id })
        .sort({ date: -1 });
    }
    res.json({ success: true, incidents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/incidents/:id
// @desc    Get single incident
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'name email role');
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.json({ success: true, incident });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
