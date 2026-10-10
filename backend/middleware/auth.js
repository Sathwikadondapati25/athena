const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(403).json({ message: 'User account has been deactivated' });
    }

    // Check token version to invalidate tokens on role changes
    if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ message: 'Token has been invalidated. Please login again.' });
    }

    // Attach user to request - role is always read from DB for immediate role changes
    req.user = user;
    
    // Add Cache-Control header to prevent caching of authenticated responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

// Check if user owns the resource or is authorized (Coach or Admin)
exports.authorizeOwnerOrCoach = (userIdField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    // Admin can access everything
    if (req.user.role === 'ADMIN') {
      return next();
    }
    
    // Coach can access if resource belongs to their assigned athletes
    if (req.user.role === 'COACH') {
      // Coach can access their own data
      if (resourceUserId === req.user.id.toString()) {
        return next();
      }
      // Coach can access data of their assigned athletes
      if (req.user.assignedAthletes && req.user.assignedAthletes.includes(resourceUserId)) {
        return next();
      }
      return res.status(403).json({ message: 'Not authorized to access this resource' });
    }
    
    // Athlete can only access their own data
    if (req.user.role === 'ATHLETE') {
      if (resourceUserId === req.user.id.toString()) {
        return next();
      }
      return res.status(403).json({ message: 'Not authorized to access this resource' });
    }
    
    return res.status(403).json({ message: 'Not authorized to access this resource' });
  };
};

// Check if user is a coach and the athlete is assigned to them
exports.authorizeCoachAssignment = (athleteIdField = 'athleteId') => {
  return (req, res, next) => {
    const athleteId = req.params[athleteIdField] || req.body[athleteIdField];
    
    // Admin can access everything
    if (req.user.role === 'ADMIN') {
      return next();
    }
    
    // Coach can only access their assigned athletes
    if (req.user.role === 'COACH') {
      if (req.user.assignedAthletes && req.user.assignedAthletes.includes(athleteId)) {
        return next();
      }
      return res.status(403).json({ message: 'Athlete is not assigned to this coach' });
    }
    
    // Athletes cannot access other athletes' data
    return res.status(403).json({ message: 'Not authorized to access this resource' });
  };
};
