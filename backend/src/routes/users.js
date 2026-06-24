const express = require('express')
const router = express.Router()
const { auth } = require('../middleware/auth')
const User = require('../models/User')
const { success, error } = require('../utils/response')

// GET /api/users/notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notifications')
    return success(res, user.notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  } catch (err) {
    return error(res, 'Failed to fetch notifications', 500)
  }
})

// PUT /api/users/notifications/read-all
router.put('/notifications/read-all', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $set: { 'notifications.$[].isRead': true } })
    return success(res, null, 'All notifications marked as read')
  } catch (err) {
    return error(res, 'Failed to update notifications', 500)
  }
})

// PUT /api/users/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, phone } = req.body
    const updates = {}
    if (username) {
      const exists = await User.findOne({ username, _id: { $ne: req.user.id } })
      if (exists) return error(res, 'Username already taken', 400)
      updates.username = username
    }
    if (phone) {
      if (!/^[6-9]\d{9}$/.test(phone)) return error(res, 'Invalid phone number', 400)
      updates.phone = phone
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password')
    return success(res, user, 'Profile updated')
  } catch (err) {
    return error(res, 'Failed to update profile', 500)
  }
})

// GET /api/users/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('stats')
    return success(res, user.stats)
  } catch (err) {
    return error(res, 'Failed to fetch stats', 500)
  }
})

module.exports = router
