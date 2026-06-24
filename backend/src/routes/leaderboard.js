const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { success, error } = require('../utils/response')

router.get('/', async (req, res) => {
  try {
    const { game, limit = 50 } = req.query
    const users = await User.find({ isActive: true, isBanned: false })
      .select('username avatar stats')
      .sort({ 'stats.points': -1 })
      .limit(parseInt(limit))

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      userId: u._id,
      username: u.username,
      avatar: u.avatar,
      points: u.stats.points,
      tournamentsWon: u.stats.tournamentsWon,
      totalEarnings: u.stats.totalEarnings,
    }))

    return success(res, leaderboard)
  } catch (err) {
    return error(res, 'Failed to fetch leaderboard', 500, err.message)
  }
})

module.exports = router
