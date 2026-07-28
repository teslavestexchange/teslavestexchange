// api/auth/register.js
const connectToDatabase = require('../utils/db');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'teslavest_secret_key_2026';

module.exports = async function handler(req, res) {
  // Always set response content type to JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Establish database connection
    await connectToDatabase();

    const { fullname, username, email, password } = req.body || {};

    // 2. Validate input fields
    if (!fullname || !username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // 3. Check for existing user (case-insensitive for email)
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: username.trim() }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or Email is already registered.' });
    }

    // 4. Hash user password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create new user record
    const newUser = new User({
      fullname: fullname.trim(),
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    await newUser.save();

    // 6. Sign JWT token
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '7d' });

    // 7. Return success response
    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newUser._id,
        fullname: newUser.fullname,
        username: newUser.username,
        email: newUser.email,
        balanceUSD: newUser.balanceUSD || 0,
        frozenUSD: newUser.frozenUSD || 0
      }
    });

  } catch (error) {
    console.error('Registration API Error:', error);

    // If Mongoose duplicate key error occurs
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username or Email is already in use.' });
    }

    return res.status(500).json({ error: error.message || 'Internal server error during registration.' });
  }
};