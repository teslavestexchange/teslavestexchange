const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  network: { type: String, required: true },
  address: { type: String, required: true },
  qrCodeUrl: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.PaymentMethod || mongoose.model('PaymentMethod', paymentMethodSchema);