const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Tournament = require('../models/Tournament')
const Wallet = require('../models/Wallet')
const Transaction = require('../models/Transaction')
const PlatformConfig = require('../models/PlatformConfig')
const { adminAuth, superAdminAuth } = require('../middleware/auth')
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

// All transactions
router.get('/transactions', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, status } = req.query
    const query = {}
    if (type) query.type = type
    if (status) query.status = status
    const total = await Transaction.countDocuments(query)
    const transactions = await Transaction.find(query)
      .populate('userId', 'username email')
      .populate('tournamentId', 'title game')
      .populate('processedBy', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
    return paginate(res, transactions, { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) })
  } catch (err) {
    return error(res, 'Failed to get transactions', 500, err.message)
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

// Platform Config
router.get('/settings/:category', adminAuth, async (req, res) => {
  try {
    const data = await PlatformConfig.getByCategory(req.params.category)
    return success(res, data)
  } catch (err) {
    return error(res, 'Failed to get settings', 500, err.message)
  }
})

router.put('/settings/:category', adminAuth, async (req, res) => {
  try {
    const { category } = req.params
    const validCategories = ['platform', 'api_keys', 'security', 'email']
    if (!validCategories.includes(category)) return error(res, 'Invalid category', 400)

    const sensitiveKeys = ['razorpay_key_secret', 'cloudinary_api_secret', 'jwt_secret', 'jwt_refresh_secret', 'email_pass']
    const updates = req.body
    let savedCount = 0
    for (const [key, value] of Object.entries(updates)) {
      if (sensitiveKeys.includes(key) && (value === '••••••••' || !value)) continue
      if (typeof value === 'string' && !value.trim()) continue
      await PlatformConfig.set(key, value, category, req.user._id)
      savedCount++
    }
    const data = await PlatformConfig.getByCategory(category)

    for (const k of sensitiveKeys) {
      if (data[k]) data[k] = '••••••••'
    }
    return success(res, data, 'Settings updated')
  } catch (err) {
    return error(res, 'Failed to update settings', 500, err.message)
  }
})

// Email template preview/test
router.post('/settings/email/test', adminAuth, async (req, res) => {
  try {
    const { sendEmail } = require('../utils/email')
    const { to, template } = req.body
    if (!to) return error(res, 'Recipient email required', 400)

    const emailHost = await PlatformConfig.get('email_host')
    const emailUser = await PlatformConfig.get('email_user')
    const emailPass = await PlatformConfig.get('email_pass')
    console.log('Email config check:', { host: emailHost, user: emailUser, hasPass: !!emailPass, passLength: emailPass?.length, passMasked: emailPass === '••••••••' })

    await sendEmail({
      to,
      subject: 'Test Email from EsportsG',
      html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#1a1a2e;color:#fff;padding:30px;border-radius:12px;">
        <h2 style="color:#FF6B2B;">EsportsG Test Email</h2>
        <p>This is a test email from your EsportsG admin panel.</p>
        <p>Template: <strong>${template || 'default'}</strong></p>
        <p style="color:#888;font-size:12px;">Sent at ${new Date().toLocaleString('en-IN')}</p>
      </div>`,
    })
    return success(res, null, `Test email sent to ${to}`)
  } catch (err) {
    console.error('Test email error:', err.message, err.code, err.responseCode)
    return error(res, `Failed to send test email: ${err.message}`, 500)
  }
})

// Admin roles management
router.get('/admins', adminAuth, async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } })
      .select('username email role createdAt')
      .sort({ createdAt: 1 })
    return success(res, admins)
  } catch (err) {
    return error(res, 'Failed to get admins', 500, err.message)
  }
})

router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body
    if (!['player', 'admin'].includes(role)) return error(res, 'Invalid role', 400)
    if (req.user.role !== 'super_admin') return error(res, 'Only super admins can change roles', 403)
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('username email role')
    if (!user) return error(res, 'User not found', 404)
    return success(res, user, `Role updated to ${role}`)
  } catch (err) {
    return error(res, 'Failed to update role', 500, err.message)
  }
})

// Announcements
router.get('/announcements', adminAuth, async (req, res) => {
  try {
    const announcements = await PlatformConfig.find({ category: 'announcement' }).sort({ createdAt: -1 }).limit(20)
    return success(res, announcements)
  } catch (err) {
    return error(res, 'Failed to get announcements', 500, err.message)
  }
})

router.post('/announcements', adminAuth, async (req, res) => {
  try {
    const { title, message, type } = req.body
    if (!title || !message) return error(res, 'Title and message required', 400)

    const key = `announcement_${Date.now()}`
    await PlatformConfig.create({
      key,
      value: { title, message, type: type || 'info', createdBy: req.user.username, createdAt: new Date() },
      category: 'announcement',
      updatedBy: req.user._id,
    })

    const notification = { title, message, type: type || 'info', isRead: false }
    const result = await User.updateMany({}, { $push: { notifications: { $each: [notification], $position: 0 } } })

    return success(res, { sent: result.modifiedCount }, `Announcement sent to ${result.modifiedCount} users`)
  } catch (err) {
    return error(res, 'Failed to send announcement', 500, err.message)
  }
})

// Homepage Content Management
router.get('/content/games', adminAuth, async (req, res) => {
  try {
    const data = await PlatformConfig.get('homepage_games', null)
    return success(res, data)
  } catch (err) {
    return error(res, 'Failed to get games config', 500, err.message)
  }
})

router.put('/content/games', adminAuth, async (req, res) => {
  try {
    const { games } = req.body
    await PlatformConfig.set('homepage_games', games, 'platform', req.user._id)
    return success(res, games, 'Games display updated')
  } catch (err) {
    return error(res, 'Failed to update games', 500, err.message)
  }
})

router.get('/content/sponsors', adminAuth, async (req, res) => {
  try {
    const data = await PlatformConfig.get('homepage_sponsors', [])
    return success(res, data)
  } catch (err) {
    return error(res, 'Failed to get sponsors', 500, err.message)
  }
})

router.put('/content/sponsors', adminAuth, async (req, res) => {
  try {
    const { sponsors } = req.body
    await PlatformConfig.set('homepage_sponsors', sponsors, 'platform', req.user._id)
    return success(res, sponsors, 'Sponsors updated')
  } catch (err) {
    return error(res, 'Failed to update sponsors', 500, err.message)
  }
})

router.get('/content/reviews', adminAuth, async (req, res) => {
  try {
    const data = await PlatformConfig.get('homepage_reviews', [])
    return success(res, data)
  } catch (err) {
    return error(res, 'Failed to get reviews', 500, err.message)
  }
})

router.put('/content/reviews', adminAuth, async (req, res) => {
  try {
    const { reviews } = req.body
    await PlatformConfig.set('homepage_reviews', reviews, 'platform', req.user._id)
    return success(res, reviews, 'Reviews updated')
  } catch (err) {
    return error(res, 'Failed to update reviews', 500, err.message)
  }
})

module.exports = router
