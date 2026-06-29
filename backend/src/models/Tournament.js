const mongoose = require('mongoose')

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: String,
  email: String,
  avatar: String,
  inGameId: String,
  teamName: String,
  teamMembers: [{ userId: mongoose.Schema.Types.ObjectId, username: String, inGameId: String, email: String, isSubstitute: { type: Boolean, default: false }, joinedAt: { type: Date, default: Date.now } }],
  joinedAt: { type: Date, default: Date.now },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'paid' },
  paymentId: String,
  result: {
    position: Number,
    kills: Number,
    score: Number,
    prizeWon: Number,
  },
})

const bracketMatchSchema = new mongoose.Schema({
  matchNumber: { type: Number, required: true },
  round: { type: Number, required: true },
  roundName: String,
  team1: {
    participantIndex: Number,
    teamName: String,
    score: Number,
    stats: mongoose.Schema.Types.Mixed,
  },
  team2: {
    participantIndex: Number,
    teamName: String,
    score: Number,
    stats: mongoose.Schema.Types.Mixed,
  },
  winner: { type: Number },
  isBye: { type: Boolean, default: false },
  nextMatchNumber: Number,
  roomId: String,
  roomPassword: String,
  roomDetailsSent: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'ongoing', 'completed'], default: 'pending' },
})

const tournamentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 2000 },
  game: {
    type: String,
    required: true,
    enum: ['csgo', 'mobile-legends', 'bgmi', 'free-fire', 'valorant', 'dota2', 'efootball'],
  },
  gameMode: { type: String, enum: ['solo', 'duo', 'squad', '5v5'], required: true },
  type: { type: String, enum: ['free', 'paid'], required: true },
  entryFee: { type: Number, default: 0, min: 0 },
  prizePool: { type: Number, required: true, min: 0 },
  prizeDistribution: [{
    position: { type: Number, required: true },
    amount: { type: Number, required: true },
    percentage: Number,
  }],
  maxSlots: { type: Number, required: true, min: 2 },
  filledSlots: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['upcoming', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  registrationDeadline: { type: Date, required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  rules: String,
  banner: String,
  roomId: { type: String, select: false },
  roomPassword: { type: String, select: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [participantSchema],
  brackets: [bracketMatchSchema],
  bracketsGenerated: { type: Boolean, default: false },
  thirdPlaceMatch: { type: Boolean, default: false },
  currentRound: { type: Number, default: 0 },
  totalRounds: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  maxSubstitutes: { type: Number, default: 0, min: 0, max: 3 },
  tags: [String],
}, {
  timestamps: true,
})

tournamentSchema.index({ game: 1, status: 1 })
tournamentSchema.index({ startDate: 1 })
tournamentSchema.index({ type: 1 })
tournamentSchema.index({ isFeatured: 1 })

tournamentSchema.methods.isRegistrationOpen = function () {
  const filled = this.filledSlots || this.participants?.length || 0
  return ['registration_open', 'upcoming'].includes(this.status) &&
    filled < this.maxSlots &&
    new Date() < new Date(this.registrationDeadline)
}

tournamentSchema.methods.isParticipant = function (userId) {
  return this.participants.some(p => p.userId.toString() === userId.toString())
}

module.exports = mongoose.model('Tournament', tournamentSchema)
