const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balanceUSD:             { type: Number, default: 0 },
  frozenUSD:              { type: Number, default: 0 },
  totalProfit:            { type: Number, default: 0 },
  totalBonus:             { type: Number, default: 0 },
  totalReferralBonus:     { type: Number, default: 0 },
  totalInvestmentPlans:   { type: Number, default: 0 },
  activeInvestmentPlans:  { type: Number, default: 0 },
  totalDeposit:           { type: Number, default: 0 },
  totalWithdrawals:       { type: Number, default: 0 },
  createdAt:              { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);