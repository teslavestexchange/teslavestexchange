// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balanceUSD: { type: Number, default: 0.0000 },
  frozenUSD:  { type: Number, default: 0.0000 },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);