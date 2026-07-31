const connectToDatabase = require('../utils/db');
const PaymentMethod = require('../../models/paymentMethod');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    // In production, verify admin auth header/token here
    const { code, name, network, address, qrCodeUrl } = req.body;

    if (!code || !address) {
      return res.status(400).json({ error: 'Code and Address are required.' });
    }

    const updatedMethod = await PaymentMethod.findOneAndUpdate(
      { code: code.toLowerCase() },
      { 
        code: code.toLowerCase(),
        name,
        network,
        address,
        qrCodeUrl,
        updatedAt: Date.now()
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, method: updatedMethod });
  } catch (error) {
    console.error('Update Payment Method Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};