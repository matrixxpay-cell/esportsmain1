const Razorpay = require('razorpay')
const crypto = require('crypto')
const Wallet = require('../models/Wallet')
const Transaction = require('../models/Transaction')
const { success, error, paginate } = require('../utils/response')

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder',
})

exports.getBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id })
    if (!wallet) return error(res, 'Wallet not found', 404)
    return success(res, {
      balance: wallet.balance,
      bonusBalance: wallet.bonusBalance,
      totalDeposited: wallet.totalDeposited,
      totalWon: wallet.totalWon,
      isLocked: wallet.isLocked,
    })
  } catch (err) {
    return error(res, 'Failed to get balance', 500, err.message)
  }
}

exports.createDepositOrder = async (req, res) => {
  try {
    const { amount } = req.body
    if (!amount || amount < 10) return error(res, 'Minimum deposit is ₹10', 400)
    if (amount > 50000) return error(res, 'Maximum single deposit is ₹50,000', 400)

    const order = await getRazorpay().orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `dep_${req.user._id}_${Date.now()}`,
    })
    return success(res, { orderId: order.id, amount: order.amount, currency: order.currency })
  } catch (err) {
    return error(res, 'Failed to create payment order', 500, err.message)
  }
}

exports.confirmDeposit = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body

    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex')
    if (expected !== razorpay_signature) return error(res, 'Payment verification failed', 400)

    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.user._id },
      { $inc: { balance: amount, totalDeposited: amount } },
      { new: true }
    )

    await Transaction.create({
      userId: req.user._id,
      type: 'deposit',
      amount,
      balanceBefore: wallet.balance - amount,
      balanceAfter: wallet.balance,
      status: 'completed',
      description: 'Wallet deposit via Razorpay',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    })

    return success(res, { balance: wallet.balance }, '₹' + amount + ' added to your wallet!')
  } catch (err) {
    return error(res, 'Deposit confirmation failed', 500, err.message)
  }
}

exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, upiId } = req.body
    if (!amount || amount < 100) return error(res, 'Minimum withdrawal is ₹100', 400)
    if (!upiId || !upiId.includes('@')) return error(res, 'Invalid UPI ID', 400)

    const wallet = await Wallet.findOne({ userId: req.user._id })
    if (!wallet.canWithdraw(amount)) {
      return error(res, wallet.isLocked ? 'Wallet is locked' : 'Insufficient balance', 400)
    }

    // Deduct balance and create pending transaction
    await Wallet.findOneAndUpdate({ userId: req.user._id }, { $inc: { balance: -amount, totalWithdrawn: amount } })

    await Transaction.create({
      userId: req.user._id,
      type: 'withdrawal',
      amount: -amount,
      balanceBefore: wallet.balance,
      balanceAfter: wallet.balance - amount,
      status: 'pending',
      description: `Withdrawal to UPI: ${upiId}`,
      upiId,
    })

    return success(res, null, 'Withdrawal request submitted. Will be processed within 24 hours.')
  } catch (err) {
    return error(res, 'Withdrawal request failed', 500, err.message)
  }
}

exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query
    const query = { userId: req.user._id }
    if (type) query.type = type

    const total = await Transaction.countDocuments(query)
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    return paginate(res, transactions, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    })
  } catch (err) {
    return error(res, 'Failed to fetch transactions', 500, err.message)
  }
}
