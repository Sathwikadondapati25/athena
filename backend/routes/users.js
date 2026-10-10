const express = require('express');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper function to populate user data
const populateUserFields = [
  { path: 'assignedCoach', select: 'name email _id' },
  { path: 'assignedAthletes', select: 'name email _id' }
];

// @route   POST /api/users
// @desc    Create a new user (admin only)
// @access  Private/Admin
router.post('/', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user with admin-specified role
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'ATHLETE'
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Change user role (admin only)
// @access  Private/Admin
router.put('/:id/role', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { role } = req.body;
    const targetUserId = req.params.id;

    // Prevent admin from removing their own last-admin access
    if (targetUserId === req.user.id && role !== 'ADMIN') {
      // Check if there are other admins
      const adminCount = await User.countDocuments({ role: 'ADMIN' });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          message: 'Cannot remove the last admin. Create another admin first.' 
        });
      }
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log role change for audit
    const previousRole = user.role;
    user.role = role;
    user.roleChangeHistory = user.roleChangeHistory || [];
    user.roleChangeHistory.push({
      from: previousRole,
      to: role,
      changedBy: req.user.id,
      changedAt: new Date()
    });

    // Increment token version to invalidate all existing tokens
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    await user.save();

    // Log audit
    await AuditLog.create({
      action: 'ROLE_CHANGE',
      actor: req.user.id,
      targetUser: user._id,
      oldValue: { role: previousRole },
      newValue: { role },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/:id/deactivate
// @desc    Deactivate/activate user (admin only)
// @access  Private/Admin
router.put('/:id/deactivate', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { isActive } = req.body;
    const targetUserId = req.params.id;

    // Prevent admin from deactivating themselves
    if (targetUserId === req.user.id && !isActive) {
      return res.status(400).json({ 
        message: 'Cannot deactivate your own account.' 
      });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive !== undefined ? isActive : false;
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users
// @desc    Get all users (admin only) with pagination and filters
// @access  Private/Admin
router.get('/', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      role, 
      search, 
      pendingOnly = 'false' 
    } = req.query;

    const query = {};
    
    // Role filter
    if (role && role !== 'ALL') {
      query.role = role;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pending invites filter
    if (pendingOnly === 'true') {
      query.inviteToken = { $exists: true };
      query.inviteTokenExpire = { $gt: new Date() };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .populate(populateUserFields)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .lean(),
      User.countDocuments(query)
    ]);

    res.json({ 
      success: true, 
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate(populateUserFields);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, dateOfBirth, gender, college, sport, yearOfStudy, department, trainingLevel, emergencyContactName, emergencyContactPhone, designation, experience, accessLevel } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic fields
    if (name) user.name = name;
    
    // Store additional profile data in a profile object
    user.profile = {
      ...user.profile,
      phone,
      dateOfBirth,
      gender,
      college,
      sport,
      yearOfStudy,
      department,
      trainingLevel,
      emergencyContactName,
      emergencyContactPhone,
      designation,
      experience,
      accessLevel,
    };

    await user.save();

    res.json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/change-password
// @desc    Change current user's password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate(populateUserFields);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/:id/assign-coach
// @desc    Assign athlete to coach (admin only)
// @access  Private/Admin
router.put('/:id/assign-coach', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { coachId } = req.body;
    const athleteId = req.params.id;

    // Verify athlete exists and is an ATHLETE
    const athlete = await User.findById(athleteId);
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }
    if (athlete.role !== 'ATHLETE') {
      return res.status(400).json({ message: 'Can only assign athletes to coaches' });
    }

    // Verify coach exists and is a COACH
    const coach = await User.findById(coachId);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }
    if (coach.role !== 'COACH') {
      return res.status(400).json({ message: 'User is not a coach' });
    }

    // Remove athlete from previous coach's assignment if any
    if (athlete.assignedCoach) {
      const previousCoach = await User.findById(athlete.assignedCoach);
      if (previousCoach) {
        previousCoach.assignedAthletes = previousCoach.assignedAthletes.filter(
          id => id.toString() !== athleteId
        );
        await previousCoach.save();
      }
    }

    // Assign athlete to new coach
    athlete.assignedCoach = coachId;
    await athlete.save();

    // Add athlete to coach's assigned athletes list
    if (!coach.assignedAthletes) {
      coach.assignedAthletes = [];
    }
    if (!coach.assignedAthletes.includes(athleteId)) {
      coach.assignedAthletes.push(athleteId);
    }
    await coach.save();

    // Log audit
    await AuditLog.create({
      action: 'ASSIGN_COACH',
      actor: req.user.id,
      targetUser: athlete._id,
      oldValue: { assignedCoach: athlete.assignedCoach },
      newValue: { assignedCoach: coachId },
      metadata: { coachId, coachName: coach.name },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Athlete assigned to coach successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/:id/unassign-coach
// @desc    Unassign athlete from coach (admin only)
// @access  Private/Admin
router.put('/:id/unassign-coach', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const athleteId = req.params.id;

    const athlete = await User.findById(athleteId);
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }

    if (!athlete.assignedCoach) {
      return res.status(400).json({ message: 'Athlete is not assigned to any coach' });
    }

    // Remove athlete from coach's assignment list
    const coach = await User.findById(athlete.assignedCoach);
    if (coach) {
      coach.assignedAthletes = coach.assignedAthletes.filter(
        id => id.toString() !== athleteId
      );
      await coach.save();
    }

    // Clear athlete's coach assignment
    athlete.assignedCoach = null;
    await athlete.save();

    res.json({
      success: true,
      message: 'Athlete unassigned from coach successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/coach/:coachId/athletes
// @desc    Get all athletes assigned to a coach
// @access  Private
router.get('/coach/:coachId/athletes', protect, async (req, res) => {
  try {
    const coachId = req.params.coachId;

    // Verify authorization
    if (req.user.role === 'COACH' && req.user.id.toString() !== coachId) {
      return res.status(403).json({ message: 'Not authorized to view other coaches\' athletes' });
    }

    const coach = await User.findById(coachId).populate('assignedAthletes', '-password');
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    res.json({
      success: true,
      athletes: coach.assignedAthletes || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
