const connectToDatabase = require('../utils/db');
const { Ticket, Message } = require('../../models/chat');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    await connectToDatabase();

    // 1. Fetch Chat History
    if (req.method === 'GET') {
      const { ticketId } = req.query;
      if (!ticketId) return res.status(400).json({ error: 'ticketId required' });

      const messages = await Message.find({ ticketId }).sort({ timestamp: 1 });
      return res.status(200).json({ success: true, messages });
    }

    // 2. Send Message / Create Ticket
    if (req.method === 'POST') {
      const { ticketId, text, sender, userName, userEmail } = req.body;

      if (!ticketId || !text) {
        return res.status(400).json({ error: 'ticketId and text are required' });
      }

      // Upsert Ticket
      await Ticket.findOneAndUpdate(
        { ticketId },
        { 
          ticketId, 
          userName: userName || 'Guest', 
          userEmail: userEmail || 'Guest',
          status: 'open',
          updatedAt: Date.now()
        },
        { upsert: true, new: true }
      );

      // Save Message
      const newMessage = await Message.create({
        ticketId,
        sender: sender || 'user',
        text,
        timestamp: Date.now()
      });

      return res.status(200).json({ success: true, message: newMessage });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Support API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};