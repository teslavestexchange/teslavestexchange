// api/auth/register.js
const connectToDatabase = require('../utils/db');
const User = require('../../models/user'); // Matches your models/user.js file
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'teslavest_secret_key_2026';

module.exports = async function handler(req, res) {
  // Return standard JSON response
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Connect to MongoDB Atlas
    await connectToDatabase();

    const { fullname, username, email, password } = req.body || {};

    if (!fullname || !username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // 2. Check for duplicate user
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { username: username.trim() }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or Email is already registered.' });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Save new user
    const newUser = new User({
      fullname: fullname.trim(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    await newUser.save();

    // 5. Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '7d' });

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
    console.error('Registration Error:', error);
    return res.status(500).json({ error: error.message || 'Database connection failure.' });
  }
};