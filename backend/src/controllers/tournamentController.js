const Tournament = require('../models/Tournament')
const Wallet = require('../models/Wallet')
const Transaction = require('../models/Transaction')
const { success, error, paginate } = require('../utils/response')
const Razorpay = require('razorpay')
const crypto = require('crypto')

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder',
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

exports.sendRoomDetails = async (req, res) => {
  try {
    const { roomId, roomPassword } = req.body
    if (!roomId) return error(res, 'Room ID is required', 400)
    const tournament = await Tournament.findById(req.params.id)
    if (!tournament) return error(res, 'Tournament not found', 404)

    // Save room details to tournament
    tournament.roomId = roomId
    tournament.roomPassword = roomPassword || ''
    await tournament.save()

    // Send email to each participant
    const { sendEmail, emailTemplates } = require('../utils/email')
    const startDate = new Date(tournament.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    let sent = 0
    for (const p of tournament.participants) {
      // Email the team owner / solo player
      if (p.email) {
        try {
          const tmpl = emailTemplates.tournamentRegistration(p.username, tournament.title, startDate, { roomId, roomPassword })
          await sendEmail({ to: p.email, subject: tmpl.subject, html: tmpl.html })
          sent++
        } catch (e) { /* skip failed email */ }
      }
      // Email each team member individually
      for (const member of (p.teamMembers || [])) {
        if (!member.email) continue
        try {
          const tmpl = emailTemplates.tournamentRegistration(member.username || member.inGameId || 'Player', tournament.title, startDate, { roomId, roomPassword })
          await sendEmail({ to: member.email, subject: tmpl.subject, html: tmpl.html })
          sent++
        } catch (e) { /* skip failed email */ }
      }
    }
    return success(res, { sent }, `Room details sent to ${sent} participants`)
  } catch (err) {
    return error(res, 'Failed to send room details', 500, err.message)
  }
}

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['upcoming', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) return error(res, 'Invalid status', 400)
    const tournament = await Tournament.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!tournament) return error(res, 'Tournament not found', 404)
    return success(res, tournament, `Status updated to ${status}`)
  } catch (err) {
    return error(res, 'Failed to update status', 500, err.message)
  }
}

exports.registerForTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
    if (!tournament) return error(res, 'Tournament not found', 404)
    if (!tournament.isRegistrationOpen()) return error(res, 'Registration is closed for this tournament', 400)
    if (tournament.isParticipant(req.user._id)) return error(res, 'Already registered', 400)

    const { inGameId, playerEmail, teamName, teamMembers } = req.body
    if (!inGameId) return error(res, 'In-game ID is required', 400)

    const participantData = {
      userId: req.user._id,
      username: req.user.username,
      email: playerEmail || req.user.email,
      inGameId,
      teamName: teamName || undefined,
      teamMembers: (teamMembers || []).map(m => ({ ...m, username: m.username })),
      paymentStatus: 'paid',
    }

    // For free tournaments, register directly
    if (tournament.type === 'free') {
      tournament.participants.push(participantData)
      tournament.filledSlots += 1
      await tournament.save()
      return success(res, null, 'Successfully registered!')
    }

    // For paid, create Razorpay order
    const order = await getRazorpay().orders.create({
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
    const regData = req.session?.registrationData || {}
    tournament.participants.push({
      userId: req.user._id,
      username: req.user.username,
      email: req.user.email,
      inGameId: regData.inGameId,
      teamName: regData.teamName,
      teamMembers: regData.teamMembers || [],
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

exports.fillDemoTeams = async (req, res) => {
  try {
    const { count = 8 } = req.body
    const tournament = await Tournament.findById(req.params.id)
    if (!tournament) return error(res, 'Tournament not found', 404)

    const numTeams = Math.min(parseInt(count), tournament.maxSlots - tournament.participants.length)
    if (numTeams <= 0) return error(res, 'No slots available for demo teams', 400)

    const teamNames = [
      'Team Alpha', 'Team Bravo', 'Team Charlie', 'Team Delta',
      'Team Echo', 'Team Foxtrot', 'Team Ghost', 'Team Havoc',
      'Team Ignite', 'Team Jaguar', 'Team Krypton', 'Team Lightning',
      'Team Maverick', 'Team Nova', 'Team Omega', 'Team Phoenix',
      'Team Quantum', 'Team Raptor', 'Team Shadow', 'Team Titan',
      'Team Ultra', 'Team Venom', 'Team Warrior', 'Team Xenon',
      'Team Yonder', 'Team Zenith', 'Team Blaze', 'Team Cyclone',
      'Team Draco', 'Team Falcon', 'Team Hydra', 'Team Inferno',
    ]

    const existingNames = new Set(tournament.participants.map(p => p.teamName))
    const available = teamNames.filter(n => !existingNames.has(n))

    const demoId = new (require('mongoose').Types.ObjectId)()
    for (let i = 0; i < numTeams && i < available.length; i++) {
      const name = available[i]
      const memberCount = tournament.gameMode === 'squad' ? 4 : tournament.gameMode === '5v5' ? 5 : tournament.gameMode === 'duo' ? 2 : 1
      const members = []
      for (let m = 1; m < memberCount; m++) {
        members.push({
          userId: new (require('mongoose').Types.ObjectId)(),
          username: `${name.replace('Team ', '')}Player${m + 1}`,
          inGameId: `DEMO${Math.floor(1000 + Math.random() * 9000)}`,
          email: `demo${i}_${m}@example.com`,
        })
      }
      tournament.participants.push({
        userId: new (require('mongoose').Types.ObjectId)(),
        username: `${name.replace('Team ', '')}Captain`,
        email: `demo_captain${i}@example.com`,
        inGameId: `DEMO${Math.floor(1000 + Math.random() * 9000)}`,
        teamName: name,
        teamMembers: members,
        paymentStatus: 'paid',
      })
    }
    tournament.filledSlots = tournament.participants.length
    await tournament.save()
    return success(res, tournament, `${numTeams} demo teams added`)
  } catch (err) {
    return error(res, 'Failed to fill demo teams', 500, err.message)
  }
}

exports.generateBrackets = async (req, res) => {
  try {
    const { shuffle = true, thirdPlace = false } = req.body
    const tournament = await Tournament.findById(req.params.id)
    if (!tournament) return error(res, 'Tournament not found', 404)
    if (tournament.participants.length < 2) return error(res, 'Need at least 2 teams to generate brackets', 400)

    let teams = [...tournament.participants]
    if (shuffle) {
      for (let i = teams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [teams[i], teams[j]] = [teams[j], teams[i]]
      }
    }

    const n = teams.length
    const nextPow2 = Math.pow(2, Math.ceil(Math.log2(n)))
    const totalRounds = Math.ceil(Math.log2(nextPow2))
    const brackets = []
    let matchCounter = 1

    for (let i = 0; i < nextPow2; i += 2) {
      const p1 = i < n ? teams[i].userId : null
      const p2 = (i + 1) < n ? teams[i + 1].userId : null
      const isBye = !p1 || !p2
      brackets.push({
        matchId: `R1M${matchCounter}`,
        round: 1,
        player1: p1,
        player2: p2,
        winner: isBye ? (p1 || p2) : undefined,
        status: isBye ? 'completed' : 'pending',
      })
      matchCounter++
    }

    for (let round = 2; round <= totalRounds; round++) {
      const matchesInRound = nextPow2 / Math.pow(2, round)
      for (let i = 0; i < matchesInRound; i++) {
        brackets.push({
          matchId: `R${round}M${i + 1}`,
          round,
          status: 'pending',
        })
      }
    }

    if (thirdPlace) {
      brackets.push({
        matchId: `R${totalRounds}M_3RD`,
        round: totalRounds,
        status: 'pending',
      })
    }

    tournament.brackets = brackets
    await tournament.save()
    return success(res, tournament, 'Brackets generated')
  } catch (err) {
    return error(res, 'Failed to generate brackets', 500, err.message)
  }
}

exports.deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
    if (!tournament) return error(res, 'Tournament not found', 404)
    if (tournament.status === 'ongoing') return error(res, 'Cannot delete an ongoing tournament', 400)
    await Tournament.findByIdAndDelete(req.params.id)
    return success(res, null, 'Tournament deleted.')
  } catch (err) {
    return error(res, 'Failed to delete tournament', 500, err.message)
  }
}
