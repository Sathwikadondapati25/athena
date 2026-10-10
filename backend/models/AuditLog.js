const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['INVITE', 'RESEND_INVITE', 'REVOKE_INVITE', 'ROLE_CHANGE', 'ASSIGN_COACH', 'UNASSIGN_COACH', 'USER_DEACTIVATE', 'USER_ACTIVATE'],
    required: true
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  targetEmail: {
    type: String,
    required: false
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
});

// Index for efficient queries
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ actor: 1, timestamp: -1 });
auditLogSchema.index({ targetUser: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
