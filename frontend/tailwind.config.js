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
        saffron: {
          DEFAULT: '#FF6B2B',
          light: '#FF8C42',
          50: 'rgba(255,107,43,0.05)',
          100: 'rgba(255,107,43,0.1)',
          200: 'rgba(255,107,43,0.2)',
          300: 'rgba(255,107,43,0.3)',
        },
        gold: {
          DEFAULT: '#F59E0B',
          light: '#FCD34D',
          100: 'rgba(245,158,11,0.1)',
        },
        neon: {
          blue: '#60A5FA',
          purple: '#A78BFA',
          cyan: '#34D399',
          pink: '#F472B6',
          green: '#10B981',
        },
        dark: {
          950: '#050810',
          900: '#0A0E1A',
          800: '#111827',
          700: '#1F2937',
        },
        glass: {
          DEFAULT: 'rgba(15,20,40,0.78)',
          light: 'rgba(25,35,65,0.5)',
          dark: 'rgba(5,8,16,0.9)',
        },
      },
      backgroundImage: {
        'indian-gradient': 'linear-gradient(135deg, #FF6B2B 0%, #F59E0B 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0A0E1A 0%, #050810 100%)',
      },
      boxShadow: {
        'saffron': '0 4px 24px rgba(255,107,43,0.35)',
        'gold': '0 4px 24px rgba(245,158,11,0.3)',
        'glass': '0 8px 32px rgba(0,0,0,0.35)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'neon-blue': '0 0 20px rgba(96,165,250,0.4)',
        'neon-purple': '0 0 20px rgba(167,139,250,0.4)',
        'neon-cyan': '0 0 20px rgba(52,211,153,0.4)',
      },
      animation: {
        'float': 'float 3.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
      },
      fontFamily: {
        gaming: ['Rajdhani', 'sans-serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        baloo: ['"Baloo 2"', 'cursive'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
