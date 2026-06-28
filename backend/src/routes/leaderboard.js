const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Tournament = require('../models/Tournament')
const { success, error } = require('../utils/response')

router.get('/', async (req, res) => {
  try {
    const { game, limit = 50 } = req.query
    const parsedLimit = parseInt(limit)

    if (game) {
      const pipeline = [
        { $match: { game, status: 'completed' } },
        { $unwind: '$participants' },
        { $match: { 'participants.result.position': { $exists: true } } },
        { $group: {
          _id: '$participants.userId',
          points: { $sum: { $ifNull: ['$participants.result.score', 0] } },
          tournamentsWon: { $sum: { $cond: [{ $eq: ['$participants.result.position', 1] }, 1, 0] } },
          totalEarnings: { $sum: { $ifNull: ['$participants.result.prizeWon', 0] } },
        }},
        { $sort: { points: -1 } },
        { $limit: parsedLimit },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $match: { 'user.isActive': true, 'user.isBanned': false } },
      ]

      const results = await Tournament.aggregate(pipeline)
      const leaderboard = results.map((r, i) => ({
        rank: i + 1,
        userId: r._id,
        username: r.user.username,
        avatar: r.user.avatar,
        points: r.points,
        tournamentsWon: r.tournamentsWon,
        totalEarnings: r.totalEarnings,
      }))

      return success(res, leaderboard)
    }

    const users = await User.find({ isActive: true, isBanned: false })
      .select('username avatar stats')
      .sort({ 'stats.points': -1 })
      .limit(parsedLimit)

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
