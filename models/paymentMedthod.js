const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // e.g., 'btc', 'eth', 'usdt', 'usdc'
  name: { type: String, required: true },               // e.g., 'Bitcoin (BTC)'
  network: { type: String, required: true },            // e.g., 'Bitcoin Network'
  address: { type: String, required: true },            // Wallet Address
  qrCodeUrl: { type: String, default: '' },             // Image URL or Base64 string
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.PaymentMethod || mongoose.model('PaymentMethod', paymentMethodSchema);