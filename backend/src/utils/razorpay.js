const Razorpay = require('razorpay')
const PlatformConfig = require('../models/PlatformConfig')

const getRazorpayConfig = async () => {
  const keyId = await PlatformConfig.get('razorpay_key_id')
  const keySecret = await PlatformConfig.get('razorpay_key_secret')

  console.log('Razorpay config:', { keyId, hasSecret: !!keySecret, secretLength: keySecret?.length, isMasked: keySecret === '••••••••' })

  if (!keyId || !keySecret || keySecret === '••••••••') {
    throw new Error('Razorpay keys not configured. Go to Admin > Settings > API Keys to set them.')
  }

  return { key_id: keyId, key_secret: keySecret }
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
