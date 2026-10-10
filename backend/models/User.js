const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['ATHLETE', 'COACH', 'ADMIN'],
    default: 'ATHLETE'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  assignedCoach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedAthletes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  roleChangeHistory: [{
    from: String,
    to: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: Date
  }],
  tokenVersion: {
    type: Number,
    default: 0
  },
  inviteToken: String,
  inviteTokenExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  profile: {
    phone: String,
    dateOfBirth: Date,
    gender: String,
    college: String,
    sport: String,
    yearOfStudy: String,
    department: String,
    trainingLevel: String,
    emergencyContactName: String,
    emergencyContactPhone: String,
    designation: String,
    experience: String,
    accessLevel: String,
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
