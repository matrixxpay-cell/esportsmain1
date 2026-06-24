# IndiaEsports 🎮

**Ab Nahi Khelega India Toh Kab Khelega?**

India's Premier Esports Tournament Platform — compete in CS:GO, BGMI, Valorant, Free Fire, Mobile Legends, Dota 2, and eFootball tournaments with real cash prizes.

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS, Framer Motion, Zustand
- **Backend**: Node.js, Express.js, MongoDB Atlas, Socket.io
- **Payments**: Razorpay + UPI
- **Auth**: JWT + Email verification
- **Storage**: Cloudinary

## Quick Start

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

See `backend/.env.example` for all required variables.

## Features

- Premium glassmorphism UI with neon blue/purple/cyan accents
- Animated hero section with live statistics
- Tournament system (free & paid) for 7 games
- Admin-only tournament creation
- Wallet system with Razorpay/UPI integration
- Real-time updates via Socket.io
- AI-powered bracket & fixture generation
- JWT authentication + email verification
- Comprehensive admin panel
- Global leaderboards
- Mobile-first responsive design
