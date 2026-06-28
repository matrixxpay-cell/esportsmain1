export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''

export const PLATFORM_NAME = 'EsportsG'
export const PLATFORM_TAGLINE = 'Ab Nahi Khelega India Toh Kab Khelega?'
export const PLATFORM_TAGLINE_HINDI = 'अब नहीं खेलेगा इंडिया तो कब खेलेगा?'
export const PLATFORM_SHORT_DESC = 'India Ka Apna Esports Tournament Platform'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'

export const TOURNAMENT_TYPES = {
  FREE: 'free',
  PAID: 'paid',
} as const

export const TOURNAMENT_MODES = {
  SOLO: 'solo',
  DUO: 'duo',
  SQUAD: 'squad',
} as const

export const TOURNAMENT_STATUS = {
  UPCOMING: 'upcoming',
  REGISTRATION_OPEN: 'registration_open',
  REGISTRATION_CLOSED: 'registration_closed',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const USER_ROLES = {
  PLAYER: 'player',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const

export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  PRIZE: 'prize',
  ENTRY_FEE: 'entry_fee',
  REFERRAL: 'referral',
  BONUS: 'bonus',
  REFUND: 'refund',
} as const

export const STATS = {
  totalPlayers: '50,000+',
  activeTournaments: '120+',
  prizePoolDistributed: '₹1.2 Cr+',
  winnersThisWeek: '340+',
}

export const NAV_LINKS = [
  { label: 'Tournaments', href: '/dashboard/tournaments' },
  { label: 'Leaderboard', href: '/dashboard/leaderboard' },
]
