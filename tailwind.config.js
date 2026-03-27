/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-black': '#050505',
        'neon-emerald': '#00ff88',
        'neon-purple': '#bf00ff',
        'neon-gold': '#ffd700',
        'glass-bg': 'rgba(20, 20, 20, 0.5)',
        'glass-border': 'rgba(255, 255, 255, 0.08)'
      },
      fontFamily: {
        'cyber': ['Inter', 'Space Grotesk', 'sans-serif']
      },
      dropShadow: {
        'neon-green': '0 0 12px rgba(0, 255, 136, 0.6)',
        'neon-purple': '0 0 12px rgba(191, 0, 255, 0.6)',
        'neon-gold': '0 0 12px rgba(255, 215, 0, 0.6)',
      }
    },
  },
  plugins: [],
}
