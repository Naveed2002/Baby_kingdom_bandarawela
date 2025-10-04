const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

const User = require('./models/User');

const testEverything = async () => {
  try {
    console.log('🔍 COMPLETE SYSTEM CHECK');
    console.log('========================');
    
    // 1. Check database connection
    console.log('\n1️⃣ Database Connection:');
    const dbState = mongoose.connection.readyState;
    const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    console.log('Status:', dbStates[dbState]);
    
    // 2. Check if admin user exists
    console.log('\n2️⃣ Admin User Check:');
    const admin = await User.findOne({ email: 'admin_bk@babykingdom.lk' });
    if (admin) {
      console.log('✅ Admin user found');
      console.log('Name:', admin.name);
      console.log('Email:', admin.email);
      console.log('Username:', admin.username);
      console.log('Role:', admin.role);
      console.log('Is Active:', admin.isActive);
      console.log('Password Hash:', admin.password.substring(0, 30) + '...');
      console.log('Password Length:', admin.password.length);
    } else {
      console.log('❌ Admin user NOT found');
      return;
    }
    
    // 3. Test password comparison
    console.log('\n3️⃣ Password Testing:');
    const testPassword = 'admin@1234';
    console.log('Testing password:', testPassword);
    
    // Test direct bcrypt
    const directCompare = await bcrypt.compare(testPassword, admin.password);
    console.log('Direct bcrypt.compare:', directCompare ? '✅ PASS' : '❌ FAIL');
    
    // Test model method
    const modelCompare = await admin.comparePassword(testPassword);
    console.log('Model comparePassword:', modelCompare ? '✅ PASS' : '❌ FAIL');
    
    // 4. Test user lookup
    console.log('\n4️⃣ User Lookup Testing:');
    
    // Test by email
    const userByEmail = await User.findOne({ email: 'admin_bk@babykingdom.lk' });
    console.log('Find by email:', userByEmail ? '✅ Found' : '❌ Not found');
    
    // Test by username
    const userByUsername = await User.findOne({ username: 'admin_bk' });
    console.log('Find by username:', userByUsername ? '✅ Found' : '❌ Not found');
    
    // Test by $or query (like the login route)
    const userByOr = await User.findOne({
      $or: [
        { email: 'admin_bk@babykingdom.lk' },
        { username: 'admin_bk' }
      ]
    });
    console.log('Find by $or query:', userByOr ? '✅ Found' : '❌ Not found');
    
    // 5. Test the exact login flow
    console.log('\n5️⃣ Login Flow Testing:');
    
    // Simulate the login route logic
    const emailOrUsername = 'admin_bk';
    const password = 'admin@1234';
    
    console.log('Login attempt with:', { emailOrUsername, password });
    
    // Step 1: Find user
    const loginUser = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() }
      ]
    });
    
    if (!loginUser) {
      console.log('❌ User not found in login flow');
      return;
    }
    
    console.log('✅ User found:', loginUser.email);
    console.log('User active:', loginUser.isActive);
    
    // Step 2: Check password
    const passwordMatch = await loginUser.comparePassword(password);
    console.log('Password match:', passwordMatch ? '✅ PASS' : '❌ FAIL');
    
    // 6. Check for any validation issues
    console.log('\n6️⃣ Validation Check:');
    try {
      await loginUser.validate();
      console.log('✅ User validation passed');
    } catch (validationError) {
      console.log('❌ User validation failed:', validationError.message);
    }
    
    // 7. Summary
    console.log('\n📊 SUMMARY:');
    console.log('Database:', dbStates[dbState]);
    console.log('Admin exists:', admin ? 'Yes' : 'No');
    console.log('Password direct:', directCompare ? 'PASS' : 'FAIL');
    console.log('Password model:', modelCompare ? 'PASS' : 'FAIL');
    console.log('Login flow:', passwordMatch ? 'PASS' : 'FAIL');
    
    if (passwordMatch) {
      console.log('\n🎉 LOGIN SHOULD WORK!');
      console.log('Use: admin_bk / admin@1234');
    } else {
      console.log('\n🚨 LOGIN WILL FAIL!');
      console.log('Password comparison is broken');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testEverything();
