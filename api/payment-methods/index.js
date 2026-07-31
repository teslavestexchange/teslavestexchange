const connectToDatabase = require('../utils/db');
const PaymentMethod = require('../../models/paymentMethod');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const methods = await PaymentMethod.find({}).sort({ name: 1 });
      return res.status(200).json({ success: true, methods });
    }

    return res.status(455).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Fetch Payment Methods Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};