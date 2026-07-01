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

router.get('/site-mode', async (req, res) => {
  try {
    const comingSoon = await PlatformConfig.get('coming_soon_enabled', 'false')
    const registrationDisabled = await PlatformConfig.get('registration_disabled', 'false')
    return success(res, {
      comingSoon: comingSoon === 'true' || comingSoon === true,
      registrationDisabled: registrationDisabled === 'true' || registrationDisabled === true,
    })
  } catch (err) {
    return error(res, 'Failed', 500)
  }
})

router.get('/logo', async (req, res) => {
  try {
    const url = await PlatformConfig.get('site_logo', null)
    return success(res, { url })
  } catch (err) {
    return error(res, 'Failed', 500)
  }
})

router.get('/stats', async (req, res) => {
  try {
    const data = await PlatformConfig.get('homepage_stats', null)
    return success(res, data)
  } catch (err) {
    return error(res, 'Failed', 500)
  }
})

router.get('/config/razorpay-key', async (req, res) => {
  try {
    const { getRazorpayKeyId } = require('../utils/razorpay')
    const keyId = await getRazorpayKeyId()
    return success(res, { keyId })
  } catch (err) {
    return error(res, 'Failed', 500)
  }
})

module.exports = router
