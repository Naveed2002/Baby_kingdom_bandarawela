const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: String
});

const shippingAddressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: String,
  country: {
    type: String,
    default: 'Sri Lanka'
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'Stripe', 'PayPal'],
    default: 'Cash on Delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  notes: String,
  trackingNumber: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancelReason: String
}, {
  timestamps: true
});

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('shippingCost') || this.isModified('tax')) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.total = this.subtotal + this.shippingCost + this.tax;
  }
  next();
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus, additionalData = {}) {
  this.orderStatus = newStatus;
  
  switch (newStatus) {
    case 'Delivered':
      this.deliveredAt = new Date();
      break;
    case 'Cancelled':
      this.cancelledAt = new Date();
      if (additionalData.reason) {
        this.cancelReason = additionalData.reason;
      }
      break;
  }
  
  return this.save();
};

module.exports = mongoose.model('Order', orderSchema);
