const cloudinary = require('cloudinary').v2
const PlatformConfig = require('../models/PlatformConfig')

const getCloudinary = async () => {
  const cloud_name = await PlatformConfig.get('cloudinary_cloud_name')
  const api_key = await PlatformConfig.get('cloudinary_api_key')
  const api_secret = await PlatformConfig.get('cloudinary_api_secret')

  if (!cloud_name || !api_key || !api_secret || api_secret === '••••••••') {
    throw new Error('Cloudinary not configured. Set credentials in Admin → Settings → API Keys.')
  }

  cloudinary.config({ cloud_name, api_key, api_secret })
  return cloudinary
}

const uploadImage = async (fileBuffer, options = {}) => {
  const cld = await getCloudinary()
  return new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      { folder: 'esportsg', ...options },
      (err, result) => err ? reject(err) : resolve(result)
    )
    stream.end(fileBuffer)
  })
}

module.exports = { getCloudinary, uploadImage }
