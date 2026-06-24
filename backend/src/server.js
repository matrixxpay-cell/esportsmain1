require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/database')

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

// Connect DB
connectDB()

// Security & middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }))
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV !== 'test') app.use(morgan('combined'))

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true })
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true })
app.use('/api', limiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/tournaments', require('./routes/tournaments'))
app.use('/api/wallet', require('./routes/wallet'))
app.use('/api/leaderboard', require('./routes/leaderboard'))
app.use('/api/admin', require('./routes/admin'))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), env: process.env.NODE_ENV })
})

// Socket.io — Real-time tournament updates
const tournamentRooms = new Map()

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`)

  socket.on('join-tournament', (tournamentId) => {
    socket.join(`tournament:${tournamentId}`)
    if (!tournamentRooms.has(tournamentId)) tournamentRooms.set(tournamentId, new Set())
    tournamentRooms.get(tournamentId).add(socket.id)
  })

  socket.on('leave-tournament', (tournamentId) => {
    socket.leave(`tournament:${tournamentId}`)
    tournamentRooms.get(tournamentId)?.delete(socket.id)
  })

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`)
  })
})

// Broadcast tournament updates
app.set('io', io)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: 'Internal server error' })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🎮 IndiaEsports API — Ab Nahi Khelega India Toh Kab Khelega?`)
})

module.exports = { app, server, io }
