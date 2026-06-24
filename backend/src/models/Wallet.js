const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0, min: 0 },
  bonusBalance: { type: Number, default: 0, min: 0 },
  totalDeposited: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  totalWon: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  lockReason: String,
}, { timestamps: true })

walletSchema.methods.canWithdraw = function (amount) {
  return this.balance >= amount && !this.isLocked
}

module.exports = mongoose.model('Wallet', walletSchema)
