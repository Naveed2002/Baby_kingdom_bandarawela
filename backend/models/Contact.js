const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Resolved', 'Spam'],
    default: 'New'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  adminNotes: String,
  resolvedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);
