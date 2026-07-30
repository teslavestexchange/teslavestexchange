module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    // 1. Safe module imports inside try block to catch path errors
    let connectToDatabase, User;
    try {
      connectToDatabase = require('../utils/db');
      User = require('../../models/user');
    } catch (importErr) {
      console.error('Import Path Error:', importErr);
      return res.status(500).json({ error: `Server configuration error: ${importErr.message}` });
    }

    // 2. Authenticate Admin Passkey
    const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || 'Healing1';
    const authHeader = req.headers['x-admin-key'];

    if (!authHeader || authHeader !== ADMIN_PASSKEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Admin Passkey.' });
    }

    await connectToDatabase();

    // 3. GET: List all users
    if (req.method === 'GET') {
      const users = await User.find({}).select('-password').sort({ createdAt: -1 });
      return res.status(200).json({ users });
    }

    // 4. PUT: Update user records
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
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};