const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

const User = require('./models/User');

const debugPassword = async () => {
  try {
    console.log('🔍 Debugging password issue...');
    
    // Get the admin user
    const admin = await User.findOne({ email: 'admin_bk@babykingdom.lk' });
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('\n📋 Admin User Details:');
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('Password Hash:', admin.password);
    console.log('Password Length:', admin.password.length);
    
    // Test password comparison step by step
    const testPassword = 'admin@1234';
    console.log('\n🧪 Testing password:', testPassword);
    
    // Test 1: Direct bcrypt comparison
    const directCompare = await bcrypt.compare(testPassword, admin.password);
    console.log('Direct bcrypt.compare:', directCompare ? '✅ PASS' : '❌ FAIL');
    
    // Test 2: Using the model method
    const modelCompare = await admin.comparePassword(testPassword);
    console.log('Model comparePassword:', modelCompare ? '✅ PASS' : '❌ FAIL');
    
    // Test 3: Hash the test password and compare
    const testHash = await bcrypt.hash(testPassword, 12);
    console.log('Test password hash:', testHash.substring(0, 20) + '...');
    
    // Test 4: Compare hashes
    const hashCompare = await bcrypt.compare(testPassword, testHash);
    console.log('Hash comparison:', hashCompare ? '✅ PASS' : '❌ FAIL');
    
    // Test 5: Check if password was double-hashed
    const isDoubleHashed = admin.password.includes('$2b$12$') && admin.password.length > 60;
    console.log('Is double-hashed:', isDoubleHashed ? 'Yes' : 'No');
    
    // Test 6: Try to create a new hash and compare
    const newHash = await bcrypt.hash(testPassword, 12);
    const newCompare = await bcrypt.compare(testPassword, newHash);
    console.log('New hash comparison:', newCompare ? '✅ PASS' : '❌ FAIL');
    
    console.log('\n🔑 Expected Login Credentials:');
    console.log('Username: admin_bk');
    console.log('Email: admin_bk@babykingdom.lk');
    console.log('Password: admin@1234');
    
    process.exit(0);
  } catch (error) {
    console.error('Error debugging password:', error);
    process.exit(1);
  }
};

debugPassword();
