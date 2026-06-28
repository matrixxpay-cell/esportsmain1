const mongoose = require('mongoose')

const platformConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  category: { type: String, enum: ['platform', 'api_keys', 'security', 'email', 'announcement'], required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

platformConfigSchema.statics.get = async function (key, defaultValue = null) {
  const doc = await this.findOne({ key })
  return doc ? doc.value : defaultValue
}

platformConfigSchema.statics.set = async function (key, value, category, userId) {
  return this.findOneAndUpdate(
    { key },
    { value, category, updatedBy: userId },
    { upsert: true, new: true }
  )
}

platformConfigSchema.statics.getByCategory = async function (category) {
  const docs = await this.find({ category })
  const result = {}
  for (const doc of docs) result[doc.key] = doc.value
  return result
}

module.exports = mongoose.model('PlatformConfig', platformConfigSchema)
