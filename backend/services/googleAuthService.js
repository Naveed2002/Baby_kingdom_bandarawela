// Google OAuth service for handling Google authentication
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
};

// Verify Google token and get user info
const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      profileImage: payload.picture,
      emailVerified: payload.email_verified
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    throw new Error('Invalid Google token');
  }
};

// Handle Google OAuth login/registration
const handleGoogleAuth = async (googleToken) => {
  try {
    // Verify Google token and get user info
    const googleUserInfo = await verifyGoogleToken(googleToken);
    
    // Check if user already exists
    let user = await User.findOne({ email: googleUserInfo.email });
    
    if (user) {
      // User exists - update Google info if not already set
      if (!user.googleId) {
        user.googleId = googleUserInfo.googleId;
        user.profileImage = user.profileImage || googleUserInfo.profileImage;
        user.emailVerified = true; // Google accounts are pre-verified
        await user.save();
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user from Google info
      user = new User({
        name: googleUserInfo.name,
        email: googleUserInfo.email,
        password: 'google-oauth-' + Math.random().toString(36), // Random password for OAuth users
        phone: '', // Will be filled later by user
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Sri Lanka'
        },
        googleId: googleUserInfo.googleId,
        profileImage: googleUserInfo.profileImage,
        emailVerified: true, // Google accounts are pre-verified
        authProvider: 'google',
        isActive: true
      });
      
      await user.save();
    }
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    return {
      success: true,
      user: user.toPublicJSON(),
      token,
      isNewUser: !user.lastLogin // Check if this is first login
    };
  } catch (error) {
    console.error('Google auth error:', error);
    throw error;
  }
};

module.exports = {
  verifyGoogleToken,
  handleGoogleAuth
};