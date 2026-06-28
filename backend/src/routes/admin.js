const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Tournament = require('../models/Tournament')
const Wallet = require('../models/Wallet')
const Transaction = require('../models/Transaction')
const { adminAuth } = require('../middleware/auth')
const { success, error, paginate } = require('../utils/response')

// Analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const [totalUsers, totalTournaments, totalRevenue] = await Promise.all([
      User.countDocuments({ role: 'player' }),
      Tournament.countDocuments(),
      Transaction.aggregate([
        { $match: { type: 'entry_fee', status: 'completed' } },
        { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } },
      ]),
    ])
    return success(res, {
      totalUsers,
      totalTournaments,
      totalRevenue: totalRevenue[0]?.total || 0,
    })
  } catch (err) {
    return error(res, 'Failed to get analytics', 500, err.message)
  }
})

// Users management
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query
    const query = { role: 'player' }
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      query.$or = [
        { username: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ]
    }
    const total = await User.countDocuments(query)
    const users = await User.find(query)
      .select('username email phone isActive isBanned isVerified stats createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
    return paginate(res, users, { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) })
  } catch (err) {
    return error(res, 'Failed to get users', 500, err.message)
  }
})

router.put('/users/:id/ban', adminAuth, async (req, res) => {
  try {
    const { reason } = req.body
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true, banReason: reason }, { new: true })
    if (!user) return error(res, 'User not found', 404)
    return success(res, null, `User ${user.username} has been banned.`)
  } catch (err) {
    return error(res, 'Failed to ban user', 500, err.message)
  }
})

router.put('/users/:id/unban', adminAuth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBanned: false, banReason: null })
    return success(res, null, 'User unbanned.')
  } catch (err) {
    return error(res, 'Failed to unban user', 500, err.message)
  }
})

// Pending withdrawals
router.get('/withdrawals/pending', adminAuth, async (req, res) => {
  try {
    const withdrawals = await Transaction.find({ type: 'withdrawal', status: 'pending' })
      .populate('userId', 'username email')
      .sort({ createdAt: 1 })
    return success(res, withdrawals)
  } catch (err) {
    return error(res, 'Failed to get withdrawals', 500, err.message)
  }
})

router.put('/withdrawals/:id/approve', adminAuth, async (req, res) => {
  try {
    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { status: 'completed', processedBy: req.user._id, processedAt: new Date() },
      { new: true }
    )
    if (!tx) return error(res, 'Transaction not found or already processed', 404)
    return success(res, null, 'Withdrawal approved.')
  } catch (err) {
    return error(res, 'Failed to approve withdrawal', 500, err.message)
  }
})

router.put('/withdrawals/:id/reject', adminAuth, async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id)
    if (!tx) return error(res, 'Transaction not found', 404)

    // Refund to wallet
    await Wallet.findOneAndUpdate({ userId: tx.userId }, {
      $inc: { balance: Math.abs(tx.amount), totalWithdrawn: tx.amount }
    })

    tx.status = 'failed'
    tx.processedBy = req.user._id
    tx.processedAt = new Date()
    await tx.save()

    return success(res, null, 'Withdrawal rejected and amount refunded.')
  } catch (err) {
    return error(res, 'Failed to reject withdrawal', 500, err.message)
  }
})

module.exports = router
