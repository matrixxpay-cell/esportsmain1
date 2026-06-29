const Razorpay = require('razorpay')
const PlatformConfig = require('../models/PlatformConfig')

const getRazorpayConfig = async () => {
  const envKeyId = process.env.RAZORPAY_KEY_ID
  const envKeySecret = process.env.RAZORPAY_KEY_SECRET

  if (envKeyId && envKeySecret) {
    return { key_id: envKeyId, key_secret: envKeySecret }
  }

  const dbKeyId = await PlatformConfig.get('razorpay_key_id')
  const dbKeySecret = await PlatformConfig.get('razorpay_key_secret')

  if (dbKeyId && dbKeySecret && dbKeySecret !== '••••••••') {
    return { key_id: dbKeyId, key_secret: dbKeySecret }
  }

  return {
    key_id: envKeyId || dbKeyId || 'placeholder',
    key_secret: envKeySecret || dbKeySecret || 'placeholder',
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

const getRazorpayKeyId = async () => {
  const config = await getRazorpayConfig()
  return config.key_id
}

module.exports = { getRazorpay, getRazorpaySecret, getRazorpayConfig, getRazorpayKeyId }
