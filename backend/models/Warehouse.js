const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 0
  },
  manager: {
    type: String,
    required: true,
    trim: true
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Sri Lanka' }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  operatingHours: {
    type: String,
    default: '9:00 AM - 6:00 PM'
  }
}, {
  timestamps: true
});

// Virtual for occupied space calculation (will be calculated from products)
warehouseSchema.virtual('occupied').get(function() {
  // This would be calculated based on products assigned to this warehouse
  return 0; // Placeholder
});

// Index for search functionality
warehouseSchema.index({ name: 'text', location: 'text', manager: 'text' });

module.exports = mongoose.model('Warehouse', warehouseSchema);