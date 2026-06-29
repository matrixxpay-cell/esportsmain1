const mongoose = require('mongoose')
const Tournament = require('../models/Tournament')
const Wallet = require('../models/Wallet')
const Transaction = require('../models/Transaction')
const { success, error, paginate } = require('../utils/response')
const crypto = require('crypto')
const { getRazorpay, getRazorpaySecret } = require('../utils/razorpay')

exports.getTournaments = async (req, res) => {
  try {
    const { game, status, type, mode, page = 1, limit = 12, search } = req.query
    const query = {}
    if (game) query.game = game
    if (status) query.status = status
    if (type) query.type = type
    if (mode) query.gameMode = mode
    if (search) query.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }

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
    const { title, game, gameMode, type, entryFee, prizePool, maxSlots, startDate, endDate, description, rules, prizeDistribution, bannerImage, isFeatured, registrationDeadline, maxSubstitutes } = req.body
    const autoStatus = registrationDeadline && new Date(registrationDeadline) > new Date() ? 'registration_open' : 'upcoming'
    const tournament = await Tournament.create({
      title, game, gameMode, type, entryFee, prizePool, maxSlots, startDate, endDate, description, rules, prizeDistribution, bannerImage, isFeatured, registrationDeadline, maxSubstitutes,
      status: autoStatus,
      createdBy: req.user._id,
    })
    return success(res, tournament, 'Tournament created', 201)
  } catch (err) {
    return error(res, 'Failed to create tournament', 500, err.message)
  }
}

exports.updateTournament = async (req, res) => {
  try {
    const { title, game, gameMode, type, entryFee, prizePool, maxSlots, startDate, endDate, description, rules, prizeDistribution, bannerImage, isFeatured, registrationDeadline, maxSubstitutes } = req.body
    const tournament = await Tournament.findByIdAndUpdate(req.params.id, { title, game, gameMode, type, entryFee, prizePool, maxSlots, startDate, endDate, description, rules, prizeDistribution, bannerImage, isFeatured, registrationDeadline, maxSubstitutes }, { new: true })
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
    if (!tournament.isRegistrationOpen()) {
      const filled = tournament.participants?.length || 0
      const reason = !['registration_open', 'upcoming'].includes(tournament.status)
        ? `Status is "${tournament.status}"`
        : filled >= tournament.maxSlots
        ? 'Tournament is full'
        : 'Registration deadline has passed'
      return error(res, `Registration closed: ${reason}`, 400)
    }
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
    const rzp = await getRazorpay()
    const order = await rzp.orders.create({
      amount: tournament.entryFee * 100,
      currency: 'INR',
      receipt: `t${tournament._id}`.slice(0, 40),
    })
    return success(res, { orderId: order.id, amount: order.amount, currency: order.currency })
  } catch (err) {
    console.error('Registration error:', JSON.stringify(err, Object.getOwnPropertyNames(err)))
    const errMsg = err.message || err.error?.description || err.statusMessage || JSON.stringify(err)
    return error(res, `Registration failed: ${errMsg}`, 500, errMsg)
  }
}

exports.confirmPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
    const tournament = await Tournament.findById(req.params.id)
    if (!tournament) return error(res, 'Tournament not found', 404)

    // Verify signature
    const secret = await getRazorpaySecret()
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
    if (expected !== razorpay_signature) return error(res, 'Payment verification failed', 400)

    // Prevent duplicate payment confirmation
    if (tournament.participants.some(p => p.paymentId === razorpay_payment_id)) {
      return error(res, 'Payment already confirmed', 400)
    }

    // Add participant
    const { inGameId, teamName, teamMembers } = req.body
    tournament.participants.push({
      userId: req.user._id,
      username: req.user.username,
      email: req.user.email,
      inGameId: inGameId || '',
      teamName: teamName || undefined,
      teamMembers: teamMembers || [],
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

function getSeeds(numRounds) {
  let seeds = [0]
  for (let r = 0; r < numRounds; r++) {
    const newSeeds = []
    const maxSeed = Math.pow(2, r + 1) - 1
    for (const seed of seeds) {
      newSeeds.push(seed)
      newSeeds.push(maxSeed - seed)
    }
    seeds = newSeeds
  }
  return seeds
}

function getRoundName(round, totalRounds) {
  const fromFinal = totalRounds - round
  if (fromFinal === 0) return 'Final'
  if (fromFinal === 1) return 'Semi Final'
  if (fromFinal === 2) return 'Quarter Final'
  const teamsInRound = Math.pow(2, totalRounds - round + 1)
  return `Round of ${teamsInRound}`
}

exports.generateBrackets = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
    if (!tournament) return error(res, 'Tournament not found', 404)
    if (tournament.bracketsGenerated) return error(res, 'Brackets already generated', 400)

    const participants = tournament.participants
    if (participants.length < 2) return error(res, 'Need at least 2 participants', 400)

    const { shuffle = false, thirdPlace = false } = req.body
    const numTeams = participants.length
    const numRounds = Math.ceil(Math.log2(numTeams))
    const bracketSize = Math.pow(2, numRounds)
    const seeds = getSeeds(numRounds)

    let participantOrder = Array.from({ length: numTeams }, (_, i) => i)
    if (shuffle) {
      for (let i = participantOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [participantOrder[i], participantOrder[j]] = [participantOrder[j], participantOrder[i]]
      }
    }

    const matches = []
    let matchNumber = 1

    // Calculate match counts per round for nextMatchNumber computation
    const matchesPerRound = []
    let size = bracketSize
    for (let r = 0; r < numRounds; r++) {
      matchesPerRound.push(size / 2)
      size /= 2
    }

    // Running offset for match numbering per round
    const roundStartMatch = [1]
    for (let r = 1; r < numRounds; r++) {
      roundStartMatch[r] = roundStartMatch[r - 1] + matchesPerRound[r - 1]
    }

    // Round 1
    for (let i = 0; i < bracketSize; i += 2) {
      const seed1 = seeds[i]
      const seed2 = seeds[i + 1]
      const idx1 = seed1 < numTeams ? participantOrder[seed1] : null
      const idx2 = seed2 < numTeams ? participantOrder[seed2] : null

      const nextMatch = numRounds > 1
        ? roundStartMatch[1] + Math.floor((matchNumber - 1) / 2)
        : null

      const match = {
        matchNumber,
        round: 1,
        roundName: getRoundName(1, numRounds),
        team1: idx1 !== null ? { participantIndex: idx1, teamName: participants[idx1].teamName || participants[idx1].username } : undefined,
        team2: idx2 !== null ? { participantIndex: idx2, teamName: participants[idx2].teamName || participants[idx2].username } : undefined,
        isBye: idx1 === null || idx2 === null,
        nextMatchNumber: nextMatch,
        status: 'pending',
      }

      // Auto-advance byes
      if (match.isBye && (idx1 !== null || idx2 !== null)) {
        const winnerIdx = idx1 !== null ? idx1 : idx2
        match.winner = winnerIdx
        match.status = 'completed'
      }

      matches.push(match)
      matchNumber++
    }

    // Subsequent rounds
    for (let r = 2; r <= numRounds; r++) {
      const numMatchesInRound = matchesPerRound[r - 1]
      for (let m = 0; m < numMatchesInRound; m++) {
        const nextMatch = r < numRounds
          ? roundStartMatch[r] + Math.floor(m / 2)
          : null

        matches.push({
          matchNumber,
          round: r,
          roundName: getRoundName(r, numRounds),
          team1: undefined,
          team2: undefined,
          nextMatchNumber: nextMatch,
          status: 'pending',
        })
        matchNumber++
      }
    }

    // Advance bye winners into round 2
    for (const match of matches) {
      if (match.status === 'completed' && match.winner !== undefined && match.nextMatchNumber) {
        const nextMatch = matches.find(m => m.matchNumber === match.nextMatchNumber)
        if (nextMatch) {
          const winnerData = {
            participantIndex: match.winner,
            teamName: (match.team1 && match.team1.participantIndex === match.winner)
              ? match.team1.teamName
              : (match.team2 ? match.team2.teamName : undefined),
          }
          if (!nextMatch.team1 || nextMatch.team1.participantIndex === undefined) {
            nextMatch.team1 = winnerData
          } else {
            nextMatch.team2 = winnerData
          }
        }
      }
    }

    // Auto-complete any round 2+ matches where both feeder matches were byes and only one team arrived
    // (or both arrived due to double byes — check recursively)
    let changed = true
    while (changed) {
      changed = false
      for (const match of matches) {
        if (match.status !== 'pending') continue
        const hasTeam1 = match.team1 && match.team1.participantIndex !== undefined
        const hasTeam2 = match.team2 && match.team2.participantIndex !== undefined

        // Check if all feeder matches for this match are completed
        const feeders = matches.filter(m => m.nextMatchNumber === match.matchNumber)
        const allFeedersComplete = feeders.length > 0 && feeders.every(m => m.status === 'completed')

        if (allFeedersComplete && hasTeam1 !== hasTeam2) {
          // One team bye-advanced, other slot empty
          const winnerIdx = hasTeam1 ? match.team1.participantIndex : match.team2.participantIndex
          const winnerName = hasTeam1 ? match.team1.teamName : match.team2.teamName
          match.winner = winnerIdx
          match.status = 'completed'
          match.isBye = true
          changed = true

          if (match.nextMatchNumber) {
            const next = matches.find(m => m.matchNumber === match.nextMatchNumber)
            if (next) {
              const data = { participantIndex: winnerIdx, teamName: winnerName }
              if (!next.team1 || next.team1.participantIndex === undefined) {
                next.team1 = data
              } else {
                next.team2 = data
              }
            }
          }
        }
      }
    }

    tournament.brackets = matches
    tournament.bracketsGenerated = true
    tournament.thirdPlaceMatch = thirdPlace
    tournament.totalRounds = numRounds
    tournament.currentRound = 1
    tournament.status = 'ongoing'
    await tournament.save()

    return success(res, tournament.brackets, 'Brackets generated')
  } catch (err) {
    return error(res, 'Failed to generate brackets', 500, err.message)
  }
}

exports.updateMatchResult = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
    if (!tournament) return error(res, 'Tournament not found', 404)
    if (!tournament.bracketsGenerated) return error(res, 'Brackets not generated', 400)

    const matchNumber = parseInt(req.params.matchNumber)
    const match = tournament.brackets.find(m => m.matchNumber === matchNumber)
    if (!match) return error(res, 'Match not found', 404)
    if (match.status === 'completed') return error(res, 'Match already completed', 400)

    const { winner, team1Score, team2Score, team1Stats, team2Stats } = req.body
    if (winner === undefined) return error(res, 'Winner is required', 400)

    if (match.team1) {
      match.team1.score = team1Score
      if (team1Stats) match.team1.stats = team1Stats
    }
    if (match.team2) {
      match.team2.score = team2Score
      if (team2Stats) match.team2.stats = team2Stats
    }
    match.winner = winner
    match.status = 'completed'

    // Advance winner to next match
    if (match.nextMatchNumber) {
      const nextMatch = tournament.brackets.find(m => m.matchNumber === match.nextMatchNumber)
      if (nextMatch) {
        const winnerTeam = (match.team1 && match.team1.participantIndex === winner) ? match.team1 : match.team2
        const winnerData = {
          participantIndex: winner,
          teamName: winnerTeam ? winnerTeam.teamName : undefined,
        }
        if (!nextMatch.team1 || nextMatch.team1.participantIndex === undefined) {
          nextMatch.team1 = winnerData
        } else {
          nextMatch.team2 = winnerData
        }
      }
    }

    // 3rd place match: if both semi-finals done
    if (tournament.thirdPlaceMatch && match.roundName === 'Semi Final') {
      const semis = tournament.brackets.filter(m => m.roundName === 'Semi Final')
      if (semis.every(s => s.status === 'completed')) {
        const existing3rd = tournament.brackets.find(m => m.roundName === '3rd Place')
        if (!existing3rd) {
          const losers = semis.map(s => {
            const loserIdx = s.team1.participantIndex === s.winner
              ? s.team2.participantIndex
              : s.team1.participantIndex
            const loserName = s.team1.participantIndex === s.winner
              ? s.team2.teamName
              : s.team1.teamName
            return { participantIndex: loserIdx, teamName: loserName }
          })
          const maxMatchNum = Math.max(...tournament.brackets.map(m => m.matchNumber))
          tournament.brackets.push({
            matchNumber: maxMatchNum + 1,
            round: tournament.totalRounds,
            roundName: '3rd Place',
            team1: losers[0],
            team2: losers[1],
            status: 'pending',
          })
        }
      }
    }

    // Auto-complete tournament if final is done
    const finalMatch = tournament.brackets.find(m => m.roundName === 'Final')
    if (finalMatch && finalMatch.status === 'completed') {
      if (!tournament.thirdPlaceMatch) {
        tournament.status = 'completed'
      } else {
        const thirdPlace = tournament.brackets.find(m => m.roundName === '3rd Place')
        if (thirdPlace && thirdPlace.status === 'completed') {
          tournament.status = 'completed'
        }
      }
    }

    // Update currentRound
    const currentRoundMatches = tournament.brackets.filter(m => m.round === tournament.currentRound && m.roundName !== '3rd Place')
    if (currentRoundMatches.every(m => m.status === 'completed') && tournament.currentRound < tournament.totalRounds) {
      tournament.currentRound++
    }

    await tournament.save()
    return success(res, tournament.brackets, 'Match result updated')
  } catch (err) {
    return error(res, 'Failed to update match result', 500, err.message)
  }
}

exports.demoFill = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
    if (!tournament) return error(res, 'Tournament not found', 404)
    const { count } = req.body
    if (!count || count < 1) return error(res, 'Count must be at least 1', 400)

    const existing = tournament.participants.length
    for (let i = 1; i <= count; i++) {
      tournament.participants.push({
        userId: new mongoose.Types.ObjectId(),
        username: `Demo Team ${existing + i}`,
        teamName: `Demo Team ${existing + i}`,
        inGameId: `demo_${existing + i}`,
        email: `demo${existing + i}@test.com`,
        paymentStatus: 'paid',
      })
    }

    tournament.filledSlots = tournament.participants.length
    await tournament.save()

    return success(res, tournament.participants, `Added ${count} demo teams`)
  } catch (err) {
    return error(res, 'Failed to add demo participants', 500, err.message)
  }
}

exports.resetBrackets = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
    if (!tournament) return error(res, 'Tournament not found', 404)

    tournament.brackets = []
    tournament.bracketsGenerated = false
    tournament.currentRound = 0
    tournament.totalRounds = 0
    await tournament.save()

    return success(res, null, 'Brackets reset')
  } catch (err) {
    return error(res, 'Failed to reset brackets', 500, err.message)
  }
}

exports.sendMatchRoomDetails = async (req, res) => {
  try {
    const User = require('../models/User')
    const tournament = await Tournament.findById(req.params.id)
    if (!tournament) return error(res, 'Tournament not found', 404)

    const matchNumber = parseInt(req.params.matchNumber)
    const match = tournament.brackets.find(m => m.matchNumber === matchNumber)
    if (!match) return error(res, 'Match not found', 404)

    const { roomId, roomPassword } = req.body
    if (!roomId) return error(res, 'Room ID is required', 400)

    match.roomId = roomId
    match.roomPassword = roomPassword || ''
    match.roomDetailsSent = true

    const teamIndices = []
    if (match.team1?.participantIndex !== undefined) teamIndices.push(match.team1.participantIndex)
    if (match.team2?.participantIndex !== undefined) teamIndices.push(match.team2.participantIndex)

    const notification = {
      title: `Room Details: ${match.roundName}`,
      message: `Room ID: ${roomId}${roomPassword ? ` | Password: ${roomPassword}` : ''} — ${tournament.title} (Game ${matchNumber})`,
      type: 'info',
    }
    for (const idx of teamIndices) {
      const p = tournament.participants[idx]
      if (!p?.userId) continue
      await User.findByIdAndUpdate(p.userId, { $push: { notifications: { $each: [notification], $position: 0 } } }).catch(() => {})
    }

    let sent = 0
    const { sendEmail, emailTemplates } = require('../utils/email')
    for (const idx of teamIndices) {
      const p = tournament.participants[idx]
      if (!p) continue
      const emails = [p.email, ...(p.teamMembers || []).map(m => m.email)].filter(Boolean)
      for (const email of emails) {
        try {
          const name = p.teamName || p.username || 'Player'
          const html = `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#1a1a2e;color:#fff;padding:30px;border-radius:12px;">
              <h2 style="color:#FF6B2B;">🎮 Match Room Details</h2>
              <p>Hi <strong>${name}</strong>,</p>
              <p>Your <strong>${match.roundName}</strong> match in <strong>${tournament.title}</strong> is ready!</p>
              <div style="background:#16213e;padding:15px;border-radius:8px;margin:15px 0;">
                <p style="margin:5px 0;"><strong>Room ID:</strong> <span style="color:#00d4ff;font-size:18px;">${roomId}</span></p>
                ${roomPassword ? `<p style="margin:5px 0;"><strong>Password:</strong> <span style="color:#00d4ff;font-size:18px;">${roomPassword}</span></p>` : ''}
                <p style="margin:5px 0;"><strong>Match:</strong> ${match.roundName} - Game ${matchNumber}</p>
              </div>
              <p style="color:#888;font-size:12px;">Good luck! 🏆</p>
            </div>`
          await sendEmail({ to: email, subject: `Room Details: ${match.roundName} - ${tournament.title}`, html })
          sent++
        } catch {}
      }
    }

    await tournament.save()
    return success(res, { sent, matchNumber }, `Room details sent to ${sent} players for match ${matchNumber}`)
  } catch (err) {
    return error(res, 'Failed to send match room details', 500, err.message)
  }
}

exports.getBrackets = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
    if (!tournament) return error(res, 'Tournament not found', 404)

    const byRound = {}
    for (const match of tournament.brackets) {
      const key = match.roundName || `Round ${match.round}`
      if (!byRound[key]) byRound[key] = []
      byRound[key].push(match)
    }

    return success(res, {
      bracketsGenerated: tournament.bracketsGenerated,
      totalRounds: tournament.totalRounds,
      currentRound: tournament.currentRound,
      thirdPlaceMatch: tournament.thirdPlaceMatch,
      rounds: byRound,
    })
  } catch (err) {
    return error(res, 'Failed to fetch brackets', 500, err.message)
  }
}
