const connectToDatabase = require('../utils/db');
const { Ticket, Message } = require('../../models/chat');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    await connectToDatabase();

    // Fetch all active tickets
    if (req.method === 'GET') {
      const tickets = await Ticket.find({}).sort({ updatedAt: -1 });
      return res.status(200).json({ success: true, tickets });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin Support API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};