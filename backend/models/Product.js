const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  ageGroup: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  stock: { type: Number, required: true },
  minStock: { type: Number, default: 10 }, // Low stock threshold
  maxStock: { type: Number, default: 100 }, // Maximum stock capacity
  sku: { type: String, unique: true, sparse: true }, // Stock Keeping Unit
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    default: null
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    default: null
  },
  description: { type: String },
  tags: [{ type: String }],
  images: [{ type: String }],
  mainImage: { type: String },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastStockUpdate: { type: Date, default: Date.now }
}, { timestamps: true });

// Virtual for stock status
ProductSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out';
  if (this.stock <= this.minStock) return 'low';
  return 'good';
});

// Virtual for total value
ProductSchema.virtual('totalValue').get(function() {
  return this.stock * this.price;
});

// Generate SKU automatically if not provided
ProductSchema.pre('save', function(next) {
  if (!this.sku) {
    // Generate SKU based on category and name
    const categoryCode = this.category.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.sku = `${categoryCode}-${randomNum}`;
  }
  next();
});

// Index for search functionality
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, ageGroup: 1 });
ProductSchema.index({ sku: 1 });

module.exports = mongoose.model('Product', ProductSchema);
