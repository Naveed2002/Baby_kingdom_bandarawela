const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

const User = require('./models/User');

const resetAdmin = async () => {
  try {
    console.log('🔄 Resetting admin user...');
    
    // Delete all existing admin users
    const deletedAdmins = await User.deleteMany({ role: 'admin' });
    console.log(`🗑️  Deleted ${deletedAdmins.deletedCount} existing admin users`);
    
    // Create fresh admin user with known password
    const adminPassword = 'admin@1234';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const newAdmin = new User({
      name: 'Admin User',
      email: 'admin_bk@babykingdom.lk',
      username: 'admin_bk',
      password: hashedPassword,
      role: 'admin',
      phone: '+94 71 234 5678',
      address: {
        street: '123 Main Street',
        city: 'Bandarawela',
        state: 'Uva Province',
        zipCode: '90100',
        country: 'Sri Lanka'
      },
      isActive: true
    });
    
    await newAdmin.save();
    console.log('✅ New admin user created successfully');
    
    // Verify the new admin user
    const admin = await User.findOne({ email: 'admin_bk@babykingdom.lk' });
    console.log('\n🎯 Admin User Details:');
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('Username:', admin.username);
    console.log('Role:', admin.role);
    console.log('Is Active:', admin.isActive);
    console.log('Password Hash:', admin.password.substring(0, 20) + '...');
    
    // Test password comparison
    const passwordMatch = await admin.comparePassword(adminPassword);
    console.log('Password Test:', passwordMatch ? '✅ PASS' : '❌ FAIL');
    
    console.log('\n🔑 Login Credentials:');
    console.log('Username: admin_bk');
    console.log('Email: admin_bk@babykingdom.lk');
    console.log('Password: admin@1234');
    
    // Check total users
    const totalUsers = await User.countDocuments();
    console.log(`\n📊 Total users in database: ${totalUsers}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin user:', error);
    process.exit(1);
  }
};

resetAdmin();
