const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
require('dotenv').config();

async function testAuth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baby-kingdom');
    console.log('Connected to MongoDB');
    
    // Test JWT generation
    const testUser = await User.findOne({ email: 'nawaznaveed8279@gmail.com' });
    if (testUser) {
      console.log('Found test user:', testUser.email);
      
      // Generate a test token
      const token = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );
      
      console.log('Generated token:', token.substring(0, 50) + '...');
      
      // Test token verification
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        console.log('Token decoded successfully:', decoded);
        
        // Test finding user by decoded ID
        const userFromToken = await User.findById(decoded.userId).select('-password');
        if (userFromToken) {
          console.log('User found from token:', userFromToken.email);
        } else {
          console.log('User NOT found from token');
        }
        
      } catch (error) {
        console.error('Token verification failed:', error.message);
      }
      
    } else {
      console.log('Test user not found');
    }
    
  } catch (error) {
    console.error('Auth test error:', error);
  } finally {
    mongoose.disconnect();
  }
}

testAuth();