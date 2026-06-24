export interface User {
  _id: string
  username: string
  email: string
  phone?: string
  avatar?: string
  role: 'player' | 'admin' | 'super_admin'
  isVerified: boolean
  isActive: boolean
  wallet?: WalletSummary
  stats?: UserStats
  referralCode?: string
  createdAt: string
}

export interface WalletSummary {
  balance: number
  bonusBalance: number
  totalDeposited: number
  totalWon: number
}

export interface UserStats {
  tournamentsPlayed: number
  tournamentsWon: number
  totalEarnings: number
  rank: number
  points: number
}

export interface Tournament {
  _id: string
  title: string
  description: string
  game: string
  gameMode: 'solo' | 'duo' | 'squad'
  type: 'free' | 'paid'
  entryFee: number
  prizePool: number
  prizeDistribution: PrizeDistribution[]
  maxSlots: number
  filledSlots: number
  status: 'upcoming' | 'registration_open' | 'registration_closed' | 'ongoing' | 'completed' | 'cancelled'
  registrationDeadline: string
  startDate: string
  endDate?: string
  rules?: string
  banner?: string
  roomId?: string
  roomPassword?: string
  createdBy: string
  participants: TournamentParticipant[]
  brackets?: Bracket[]
  createdAt: string
}

export interface PrizeDistribution {
  position: number
  amount: number
  percentage: number
}

export interface TournamentParticipant {
  userId: string
  username: string
  avatar?: string
  team?: string[]
  joinedAt: string
  paymentStatus: 'pending' | 'paid' | 'refunded'
}

export interface Bracket {
  round: number
  matches: BracketMatch[]
}

export interface BracketMatch {
  matchId: string
  player1?: TournamentParticipant
  player2?: TournamentParticipant
  winner?: string
  score?: string
  scheduledAt?: string
  status: 'pending' | 'ongoing' | 'completed'
}

export interface Transaction {
  _id: string
  userId: string
  type: 'deposit' | 'withdrawal' | 'prize' | 'entry_fee' | 'referral' | 'bonus' | 'refund'
  amount: number
  status: 'pending' | 'completed' | 'failed'
  description: string
  reference?: string
  createdAt: string
}

export interface Notification {
  _id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  link?: string
  createdAt: string
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatar?: string
  points: number
  tournamentsWon: number
  totalEarnings: number
  game?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
