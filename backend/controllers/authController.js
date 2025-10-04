const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { name, email, password, phone, address } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Create new user
      const user = new User({
        name,
        email,
        password,
        phone,
        address: {
          ...address,
          country: address.country || 'Sri Lanka'
        }
      });

      await user.save();

      // Generate JWT token
      const token = generateToken(user._id);

      // Remove password from response
      const userResponse = user.toJSON();

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userResponse,
          token
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      // Handle duplicate key errors
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = generateToken(user._id);

      // Remove password from response
      const userResponse = user.toJSON();

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userResponse = user.toJSON();

      res.json({
        success: true,
        data: {
          user: userResponse
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { name, phone, address } = req.body;
      const userId = req.userId;

      const user = await User.findByIdAndUpdate(
        userId,
        {
          name,
          phone,
          address: {
            ...address,
            country: address.country || 'Sri Lanka'
          }
        },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userResponse = user.toJSON();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: userResponse
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = authController;