const connectToDatabase = require('../utils/db');
const User = require('../../models/user');

const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || 'Healing1'; 

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    // 1. Authenticate Admin Passkey
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
      const { userId, balanceUSD, totalProfit, totalBonus, totalDeposit, totalWithdrawals } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
      }

      // Fetch user document
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      // Explicitly assign numbers to ensure pre-existing or missing fields get written
      user.balanceUSD = isNaN(parseFloat(balanceUSD)) ? 0 : parseFloat(balanceUSD);
      user.totalProfit = isNaN(parseFloat(totalProfit)) ? 0 : parseFloat(totalProfit);
      user.totalBonus = isNaN(parseFloat(totalBonus)) ? 0 : parseFloat(totalBonus);
      user.totalDeposit = isNaN(parseFloat(totalDeposit)) ? 0 : parseFloat(totalDeposit);
      user.totalWithdrawals = isNaN(parseFloat(totalWithdrawals)) ? 0 : parseFloat(totalWithdrawals);

      // Save the updated document back to MongoDB
      await user.save();

      return res.status(200).json({ message: 'User updated successfully', user });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Admin API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};