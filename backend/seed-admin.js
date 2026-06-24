require('dotenv').config({ path: __dirname + '/.env' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  const User = require('./src/models/User')
  const Wallet = require('./src/models/Wallet')

  const email = process.env.ADMIN_EMAIL || 'admin@esportsg.gg'
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456'

  const existing = await User.findOne({ email })
  if (existing) {
    console.log('Admin already exists:', email)
    console.log('Role:', existing.role, '| Verified:', existing.isVerified)
    await mongoose.disconnect()
    return
  }

  const hash = await bcrypt.hash(password, 12)

  const admin = await User.create({
    username: 'AdminEsportsG',
    email,
    phone: '9999999999',
    password: hash,
    role: 'super_admin',
    isVerified: true,
    isActive: true,
    referralCode: 'ADMIN001',
  })

  await Wallet.create({
    userId: admin._id,
    balance: 0,
    bonusBalance: 0,
  })

  console.log('✅ Admin created successfully!')
  console.log('   Email   :', email)
  console.log('   Password:', password)
  console.log('   Role    : super_admin')
  await mongoose.disconnect()
}

seedAdmin().catch(e => { console.error(e); process.exit(1) })
