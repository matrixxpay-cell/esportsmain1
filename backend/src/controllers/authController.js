const crypto = require('crypto')
const User = require('../models/User')
const Wallet = require('../models/Wallet')
const { generateTokens } = require('../utils/jwt')
const { sendEmail, emailTemplates } = require('../utils/email')
const { success, error } = require('../utils/response')

exports.register = async (req, res) => {
  try {
    const { username, email, phone, password, referralCode } = req.body

    const existing = await User.findOne({ $or: [{ email }, { username }] })
    if (existing) {
      return error(res, existing.email === email ? 'Email already registered' : 'Username taken', 400)
    }

    let referredBy = null
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() })
      if (referrer) referredBy = referrer._id
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const user = await User.create({
      username, email, phone, password, referredBy,
      verificationToken: crypto.createHash('sha256').update(verificationToken).digest('hex'),
      verificationExpires: Date.now() + 24 * 60 * 60 * 1000,
    })

    // Create wallet for user
    await Wallet.create({ userId: user._id })

    // Referral bonus
    if (referredBy) {
      await Wallet.findOneAndUpdate({ userId: referredBy }, { $inc: { bonusBalance: 50 } })
    }

    // Send verification email
    const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`
    try {
      const { subject, html } = emailTemplates.verifyEmail(username, verifyUrl)
      await sendEmail({ to: email, subject, html })
    } catch { /* Email error shouldn't block registration */ }

    const { token } = generateTokens(user._id)
    return success(res, {
      user: user.toPublicJSON(),
      token,
      message: 'Please verify your email to unlock all features.',
    }, 'Account created successfully', 201)
  } catch (err) {
    return error(res, 'Registration failed', 500, err.message)
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return error(res, 'Invalid email or password', 401)
    }
    if (!user.isActive || user.isBanned) {
      return error(res, 'Your account has been suspended.', 403)
    }

    const wallet = await Wallet.findOne({ userId: user._id })
    const { token } = generateTokens(user._id)

    const userData = user.toPublicJSON()
    if (wallet) {
      userData.wallet = {
        balance: wallet.balance,
        bonusBalance: wallet.bonusBalance,
        totalDeposited: wallet.totalDeposited,
        totalWon: wallet.totalWon,
      }
    }

    return success(res, { user: userData, token })
  } catch (err) {
    return error(res, 'Login failed', 500, err.message)
  }
}

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationExpires: { $gt: Date.now() },
    })
    if (!user) return error(res, 'Invalid or expired verification link', 400)

    user.isVerified = true
    user.verificationToken = undefined
    user.verificationExpires = undefined
    await user.save()

    // Bonus for verified account
    await Wallet.findOneAndUpdate({ userId: user._id }, { $inc: { bonusBalance: 50 } })

    return success(res, null, 'Email verified! ₹50 bonus added to your wallet.')
  } catch (err) {
    return error(res, 'Verification failed', 500, err.message)
  }
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) return success(res, null, 'If that email exists, a reset link has been sent.')

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000 // 1 hour
    await user.save()

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`
    const { subject, html } = emailTemplates.resetPassword(user.username, resetUrl)
    await sendEmail({ to: email, subject, html })

    return success(res, null, 'Password reset link sent to your email.')
  } catch (err) {
    return success(res, null, 'If that email exists, a reset link has been sent.')
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    })
    if (!user) return error(res, 'Invalid or expired reset link', 400)

    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    return success(res, null, 'Password reset successful.')
  } catch (err) {
    return error(res, 'Password reset failed', 500, err.message)
  }
}

exports.getProfile = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id })
    const userData = req.user.toPublicJSON()
    if (wallet) {
      userData.wallet = {
        balance: wallet.balance,
        bonusBalance: wallet.bonusBalance,
        totalDeposited: wallet.totalDeposited,
        totalWon: wallet.totalWon,
      }
    }
    return success(res, userData)
  } catch (err) {
    return error(res, 'Failed to get profile', 500, err.message)
  }
}
