const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) return res.status(401).json({ success: false, message: 'User not found.' })
    if (!user.isActive || user.isBanned) {
      return res.status(403).json({ success: false, message: 'Account suspended or banned.' })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' })
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' })
  }
}

const adminAuth = async (req, res, next) => {
  await auth(req, res, () => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Admin access required.' })
    }
    next()
  })
}

const superAdminAuth = async (req, res, next) => {
  await auth(req, res, () => {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Super admin access required.' })
    }
    next()
  })
}

module.exports = { auth, adminAuth, superAdminAuth }
