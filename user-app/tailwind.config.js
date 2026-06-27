/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'aura-bg':       '#09090c',
        'aura-surface':  '#111116',
        'aura-elevated': '#18181f',
        'aura-border':   '#242332',
        'aura-text':     '#f0ece6',
        'aura-muted':    '#7a7688',
        'aura-subtle':   '#36344a',
        'aura-gold':     '#c9a96e',
        'aura-gold-lt':  '#e8d5a3',
        'aura-rose':     '#b87070',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':   'fadeIn 0.35s ease-out',
        'slide-up':  'slideUp 0.4s ease-out',
        'match-pop': 'matchPop 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' },                              to: { opacity: '1' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        matchPop: { from: { opacity: '0', transform: 'scale(0.85)' },    to: { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
