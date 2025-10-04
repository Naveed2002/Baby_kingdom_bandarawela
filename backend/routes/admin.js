const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Contact = require('../models/Contact');
const Supplier = require('../models/Supplier');
const Warehouse = require('../models/Warehouse');
const Discount = require('../models/Discount');
const mongoose = require('mongoose');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const totalContacts = await Contact.countDocuments({ status: 'New' });

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .select('total orderStatus createdAt');

    // Get recent contacts
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject status createdAt');

    // Get sales data for last 30 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 30);

    const recentSales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          orderStatus: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$total" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      {
        $unwind: "$items"
      },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      {
        $sort: { totalSold: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },
      {
        $project: {
          name: "$product.name",
          mainImage: "$product.mainImage",
          totalSold: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.json({
      statistics: {
        totalUsers,
        totalProducts,
        totalOrders,
        pendingOrders,
        totalContacts
      },
      recentOrders,
      recentContacts,
      recentSales,
      topProducts
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with enhanced customer data (Admin only)
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100, // Increased default limit for admin customers view
      role = 'customer', // Default to customers only
      search,
      isActive
    } = req.query;

    const filter = { role }; // Filter for customers by default
    
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users with order aggregation
    const usersWithOrders = await User.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $addFields: {
          totalSpent: { $sum: '$orders.total' },
          orderCount: { $size: '$orders' },
          lastOrder: { $max: '$orders.createdAt' },
          loyaltyPoints: { $multiply: [{ $sum: '$orders.total' }, 0.01] } // 1% of total spent as points
        }
      },
      {
        $addFields: {
          customerGroup: {
            $switch: {
              branches: [
                { case: { $gt: ['$totalSpent', 50000] }, then: 'VIP' },
                { case: { $gt: ['$totalSpent', 20000] }, then: 'Premium' },
              ],
              default: 'Regular'
            }
          }
        }
      },
      {
        $project: {
          password: 0,
          __v: 0,
          verificationToken: 0,
          verificationTokenExpires: 0,
          resetPasswordToken: 0,
          resetPasswordExpires: 0
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    const total = await User.countDocuments(filter);

    res.json({
      users: usersWithOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        hasNext: skip + usersWithOrders.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user by ID (Admin only)
// @access  Private/Admin
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's orders
    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('total orderStatus createdAt');

    res.json({
      user,
      orders
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (Admin only)
// @access  Private/Admin
router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot modify admin user status' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: 'User status updated successfully',
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error while updating user status' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    // Check if user has orders
    const hasOrders = await Order.exists({ user: user._id });
    if (hasOrders) {
      return res.status(400).json({ message: 'Cannot delete user with existing orders' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

// @route   POST /api/admin/users
// @desc    Create admin user (Admin only)
// @access  Private/Admin
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, phone, role = 'customer' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      role
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error while creating user' });
  }
});

// @route   GET /api/admin/users/stats
// @desc    Get customer statistics (Admin only)
// @access  Private/Admin
router.get('/users/stats', async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    
    // Get new customers this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const newThisMonth = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: currentMonth }
    });
    
    // Calculate VIP customers (those with total orders > 50000)
    const vipCustomersResult = await Order.aggregate([
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$total' }
        }
      },
      {
        $match: {
          totalSpent: { $gt: 50000 }
        }
      },
      {
        $count: 'vipCount'
      }
    ]);
    const vipCustomers = vipCustomersResult[0]?.vipCount || 0;
    
    // Calculate active customers (those with orders in last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const activeCustomers = await Order.distinct('user', {
      createdAt: { $gte: threeMonthsAgo }
    }).then(users => users.length);
    
    res.json({
      total: totalCustomers,
      newThisMonth,
      vip: vipCustomers,
      active: activeCustomers
    });
  } catch (error) {
    console.error('Customer stats error:', error);
    res.status(500).json({ message: 'Server error while fetching customer stats' });
  }
});

// ===== INVENTORY ROUTES =====

// @route   GET /api/admin/inventory/overview
// @desc    Get inventory overview statistics
// @access  Private/Admin
router.get('/inventory/overview', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({ 
      isActive: true,
      $expr: { $lte: ['$stock', '$minStock'] }
    });
    const outOfStockProducts = await Product.countDocuments({ 
      isActive: true,
      stock: 0
    });
    
    // Calculate total inventory value
    const totalValueResult = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalValue: { $sum: { $multiply: ['$stock', '$price'] } } } }
    ]);
    const totalValue = totalValueResult[0]?.totalValue || 0;
    
    res.json({
      overview: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalValue,
        lowStockThreshold: 10
      }
    });
  } catch (error) {
    console.error('Inventory overview error:', error);
    res.status(500).json({ message: 'Server error while fetching inventory overview' });
  }
});

// @route   GET /api/admin/inventory/products
// @desc    Get inventory products with stock information
// @access  Private/Admin
router.get('/inventory/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter
    let filter = { isActive: true };
    
    if (status && status !== 'all') {
      if (status === 'low') {
        filter.$expr = { $lte: ['$stock', '$minStock'] };
      } else if (status === 'out') {
        filter.stock = 0;
      } else if (status === 'good') {
        filter.$expr = { $gt: ['$stock', '$minStock'] };
        filter.stock = { $gt: 0 };
      }
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    const products = await Product.find(filter)
      .populate('supplier', 'name')
      .populate('warehouse', 'name location')
      .select('name sku category stock minStock maxStock price totalValue supplier warehouse lastStockUpdate')
      .sort({ lastStockUpdate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Transform data to match frontend expectations
    const transformedProducts = products.map(product => ({
      id: product._id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      currentStock: product.stock,
      minStock: product.minStock,
      maxStock: product.maxStock,
      unitPrice: product.price,
      totalValue: product.stock * product.price,
      supplier: product.supplier?.name || 'Not assigned',
      warehouse: product.warehouse?.name || 'Not assigned',
      lastUpdated: product.lastStockUpdate.toISOString().split('T')[0],
      status: product.stock === 0 ? 'out' : (product.stock <= product.minStock ? 'low' : 'good')
    }));
    
    const total = await Product.countDocuments(filter);
    
    res.json({
      products: transformedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total
      }
    });
  } catch (error) {
    console.error('Inventory products error:', error);
    res.status(500).json({ message: 'Server error while fetching inventory products' });
  }
});

// @route   PUT /api/admin/inventory/products/:id/stock
// @desc    Update product stock
// @access  Private/Admin
router.put('/inventory/products/:id/stock', async (req, res) => {
  try {
    const { stock, reason } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const oldStock = product.stock;
    product.stock = stock;
    product.lastStockUpdate = new Date();
    
    await product.save();
    
    // TODO: Log stock change for audit trail
    console.log(`Stock updated for ${product.name}: ${oldStock} -> ${stock}, Reason: ${reason}`);
    
    res.json({ message: 'Stock updated successfully', product });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Server error while updating stock' });
  }
});

// ===== SUPPLIER ROUTES =====

// @route   GET /api/admin/suppliers
// @desc    Get all suppliers
// @access  Private/Admin
router.get('/suppliers', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;
    
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } }
      ];
    }
    
    const suppliers = await Supplier.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Count products for each supplier
    const suppliersWithProductCount = await Promise.all(
      suppliers.map(async (supplier) => {
        const productCount = await Product.countDocuments({ supplier: supplier._id });
        return {
          id: supplier._id,
          name: supplier.name,
          contact: supplier.contact,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          products: productCount,
          status: supplier.status,
          rating: supplier.rating,
          lastOrder: supplier.lastOrderDate ? supplier.lastOrderDate.toISOString().split('T')[0] : 'Never'
        };
      })
    );
    
    const total = await Supplier.countDocuments(filter);
    
    res.json({
      suppliers: suppliersWithProductCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalSuppliers: total
      }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ message: 'Server error while fetching suppliers' });
  }
});

// @route   POST /api/admin/suppliers
// @desc    Create new supplier
// @access  Private/Admin
router.post('/suppliers', async (req, res) => {
  try {
    const { name, contact, email, phone, address, rating = 0 } = req.body;
    
    const supplier = new Supplier({
      name,
      contact,
      email,
      phone,
      address,
      rating
    });
    
    await supplier.save();
    
    res.status(201).json({
      message: 'Supplier created successfully',
      supplier
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ message: 'Server error while creating supplier' });
  }
});

// ===== WAREHOUSE ROUTES =====

// @route   GET /api/admin/warehouses
// @desc    Get all warehouses
// @access  Private/Admin
router.get('/warehouses', async (req, res) => {
  try {
    const warehouses = await Warehouse.find({ status: 'active' })
      .sort({ createdAt: -1 });
    
    // Calculate occupied space for each warehouse
    const warehousesWithOccupancy = await Promise.all(
      warehouses.map(async (warehouse) => {
        const productCount = await Product.countDocuments({ warehouse: warehouse._id });
        // Simulate occupied space calculation (in a real app, this would be based on actual product dimensions)
        const estimatedOccupied = Math.min(productCount * 50, warehouse.capacity); // 50 units per product as estimate
        
        return {
          id: warehouse._id,
          name: warehouse.name,
          location: warehouse.location,
          capacity: warehouse.capacity,
          occupied: estimatedOccupied,
          manager: warehouse.manager,
          contact: warehouse.contact
        };
      })
    );
    
    res.json({ warehouses: warehousesWithOccupancy });
  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({ message: 'Server error while fetching warehouses' });
  }
});

// @route   POST /api/admin/warehouses
// @desc    Create new warehouse
// @access  Private/Admin
router.post('/warehouses', async (req, res) => {
  try {
    const { name, location, capacity, manager, contact, email } = req.body;
    
    const warehouse = new Warehouse({
      name,
      location,
      capacity,
      manager,
      contact,
      email
    });
    
    await warehouse.save();
    
    res.status(201).json({
      message: 'Warehouse created successfully',
      warehouse
    });
  } catch (error) {
    console.error('Create warehouse error:', error);
    res.status(500).json({ message: 'Server error while creating warehouse' });
  }
});

// ===== DISCOUNT/COUPON ROUTES =====

// @route   GET /api/admin/discounts/overview
// @desc    Get discount overview statistics
// @access  Private/Admin
router.get('/discounts/overview', async (req, res) => {
  try {
    const totalCoupons = await Discount.countDocuments();
    const activeCoupons = await Discount.countDocuments({ status: 'active' });
    const expiredCoupons = await Discount.countDocuments({ status: 'expired' });
    
    // Calculate total savings (simplified - in real app, would track actual usage)
    const totalSavingsResult = await Discount.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, totalSavings: { $sum: { $multiply: ['$usedCount', '$value'] } } } }
    ]);
    const totalSavings = totalSavingsResult[0]?.totalSavings || 0;
    
    res.json({
      overview: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        usedCoupons: await Discount.countDocuments({ usedCount: { $gt: 0 } }),
        totalSavings
      }
    });
  } catch (error) {
    console.error('Discount overview error:', error);
    res.status(500).json({ message: 'Server error while fetching discount overview' });
  }
});

// @route   GET /api/admin/discounts
// @desc    Get all discount coupons
// @access  Private/Admin
router.get('/discounts', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;
    
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const coupons = await Discount.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const transformedCoupons = coupons.map(coupon => ({
      id: coupon._id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
      minOrderValue: coupon.minOrderValue,
      startDate: coupon.startDate.toISOString().split('T')[0],
      endDate: coupon.endDate.toISOString().split('T')[0],
      status: coupon.status,
      applicableProducts: coupon.applicableProducts,
      customerType: coupon.customerType
    }));
    
    const total = await Discount.countDocuments(filter);
    
    res.json({
      coupons: transformedCoupons,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalCoupons: total
      }
    });
  } catch (error) {
    console.error('Get discounts error:', error);
    res.status(500).json({ message: 'Server error while fetching discounts' });
  }
});

// @route   POST /api/admin/discounts
// @desc    Create new discount coupon
// @access  Private/Admin
router.post('/discounts', async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      description,
      usageLimit,
      minOrderValue,
      startDate,
      endDate,
      applicableProducts,
      customerType
    } = req.body;
    
    // Check if coupon code already exists
    const existingCoupon = await Discount.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    
    const discount = new Discount({
      code: code.toUpperCase(),
      type,
      value,
      description,
      usageLimit,
      minOrderValue: minOrderValue || 0,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      applicableProducts: applicableProducts || 'all',
      customerType: customerType || 'all',
      createdBy: req.user._id,
      status: 'active'
    });
    
    await discount.save();
    
    res.status(201).json({
      message: 'Discount coupon created successfully',
      discount
    });
  } catch (error) {
    console.error('Create discount error:', error);
    res.status(500).json({ message: 'Server error while creating discount' });
  }
});

// ===== PAYMENT/ANALYTICS ROUTES =====

// @route   GET /api/admin/payments/overview
// @desc    Get payment overview statistics
// @access  Private/Admin
router.get('/payments/overview', async (req, res) => {
  try {
    // Calculate revenue from completed orders
    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $in: ['Completed', 'Shipped', 'Delivered'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    
    // Calculate pending payments
    const pendingResult = await Order.aggregate([
      { $match: { orderStatus: 'Pending' } },
      { $group: { _id: null, pendingPayments: { $sum: '$total' } } }
    ]);
    const pendingPayments = pendingResult[0]?.pendingPayments || 0;
    
    // Calculate completed payments
    const completedResult = await Order.aggregate([
      { $match: { orderStatus: { $in: ['Completed', 'Shipped', 'Delivered'] } } },
      { $group: { _id: null, completedPayments: { $sum: '$total' } } }
    ]);
    const completedPayments = completedResult[0]?.completedPayments || 0;
    
    // Mock refund data (in real app, you'd have a refunds collection)
    const refundedAmount = totalRevenue * 0.05; // Simulate 5% refund rate
    
    const totalTransactions = await Order.countDocuments();
    
    res.json({
      overview: {
        totalRevenue,
        pendingPayments,
        completedPayments,
        refundedAmount,
        totalTransactions
      }
    });
  } catch (error) {
    console.error('Payment overview error:', error);
    res.status(500).json({ message: 'Server error while fetching payment overview' });
  }
});

// @route   GET /api/admin/payments/transactions
// @desc    Get payment transactions
// @access  Private/Admin
router.get('/payments/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;
    
    let filter = {};
    if (status && status !== 'all') {
      if (status === 'completed') {
        filter.orderStatus = { $in: ['Completed', 'Shipped', 'Delivered'] };
      } else if (status === 'pending') {
        filter.orderStatus = 'Pending';
      } else if (status === 'failed') {
        filter.orderStatus = 'Cancelled';
      }
    }
    
    if (search) {
      filter.$or = [
        { _id: { $regex: search, $options: 'i' } }
      ];
    }
    
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const transactions = orders.map(order => ({
      id: `TXN-${order._id.toString().slice(-6).toUpperCase()}`,
      orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
      customer: order.user?.name || 'Guest',
      amount: order.total,
      gateway: order.paymentMethod === 'card' ? 'PayHere' : 'Cash',
      method: order.paymentMethod === 'card' ? 'Credit Card' : 'Cash on Delivery',
      status: order.orderStatus === 'Pending' ? 'pending' : 
              (order.orderStatus === 'Cancelled' ? 'failed' : 'completed'),
      date: order.createdAt.toISOString().split('T')[0],
      fees: Math.round(order.total * 0.028) // 2.8% gateway fee simulation
    }));
    
    const total = await Order.countDocuments(filter);
    
    res.json({
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalTransactions: total
      }
    });
  } catch (error) {
    console.error('Payment transactions error:', error);
    res.status(500).json({ message: 'Server error while fetching payment transactions' });
  }
});

// ===== SHIPPING ROUTES =====

// @route   GET /api/admin/shipping/overview
// @desc    Get shipping overview statistics
// @access  Private/Admin
router.get('/shipping/overview', async (req, res) => {
  try {
    const totalShipments = await Order.countDocuments();
    const inTransit = await Order.countDocuments({ orderStatus: 'Shipped' });
    const delivered = await Order.countDocuments({ orderStatus: 'Delivered' });
    const pending = await Order.countDocuments({ orderStatus: 'Pending' });
    
    // Calculate average delivery time (mock data)
    const averageDeliveryTime = 2.3;
    
    res.json({
      overview: {
        totalShipments,
        inTransit,
        delivered,
        pending,
        averageDeliveryTime
      }
    });
  } catch (error) {
    console.error('Shipping overview error:', error);
    res.status(500).json({ message: 'Server error while fetching shipping overview' });
  }
});

// @route   GET /api/admin/shipping/shipments
// @desc    Get shipment details
// @access  Private/Admin
router.get('/shipping/shipments', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;
    
    let filter = {};
    if (status && status !== 'all') {
      if (status === 'delivered') {
        filter.orderStatus = 'Delivered';
      } else if (status === 'in_transit') {
        filter.orderStatus = 'Shipped';
      } else if (status === 'pending') {
        filter.orderStatus = 'Pending';
      }
    }
    
    if (search) {
      filter.$or = [
        { _id: { $regex: search, $options: 'i' } }
      ];
    }
    
    const orders = await Order.find(filter)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const shipments = orders.map(order => ({
      id: `SHP-${order._id.toString().slice(-6).toUpperCase()}`,
      orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
      customer: order.user?.name || 'Guest',
      address: `${order.shippingAddress?.city || 'Unknown'}`,
      courier: order.orderStatus === 'Shipped' ? 'Pronto Express' : 'Not assigned',
      status: order.orderStatus === 'Delivered' ? 'delivered' :
              (order.orderStatus === 'Shipped' ? 'in_transit' : 'pending'),
      trackingNumber: order.trackingNumber || `TRK${order._id.toString().slice(-8).toUpperCase()}`,
      shippedDate: order.createdAt.toISOString().split('T')[0],
      deliveredDate: order.orderStatus === 'Delivered' ? order.updatedAt.toISOString().split('T')[0] : null,
      cost: 350 // Mock shipping cost
    }));
    
    const total = await Order.countDocuments(filter);
    
    res.json({
      shipments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalShipments: total
      }
    });
  } catch (error) {
    console.error('Shipping shipments error:', error);
    res.status(500).json({ message: 'Server error while fetching shipments' });
  }
});

module.exports = router;
