const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function debugUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baby-kingdom');
    console.log('Connected to MongoDB');
    
    // Find all users
    const users = await User.find({}).select('-password');
    console.log('All users in database:');
    users.forEach(user => {
      console.log(`ID: ${user._id}, Email: ${user.email}, Name: ${user.name}, Active: ${user.isActive}`);
    });
    
    // Check for any admin users
    const adminUsers = await User.find({ role: 'admin' }).select('-password');
    console.log('\nAdmin users:');
    adminUsers.forEach(user => {
      console.log(`ID: ${user._id}, Email: ${user.email}, Name: ${user.name}`);
    });
    
    console.log('\nTotal users:', users.length);
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    mongoose.disconnect();
  }
}

debugUser();