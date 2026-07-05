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
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.25)',
        'red-glow': '0 0 15px rgba(139, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
