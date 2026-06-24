export interface Game {
  id: string
  name: string
  shortName: string
  genre: string
  image: string
  banner: string
  icon: string
  color: string
  glowColor: string
  description: string
  platforms: string[]
  maxTeamSize: number
  minTeamSize: number
}

export const GAMES: Game[] = [
  {
    id: 'csgo',
    name: 'Counter-Strike: Global Offensive',
    shortName: 'CS:GO',
    genre: 'FPS',
    image: '/games/csgo.jpg',
    banner: '/games/csgo-banner.jpg',
    icon: '/games/csgo-icon.png',
    color: '#F4A418',
    glowColor: 'rgba(244, 164, 24, 0.3)',
    description: 'The premier tactical FPS — plant or defuse bombs, eliminate opponents, and climb to Global Elite.',
    platforms: ['PC'],
    maxTeamSize: 5,
    minTeamSize: 1,
  },
  {
    id: 'mobile-legends',
    name: 'Mobile Legends: Bang Bang',
    shortName: 'MLBB',
    genre: 'MOBA',
    image: '/games/mobile-legends.jpg',
    banner: '/games/mobile-legends-banner.jpg',
    icon: '/games/mobile-legends-icon.png',
    color: '#00E5FF',
    glowColor: 'rgba(0, 229, 255, 0.3)',
    description: '5v5 MOBA battle on mobile — choose your hero, destroy the enemy base, and claim victory.',
    platforms: ['Mobile'],
    maxTeamSize: 5,
    minTeamSize: 1,
  },
  {
    id: 'bgmi',
    name: 'Battlegrounds Mobile India',
    shortName: 'BGMI',
    genre: 'Battle Royale',
    image: '/games/bgmi.jpg',
    banner: '/games/bgmi-banner.jpg',
    icon: '/games/bgmi-icon.png',
    color: '#FF6B2B',
    glowColor: 'rgba(255, 107, 43, 0.3)',
    description: 'India\'s official battle royale — survive against 100 players and be the last one standing.',
    platforms: ['Mobile'],
    maxTeamSize: 4,
    minTeamSize: 1,
  },
  {
    id: 'free-fire',
    name: 'Free Fire',
    shortName: 'FF',
    genre: 'Battle Royale',
    image: '/games/free-fire.jpg',
    banner: '/games/free-fire-banner.jpg',
    icon: '/games/free-fire-icon.png',
    color: '#FF4E16',
    glowColor: 'rgba(255, 78, 22, 0.3)',
    description: 'Fast-paced 10-minute battle royale — land, loot, survive, and become the Booyah champion.',
    platforms: ['Mobile'],
    maxTeamSize: 4,
    minTeamSize: 1,
  },
  {
    id: 'valorant',
    name: 'Valorant',
    shortName: 'VAL',
    genre: 'FPS',
    image: '/games/valorant.jpg',
    banner: '/games/valorant-banner.jpg',
    icon: '/games/valorant-icon.png',
    color: '#FF4655',
    glowColor: 'rgba(255, 70, 85, 0.3)',
    description: 'Tactical FPS with unique agent abilities — precision gunplay meets game-changing powers.',
    platforms: ['PC'],
    maxTeamSize: 5,
    minTeamSize: 1,
  },
  {
    id: 'dota2',
    name: 'Dota 2',
    shortName: 'Dota 2',
    genre: 'MOBA',
    image: '/games/dota2.jpg',
    banner: '/games/dota2-banner.jpg',
    icon: '/games/dota2-icon.png',
    color: '#A84500',
    glowColor: 'rgba(168, 69, 0, 0.3)',
    description: 'The deepest strategy MOBA — every match is different with 120+ heroes and infinite possibilities.',
    platforms: ['PC'],
    maxTeamSize: 5,
    minTeamSize: 1,
  },
  {
    id: 'efootball',
    name: 'eFootball',
    shortName: 'eFootball',
    genre: 'Sports',
    image: '/games/efootball.jpg',
    banner: '/games/efootball-banner.jpg',
    icon: '/games/efootball-icon.png',
    color: '#1B5E20',
    glowColor: 'rgba(27, 94, 32, 0.3)',
    description: 'The most authentic football simulation — dribble, pass, shoot, and conquer the pitch.',
    platforms: ['PC', 'Mobile', 'Console'],
    maxTeamSize: 1,
    minTeamSize: 1,
  },
]

export const GAME_IDS = GAMES.map((g) => g.id)

export const getGameById = (id: string): Game | undefined =>
  GAMES.find((g) => g.id === id)
