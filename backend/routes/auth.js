const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { sendVerificationEmail } = require('../utils/emailService');
const { handleGoogleAuth } = require('../services/googleAuthService');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, username, password, phone, address } = req.body;

    // Check if user already exists with email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if username is taken (if provided)
    if (username) {
      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const userData = {
      name,
      email,
      password,
      phone,
      address,
      verificationToken,
      verificationTokenExpires,
      emailVerified: false
    };

    // Auto-verify admin users
    if (email === 'babykingdom.goods@gmail.com' || email.includes('admin') || email.includes('babykingdom')) {
      userData.emailVerified = true;
      userData.verificationToken = undefined;
      userData.verificationTokenExpires = undefined;
    }

    // Add username if provided
    if (username) {
      userData.username = username;
    }

    const user = new User(userData);
    await user.save();

    // Send verification email (skip for admin users)
    if (!userData.emailVerified) {
      const emailSent = await sendVerificationEmail(email, verificationToken, name);
      
      if (!emailSent) {
        // If email fails, delete the user and return error
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
      }
    }

    res.status(201).json({
      message: userData.emailVerified 
        ? 'Admin account created successfully! You can now log in.' 
        : 'Registration successful! Please check your email to verify your account.',
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user with email or username
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Please provide email/username and password' });
    }

    // Check if user exists by email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Check if email is verified (skip for admin users)
    if (!user.emailVerified && user.role !== 'admin') {
      return res.status(400).json({ message: 'Please verify your email before logging in. Check your inbox for the verification link.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST /api/auth/google
// @desc    Google OAuth authentication
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    const result = await handleGoogleAuth(googleToken);
    
    res.json({
      message: result.isNewUser ? 'Account created successfully with Google!' : 'Login successful with Google!',
      token: result.token,
      user: result.user,
      isNewUser: result.isNewUser
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      message: error.message === 'Invalid Google token' 
        ? 'Invalid Google authentication. Please try again.' 
        : 'Server error during Google authentication' 
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    console.log('Auth check for user:', req.user._id);
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      console.log('User not found in /me endpoint:', req.user._id);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Auth successful for user:', user.email);
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    console.log('Profile update request from user:', req.user._id);
    console.log('Update data:', req.body);
    
    const { name, phone, address, dateOfBirth, gender } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender; // Allow empty string to clear gender

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      console.log('User not found with ID:', req.user._id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Profile updated successfully for user:', user._id);
    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/verify-email
// @desc    Verify user email with token
// @access  Public
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Find user with this verification token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update user to verified
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Generate token for automatic login
    const authToken = generateToken(user._id);

    res.json({
      message: 'Email verified successfully! You can now log in to your account.',
      token: authToken,
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Send new verification email
    const emailSent = await sendVerificationEmail(email, verificationToken, user.name);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }

    res.json({
      message: 'Verification email sent successfully. Please check your inbox.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error while resending verification email' });
  }
});

module.exports = router;