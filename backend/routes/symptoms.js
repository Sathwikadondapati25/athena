const express = require('express');
const SymptomReport = require('../models/SymptomReport');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/symptoms
// @desc    Report symptoms
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      userId: req.user.id
    };

    const report = await SymptomReport.create(reportData);

    res.status(201).json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/symptoms
// @desc    Get all symptom reports
// @access  Private (Coach or Admin)
router.get('/', protect, async (req, res) => {
  try {
    let reports;
    if (req.user.role === 'ADMIN' || req.user.role === 'COACH') {
      reports = await SymptomReport.find()
        .populate('userId', 'name email role')
        .sort({ reportedAt: -1 });
    } else {
      reports = await SymptomReport.find({ userId: req.user.id })
        .sort({ reportedAt: -1 });
    }
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/symptoms/:id
// @desc    Get single symptom report
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await SymptomReport.findById(req.params.id)
      .populate('userId', 'name email role');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check access
    if (req.user.role !== 'ADMIN' && req.user.role !== 'COACH' && 
        report.userId._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
