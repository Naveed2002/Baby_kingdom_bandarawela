/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'baby-pink': '#FFB6C1',
        'baby-blue': '#87CEEB',
        'baby-cream': '#FFF8DC',
        'primary': '#FF69B4',
        'secondary': '#4A90E2',
        'accent': '#FFD700',
        'gradient-start': '#667eea',
        'gradient-end': '#764ba2',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'loop-scroll': 'loop-scroll 60s linear infinite', // 👈 added
      },
      keyframes: {
        'loop-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
