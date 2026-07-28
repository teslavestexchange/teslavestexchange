// api/auth/login.js
const connectToDatabase = require('../utils/db');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'teslavest_secret_key_2026';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Username/Email and Password are required.' });
    }

    const inputIdentifier = email.trim().toLowerCase();

    // Find user matching either email OR username
    const user = await User.findOne({
      $or: [
        { email: inputIdentifier },
        { username: email.trim() }
      ]
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email/username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email/username or password.' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        balanceUSD: user.balanceUSD || 0,
        frozenUSD: user.frozenUSD || 0
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};