const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'prize', 'entry_fee', 'referral', 'bonus', 'refund', 'adjustment'],
    required: true,
  },
  amount: { type: Number, required: true },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'reversed'], default: 'pending' },
  description: { type: String, required: true },
  reference: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
  upiId: String,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt: Date,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true })

transactionSchema.index({ userId: 1, createdAt: -1 })
transactionSchema.index({ type: 1, status: 1 })
transactionSchema.index({ razorpayOrderId: 1 })

module.exports = mongoose.model('Transaction', transactionSchema)
