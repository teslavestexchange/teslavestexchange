const connectToDatabase = require('../utils/db');
const User = require('../../models/user');

const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || 'Healing1'; 

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    const authHeader = req.headers['x-admin-key'];
    if (!authHeader || authHeader !== ADMIN_PASSKEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Admin Passkey.' });
    }

    await connectToDatabase();

    if (req.method === 'GET') {
      const users = await User.find({}).select('-password').sort({ createdAt: -1 });
      return res.status(200).json({ users });
    }

    if (req.method === 'PUT') {
      const { userId, balanceUSD, totalProfit, totalBonus, totalDeposit, totalWithdrawals } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
      }

      const updateFields = {
        balanceUSD: isNaN(parseFloat(balanceUSD)) ? 0 : parseFloat(balanceUSD),
        totalProfit: isNaN(parseFloat(totalProfit)) ? 0 : parseFloat(totalProfit),
        totalBonus: isNaN(parseFloat(totalBonus)) ? 0 : parseFloat(totalBonus),
        totalDeposit: isNaN(parseFloat(totalDeposit)) ? 0 : parseFloat(totalDeposit),
        totalWithdrawals: isNaN(parseFloat(totalWithdrawals)) ? 0 : parseFloat(totalWithdrawals)
      };

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true, runValidators: false }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found in database.' });
      }

      return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Admin API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};