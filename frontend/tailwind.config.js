/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00D9FF',
          purple: '#7C3AED',
          cyan: '#06B6D4',
          pink: '#EC4899',
          green: '#10B981',
        },
        dark: {
          950: '#020617',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        },
        glass: {
          DEFAULT: 'rgba(15, 23, 42, 0.6)',
          light: 'rgba(30, 41, 59, 0.4)',
          dark: 'rgba(2, 6, 23, 0.8)',
        },
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(135deg, #00D9FF 0%, #7C3AED 50%, #06B6D4 100%)',
        'purple-gradient': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0F172A 0%, #020617 100%)',
        'glow-blue': 'radial-gradient(circle, rgba(0, 217, 255, 0.15) 0%, transparent 70%)',
        'glow-purple': 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
        'hero-pattern': "url('/images/hero-bg.svg')",
        'grid-pattern': "url('/images/grid.svg')",
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 217, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(124, 58, 237, 0.5)',
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.5)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'count-up': 'count-up 2s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 217, 255, 0.8), 0 0 60px rgba(0, 217, 255, 0.3)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        gaming: ['Orbitron', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
