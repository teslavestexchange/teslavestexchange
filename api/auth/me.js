const connectToDatabase = require('../utils/db');
const User = require('../../models/user');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    await connectToDatabase();

    const userId = req.headers['x-user-id'] || req.query.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID missing.' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        balanceUSD: user.balanceUSD || 0,
        totalProfit: user.totalProfit || 0,
        totalBonus: user.totalBonus || 0,
        totalDeposit: user.totalDeposit || 0,
        totalWithdrawals: user.totalWithdrawals || 0,
      }
    });

  } catch (error) {
    console.error('Me API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};