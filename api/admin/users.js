// Step out of admin/ to api/utils/db
const connectToDatabase = require('../utils/db');

// Step out of admin/ and api/ to models/user
const User = require('../../models/user');

const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || 'Healing1'; 

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    // 1. Authenticate Admin Passkey from Request Headers
    const authHeader = req.headers['x-admin-key'];
    if (!authHeader || authHeader !== ADMIN_PASSKEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Admin Passkey.' });
    }

    await connectToDatabase();

    // 2. GET: List all users
    if (req.method === 'GET') {
      const users = await User.find({}).select('-password').sort({ createdAt: -1 });
      return res.status(200).json({ users });
    }

    // 3. PUT: Update specific user fields manually
    if (req.method === 'PUT') {
      const { userId, balanceUSD, totalProfit, totalBonus, totalReferralBonus, totalDeposit, totalWithdrawals } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            balanceUSD: Number(balanceUSD) || 0,
            totalProfit: Number(totalProfit) || 0,
            totalBonus: Number(totalBonus) || 0,
            totalReferralBonus: Number(totalReferralBonus) || 0,
            totalDeposit: Number(totalDeposit) || 0,
            totalWithdrawals: Number(totalWithdrawals) || 0,
          }
        },
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found.' });
      }

      return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Admin API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};