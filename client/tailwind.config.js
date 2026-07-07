/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        luxury: {
          red: {
            light: '#B22222',
            DEFAULT: '#8B0000',
            dark: '#5C0000',
          },
          gold: {
            light: '#F3E5AB',
            DEFAULT: '#D4AF37',
            dark: '#AA820A',
            hover: '#F5D061'
          },
          black: {
            light: '#2C2C2C',
            DEFAULT: '#121212',
            dark: '#0B0B0B',
            soft: '#1E1E1E'
          },
          cream: {
            light: '#FFF5F6',
            DEFAULT: '#FFF0F2',
            dark: '#FFE4E6'
          }
        },
        celebration: {
          'rose-gold': '#B76E79',
          'rose-gold-light': '#D4A0A8',
          'soft-pink': '#FFB6C1',
          'soft-pink-light': '#FFD6E0',
          'royal-purple': '#6A0DAD',
          'royal-purple-light': '#9B59B6',
          'deep-black': '#0A0A0A',
          'elegant-white': '#FAFAFA',
          gold: '#D4AF37',
          'gold-light': '#F5E6C8',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.25)',
        'red-glow': '0 0 15px rgba(139, 0, 0, 0.2)',
        'story-ring': '0 0 0 3px rgba(212, 175, 55, 0.6), 0 0 20px rgba(183, 110, 121, 0.3)',
        'celebration': '0 8px 32px rgba(106, 13, 173, 0.15), 0 0 0 1px rgba(212, 175, 55, 0.1)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'float-heart': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-120px) scale(1.5)' }
        },
        'sparkle': {
          '0%, 100%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1) rotate(180deg)' }
        },
        'story-progress': {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)' }
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'float-heart': 'float-heart 1.5s ease-out forwards',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'story-progress': 'story-progress linear forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}

