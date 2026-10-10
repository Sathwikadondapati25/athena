const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id, role, tokenVersion = 0) => {
  return jwt.sign({ id, role, tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate name is provided
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Please provide a name' });
    }

    // Validate role is provided
    if (!role) {
      return res.status(400).json({ message: 'Please select Athlete or Coach' });
    }

    // Trim and lowercase email, do NOT trim password
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password;

    // Check if user exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Validate role - only ATHLETE or COACH allowed via public registration
    // ADMIN accounts can only be created via seed or by another admin
    const validRoles = ['ATHLETE', 'COACH'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Please select Athlete or Coach' });
    }

    if (role === 'ADMIN') {
      return res.status(403).json({ message: 'Admin accounts can only be created by existing administrators' });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: normalizedPassword,
      role: role,
      isActive: true
    });

    // Generate token with role
    const token = generateToken(user._id, user.role, user.tokenVersion);

    res.status(201).json({
      success: true,
      token,
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

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Trim and lowercase email, do NOT trim password
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password;

    // Check for user
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'No account found with this email' });
    }

    // Check if account is active
    if (user.isActive === false) {
      return res.status(403).json({ message: 'Account deactivated. Please contact an administrator.' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(normalizedPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token with role
    const token = generateToken(user._id, user.role, user.tokenVersion);

    res.json({
      success: true,
      token,
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

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
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

// @route   POST /api/auth/forgot-password
// @desc    Forgot password - send reset token
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ 
        success: true, 
        message: 'If an account exists for this email, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpiry;
    await user.save();

    // In development, log the reset link (in production, send email)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    if (process.env.NODE_ENV === 'development') {
      // For development, return the reset link in response
      return res.json({
        success: true,
        message: 'If an account exists for this email, a password reset link has been sent.',
        resetUrl: resetUrl // Only in development
      });
    }

    // In production, email is not configured yet
    return res.status(503).json({
      message: 'Password reset is not configured. Please contact an administrator to reset your password.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/invite
// @desc    Invite a new user with specific role (admin only)
// @access  Private/Admin
router.post('/invite', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { email, role } = req.body;

    // Validate role
    if (!['ATHLETE', 'COACH', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteTokenExpiry = Date.now() + 86400000; // 24 hours

    // Create user with invite token (name not required yet, set on accept)
    const user = await User.create({
      email,
      role,
      inviteToken,
      inviteTokenExpire: inviteTokenExpiry,
      password: crypto.randomBytes(32).toString('hex'), // Temporary password, will be set on accept
      name: 'Pending Registration' // Temporary name, will be updated on accept
    });

    // Log audit
    await AuditLog.create({
      action: 'INVITE',
      actor: req.user.id,
      targetUser: user._id,
      targetEmail: email,
      newValue: { role },
      metadata: { inviteTokenExpiry },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // In development, log the invite link
    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invite/${inviteToken}`;

    if (process.env.NODE_ENV === 'development') {
      // For development, return the invite link in response
      return res.json({
        success: true,
        message: 'User invited successfully',
        inviteUrl: inviteUrl
      });
    }

    // In production, email is not configured yet
    return res.status(503).json({
      message: 'User invitation is not configured. Please contact technical support.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/accept-invite
// @desc    Accept invite and set password
// @access  Public
router.post('/accept-invite', async (req, res) => {
  try {
    const { token, name, password } = req.body;

    // Find user with valid invite token
    const user = await User.findOne({
      inviteToken: token,
      inviteTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired invite token' 
      });
    }

    // Set name and password
    user.name = name;
    user.password = password;
    user.inviteToken = undefined;
    user.inviteTokenExpire = undefined;
    await user.save();

    // Generate token for auto-login
    const tokenJwt = generateToken(user._id, user.role, user.tokenVersion);

    res.json({ 
      success: true, 
      message: 'Account created successfully',
      token: tokenJwt,
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

// @route   POST /api/auth/resend-invite/:userId
// @desc    Resend invite email (admin only)
// @access  Private/Admin
router.post('/resend-invite/:userId', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.inviteToken) {
      return res.status(400).json({ message: 'This user has already accepted their invite' });
    }

    // Generate new invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteTokenExpiry = Date.now() + 86400000; // 24 hours

    user.inviteToken = inviteToken;
    user.inviteTokenExpire = inviteTokenExpiry;
    await user.save();

    // In development, log the invite link
    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invite/${inviteToken}`;

    if (process.env.NODE_ENV === 'development') {
      // For development, return the invite link in response
      return res.json({
        success: true,
        message: 'Invite resent successfully',
        inviteUrl: inviteUrl
      });
    }

    // In production, email is not configured yet
    return res.status(503).json({
      message: 'User invitation is not configured. Please contact technical support.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/auth/invite/:userId
// @desc    Revoke/delete invite (admin only)
// @access  Private/Admin
router.delete('/invite/:userId', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.inviteToken) {
      return res.status(400).json({ message: 'This user has already accepted their invite' });
    }

    // Delete the user completely (remove pending invite)
    await User.findByIdAndDelete(userId);

    res.json({ 
      success: true, 
      message: 'Invite revoked successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
