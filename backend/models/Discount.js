const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  minOrderValue: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: null // For percentage discounts
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'paused', 'scheduled'],
    default: 'scheduled'
  },
  applicableProducts: {
    type: String,
    enum: ['all', 'baby-care', 'clothing', 'toys', 'accessories', 'gifts'],
    default: 'all'
  },
  customerType: {
    type: String,
    enum: ['all', 'new', 'returning'],
    default: 'all'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual to calculate if discount is currently active
discountSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now &&
         (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Method to increment usage count
discountSchema.methods.incrementUsage = function() {
  this.usedCount += 1;
  return this.save();
};

// Method to check if discount can be used
discountSchema.methods.canBeUsed = function(orderValue, customerType = 'all') {
  const now = new Date();
  
  // Check if discount is active and within date range
  if (this.status !== 'active' || this.startDate > now || this.endDate < now) {
    return false;
  }
  
  // Check usage limit
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    return false;
  }
  
  // Check minimum order value
  if (orderValue < this.minOrderValue) {
    return false;
  }
  
  // Check customer type eligibility
  if (this.customerType !== 'all' && this.customerType !== customerType) {
    return false;
  }
  
  return true;
};

// Method to calculate discount amount
discountSchema.methods.calculateDiscount = function(orderValue) {
  if (!this.canBeUsed(orderValue)) {
    return 0;
  }
  
  let discount = 0;
  
  if (this.type === 'percentage') {
    discount = (orderValue * this.value) / 100;
    // Apply maximum discount limit if set
    if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
  } else if (this.type === 'fixed') {
    discount = this.value;
    // Don't allow discount to exceed order value
    if (discount > orderValue) {
      discount = orderValue;
    }
  }
  
  return discount;
};

// Index for search functionality
discountSchema.index({ code: 1 });
discountSchema.index({ status: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Discount', discountSchema);