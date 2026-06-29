const Razorpay = require('razorpay')
const PlatformConfig = require('../models/PlatformConfig')

const getRazorpayConfig = async () => {
  const dbKeyId = await PlatformConfig.get('razorpay_key_id')
  const dbKeySecret = await PlatformConfig.get('razorpay_key_secret')
  return {
    key_id: dbKeyId || process.env.RAZORPAY_KEY_ID || 'placeholder',
    key_secret: dbKeySecret || process.env.RAZORPAY_KEY_SECRET || 'placeholder',
  }
}

const getRazorpay = async () => {
  const config = await getRazorpayConfig()
  return new Razorpay(config)
}

const getRazorpaySecret = async () => {
  const config = await getRazorpayConfig()
  return config.key_secret
}

module.exports = { getRazorpay, getRazorpaySecret, getRazorpayConfig }
