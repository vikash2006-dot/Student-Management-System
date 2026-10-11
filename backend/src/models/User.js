const mongoose = require('mongoose');

// User Schema for authentication (Registration and Login)
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please enter your email address'],
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} is not a valid role'
      },
      default: 'user',
      trim: true
    }
  },

  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
