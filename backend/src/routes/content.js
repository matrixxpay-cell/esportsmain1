const express = require('express')
const router = express.Router()
const PlatformConfig = require('../models/PlatformConfig')
const { success, error } = require('../utils/response')

// Public endpoints - no auth needed
router.get('/games', async (req, res) => {
  try {
    const data = await PlatformConfig.get('homepage_games', null)
    return success(res, data)
  } catch (err) {
    return error(res, 'Failed', 500)
  }
})

router.get('/sponsors', async (req, res) => {
  try {
    const data = await PlatformConfig.get('homepage_sponsors', [])
    return success(res, data)
  } catch (err) {
    return error(res, 'Failed', 500)
  }
})

router.get('/reviews', async (req, res) => {
  try {
    const data = await PlatformConfig.get('homepage_reviews', [])
    return success(res, data)
  } catch (err) {
    return error(res, 'Failed', 500)
  }
})

router.get('/config/razorpay-key', async (req, res) => {
  try {
    const keyId = await PlatformConfig.get('razorpay_key_id') || process.env.RAZORPAY_KEY_ID || ''
    return success(res, { keyId })
  } catch (err) {
    return error(res, 'Failed', 500)
  }
})

module.exports = router
