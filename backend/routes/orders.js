const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticateToken, requireCustomer, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order (checkout)
// @access  Private/Customer
router.post('/', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product ${item.productId} not found or unavailable` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.mainImage
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Calculate shipping cost (basic calculation)
    const shippingCost = subtotal > 5000 ? 0 : 500; // Free shipping over Rs. 5000
    const tax = subtotal * 0.15; // 15% tax
    const total = subtotal + shippingCost + tax;

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      subtotal,
      shippingCost,
      tax,
      total,
      notes
    });

    await order.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        _id: order._id,
        orderNumber: order._id,
        total: order.total,
        status: order.orderStatus,
        estimatedDelivery: order.estimatedDelivery
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get customer's orders
// @access  Private/Customer
router.get('/my-orders', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.product', 'name mainImage')
      .select('-__v');

    const total = await Order.countDocuments({ user: req.user._id });

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
        hasNext: skip + orders.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID (customer can only see their own orders)
// @access  Private/Customer
router.get('/:id', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    })
    .populate('items.product', 'name mainImage description')
    .select('-__v');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order (customer can only cancel pending orders)
// @access  Private/Customer
router.put('/:id/cancel', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus !== 'Pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // Cancel order
    await order.updateStatus('Cancelled', { reason: 'Cancelled by customer' });

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error while cancelling order' });
  }
});

// ===== ADMIN ROUTES =====

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      search
    } = req.query;

    const filter = {};
    
    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) {
      filter.$or = [
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email phone')
      .populate('items.product', 'name mainImage')
      .select('-__v');

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
        hasNext: skip + orders.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, trackingNumber, estimatedDelivery, notes } = req.body;

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updates = {};
    if (status) updates.orderStatus = status;
    if (trackingNumber) updates.trackingNumber = trackingNumber;
    if (estimatedDelivery) updates.estimatedDelivery = estimatedDelivery;
    if (notes) updates.notes = notes;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error while updating order status' });
  }
});

module.exports = router;
