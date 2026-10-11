const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to generate JWT token for a user
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'college_project_jwt_secret_key_123';
  return jwt.sign({ id: userId, role }, secret, {
    expiresIn: '7d' // Token expires in 7 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate that all required fields are present
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password'
      });
    }

    // 2. Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // 3. Check if user with this email already exists
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in instead.'
      });
    }

    // 4. Hash password securely before saving (salt rounds = 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create new user in MongoDB - always enforce 'user' role for public registration
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user'
    });

    // 6. Generate JWT token
    const token = generateToken(newUser._id, newUser.role);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // 2. Find user by email in MongoDB
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 3. Compare entered password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 4. Generate JWT token
    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile (Protected route test)
// @route   GET /api/auth/me
// @access  Private (Requires JWT token)
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};

