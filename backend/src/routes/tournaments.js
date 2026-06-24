const express = require('express')
const router = express.Router()
const tournamentController = require('../controllers/tournamentController')
const { auth, adminAuth } = require('../middleware/auth')

router.get('/', tournamentController.getTournaments)
router.get('/my/registered', auth, tournamentController.getMyTournaments)
router.get('/:id', tournamentController.getTournament)

router.post('/', adminAuth, tournamentController.createTournament)
router.put('/:id', adminAuth, tournamentController.updateTournament)
router.post('/:id/results', adminAuth, tournamentController.publishResults)

router.post('/:id/register', auth, tournamentController.registerForTournament)
router.post('/:id/confirm-payment', auth, tournamentController.confirmPayment)

module.exports = router
