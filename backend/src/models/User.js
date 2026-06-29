const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true,
    trim: true, minlength: 3, maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/,
  },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, match: /^[6-9]\d{9}$/ },
  password: { type: String, required: true, minlength: 8, select: false },
  avatar: { type: String, default: null },
  role: { type: String, enum: ['player', 'admin', 'super_admin'], default: 'player' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  banReason: String,

  verificationToken: { type: String, select: false },
  verificationExpires: Date,
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: Date,

  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  googleId: String,
  discordId: String,

  lastLoginIp: String,
  lastLoginAt: Date,
  registrationIp: String,

  stats: {
    tournamentsPlayed: { type: Number, default: 0 },
    tournamentsWon: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
  },

  notifications: [{
    title: String,
    message: String,
    type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
    isRead: { type: Boolean, default: false },
    link: String,
    createdAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})

userSchema.index({ 'stats.points': -1 })

// Virtual for wallet
userSchema.virtual('wallet', {
  ref: 'Wallet',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
})

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Generate unique referral code
userSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = this.username.toUpperCase().slice(0, 4) + Math.random().toString(36).substring(2, 6).toUpperCase()
  }
  next()
})

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    avatar: this.avatar,
    role: this.role,
    isVerified: this.isVerified,
    referralCode: this.referralCode,
    stats: this.stats,
    createdAt: this.createdAt,
  }
}

module.exports = mongoose.model('User', userSchema)
