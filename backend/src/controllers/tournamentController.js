const Tournament = require('../models/Tournament')
const Wallet = require('../models/Wallet')
const Transaction = require('../models/Transaction')
const { success, error, paginate } = require('../utils/response')
const Razorpay = require('razorpay')
const crypto = require('crypto')

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

exports.getTournaments = async (req, res) => {
  try {
    const { game, status, type, mode, page = 1, limit = 12, search } = req.query
    const query = {}
    if (game) query.game = game
    if (status) query.status = status
    if (type) query.type = type
    if (mode) query.gameMode = mode
    if (search) query.title = { $regex: search, $options: 'i' }

    const total = await Tournament.countDocuments(query)
    const tournaments = await Tournament.find(query)
      .select('-roomId -roomPassword')
      .sort({ isFeatured: -1, startDate: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'username')

    return paginate(res, tournaments, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    })
  } catch (err) {
    return error(res, 'Failed to fetch tournaments', 500, err.message)
  }
}

exports.getTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .select('-roomId -roomPassword')
      .populate('createdBy', 'username')
    if (!tournament) return error(res, 'Tournament not found', 404)
    return success(res, tournament)
  } catch (err) {
    return error(res, 'Failed to fetch tournament', 500, err.message)
  }
}

exports.createTournament = async (req, res) => {
  try {
    const tournament = await Tournament.create({
      ...req.body,
      createdBy: req.user._id,
    })
    return success(res, tournament, 'Tournament created', 201)
  } catch (err) {
    return error(res, 'Failed to create tournament', 500, err.message)
  }
}

exports.updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!tournament) return error(res, 'Tournament not found', 404)
    return success(res, tournament)
  } catch (err) {
    return error(res, 'Failed to update tournament', 500, err.message)
  }
}

exports.registerForTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
    if (!tournament) return error(res, 'Tournament not found', 404)
    if (!tournament.isRegistrationOpen()) return error(res, 'Registration is closed for this tournament', 400)
    if (tournament.isParticipant(req.user._id)) return error(res, 'Already registered', 400)

    // For free tournaments, register directly
    if (tournament.type === 'free') {
      tournament.participants.push({
        userId: req.user._id,
        username: req.user.username,
        paymentStatus: 'paid',
      })
      tournament.filledSlots += 1
      await tournament.save()
      return success(res, null, 'Successfully registered!')
    }

    // For paid, create Razorpay order
    const order = await razorpay.orders.create({
      amount: tournament.entryFee * 100,
      currency: 'INR',
      receipt: `t_${tournament._id}_${req.user._id}`,
    })
    return success(res, { orderId: order.id, amount: order.amount, currency: order.currency })
  } catch (err) {
    return error(res, 'Registration failed', 500, err.message)
  }
}

exports.confirmPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
    const tournament = await Tournament.findById(req.params.id)
    if (!tournament) return error(res, 'Tournament not found', 404)

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex')
    if (expected !== razorpay_signature) return error(res, 'Payment verification failed', 400)

    // Add participant
    tournament.participants.push({
      userId: req.user._id,
      username: req.user.username,
      paymentStatus: 'paid',
      paymentId: razorpay_payment_id,
    })
    tournament.filledSlots += 1
    await tournament.save()

    // Record transaction
    const wallet = await Wallet.findOne({ userId: req.user._id })
    await Transaction.create({
      userId: req.user._id,
      type: 'entry_fee',
      amount: -tournament.entryFee,
      balanceBefore: wallet.balance,
      balanceAfter: wallet.balance,
      status: 'completed',
      description: `Entry fee for ${tournament.title}`,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      tournamentId: tournament._id,
    })

    return success(res, null, 'Payment successful! You are now registered.')
  } catch (err) {
    return error(res, 'Payment confirmation failed', 500, err.message)
  }
}

exports.getMyTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({
      'participants.userId': req.user._id,
    }).select('-roomId -roomPassword').sort({ startDate: -1 })
    return success(res, tournaments)
  } catch (err) {
    return error(res, 'Failed to fetch your tournaments', 500, err.message)
  }
}

exports.publishResults = async (req, res) => {
  try {
    const { results } = req.body
    const tournament = await Tournament.findById(req.params.id)
    if (!tournament) return error(res, 'Tournament not found', 404)

    // Update participant results and distribute prizes
    for (const result of results) {
      const participant = tournament.participants.find(p => p.userId.toString() === result.userId)
      if (participant) {
        participant.result = result
        if (result.prizeWon > 0) {
          await Wallet.findOneAndUpdate(
            { userId: result.userId },
            { $inc: { balance: result.prizeWon, totalWon: result.prizeWon } }
          )
          // Record prize transaction
          const wallet = await Wallet.findOne({ userId: result.userId })
          await Transaction.create({
            userId: result.userId,
            type: 'prize',
            amount: result.prizeWon,
            balanceBefore: wallet.balance - result.prizeWon,
            balanceAfter: wallet.balance,
            status: 'completed',
            description: `Prize for position #${result.position} in ${tournament.title}`,
            tournamentId: tournament._id,
          })
        }
      }
    }

    tournament.status = 'completed'
    await tournament.save()
    return success(res, null, 'Results published and prizes distributed!')
  } catch (err) {
    return error(res, 'Failed to publish results', 500, err.message)
  }
}
