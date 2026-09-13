/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#141019',
          900: '#1c1622',
          800: '#251c2e',
          700: '#332639',
        },
        parchment: {
          100: '#f3ecd8',
          200: '#e9dfc3',
          300: '#dccca3',
        },
        ember: {
          400: '#f0a15c',
          500: '#e8823f',
          600: '#c9642a',
        },
        moss: {
          400: '#8fae6b',
          500: '#6f9450',
        },
        frost: {
          400: '#7ec8e3',
          500: '#4baac8',
          600: '#2d8aac',
        },
        verdant: {
          400: '#6dbf67',
          500: '#4a9e44',
          600: '#327832',
        },
        void: {
          400: '#b57aff',
          500: '#9350e8',
          600: '#6e2ec9',
        },
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(232, 130, 63, 0.55)',
        'glow-frost': '0 0 24px -4px rgba(75, 170, 200, 0.55)',
        'glow-verdant': '0 0 24px -4px rgba(74, 158, 68, 0.55)',
        'glow-void': '0 0 24px -4px rgba(147, 80, 232, 0.55)',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '60%': { transform: 'scale(1.04)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}

