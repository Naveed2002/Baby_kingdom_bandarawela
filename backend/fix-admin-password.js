const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

const User = require('./models/User');

const fixAdminPassword = async () => {
  try {
    console.log('🔧 Fixing admin password...');
    
    // Delete existing admin user
    const deletedAdmin = await User.deleteOne({ email: 'admin_bk@babykingdom.lk' });
    console.log(`🗑️  Deleted existing admin user`);
    
    // Create password hash manually (only once)
    const adminPassword = 'admin@1234';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    console.log('🔐 Created password hash (length:', hashedPassword.length, ')');
    
    // Create admin user WITHOUT triggering pre-save hook
    const adminData = {
      name: 'Admin User',
      email: 'admin_bk@babykingdom.lk',
      username: 'admin_bk',
      password: hashedPassword, // Already hashed, don't hash again
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
    };
    
    // Use insertOne to bypass pre-save hooks
    const result = await User.collection.insertOne(adminData);
    console.log('✅ Admin user created with fixed password');
    
    // Verify the user was created
    const admin = await User.findOne({ email: 'admin_bk@babykingdom.lk' });
    console.log('\n🎯 Admin User Details:');
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('Username:', admin.username);
    console.log('Role:', admin.role);
    console.log('Is Active:', admin.isActive);
    console.log('Password Hash:', admin.password.substring(0, 30) + '...');
    console.log('Password Length:', admin.password.length);
    
    // Test password comparison
    const testPassword = 'admin@1234';
    console.log('\n🧪 Testing password:', testPassword);
    
    // Test direct bcrypt comparison
    const directCompare = await bcrypt.compare(testPassword, admin.password);
    console.log('Direct bcrypt.compare:', directCompare ? '✅ PASS' : '❌ FAIL');
    
    // Test model method
    const modelCompare = await admin.comparePassword(testPassword);
    console.log('Model comparePassword:', modelCompare ? '✅ PASS' : '❌ FAIL');
    
    if (directCompare && modelCompare) {
      console.log('\n🎉 PASSWORD FIXED! Login should work now!');
      console.log('\n🔑 Login Credentials:');
      console.log('Username: admin_bk');
      console.log('Email: admin_bk@babykingdom.lk');
      console.log('Password: admin@1234');
    } else {
      console.log('\n🚨 PASSWORD STILL BROKEN!');
    }
    
    // Check total users
    const totalUsers = await User.countDocuments();
    console.log(`\n📊 Total users in database: ${totalUsers}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing admin password:', error);
    process.exit(1);
  }
};

fixAdminPassword();
