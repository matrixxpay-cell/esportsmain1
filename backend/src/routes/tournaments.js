const express = require('express')
const router = express.Router()
const tournamentController = require('../controllers/tournamentController')
const { auth, adminAuth } = require('../middleware/auth')

router.get('/', tournamentController.getTournaments)
router.get('/my/registered', auth, tournamentController.getMyTournaments)

router.get('/lookup/mlbb', auth, async (req, res) => {
  const { id, zone } = req.query
  if (!id || !zone) return res.status(400).json({ success: false, message: 'id and zone required' })

  const apis = [
    `https://api.isan.eu.org/nickname/ml?id=${id}&zone=${zone}`,
    `https://mlbb-api.vercel.app/api/nickname?id=${id}&zone=${zone}`,
  ]

  for (const url of apis) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timeout)
      if (!response.ok) continue
      const data = await response.json()
      const nickname = data.nickname || data.name || data.username
      if (nickname) return res.json({ success: true, data: { nickname } })
    } catch {}
  }

  return res.status(404).json({ success: false, message: 'Player not found. Please verify your User ID and Zone.' })
})

router.get('/:id', tournamentController.getTournament)

router.post('/', adminAuth, tournamentController.createTournament)
router.put('/:id', adminAuth, tournamentController.updateTournament)
router.patch('/:id/status', adminAuth, tournamentController.updateStatus)
router.delete('/:id', adminAuth, tournamentController.deleteTournament)
router.post('/:id/results', adminAuth, tournamentController.publishResults)
router.post('/:id/room-details', adminAuth, tournamentController.sendRoomDetails)

router.post('/:id/register', auth, tournamentController.registerForTournament)
router.post('/:id/confirm-payment', auth, tournamentController.confirmPayment)

module.exports = router
