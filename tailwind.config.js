/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/ai/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00f6ff',
          pink: '#ff0088',
          green: '#00ff9f',
          red: '#ff0055',
        },
        sciFiBg: '#0a0f1c',
      },
      boxShadow: {
        neon: '0 0 4px rgba(0, 246, 255, 0.4), 0 0 8px rgba(0, 246, 255, 0.3)',
        neonInset: 'inset 0 0 4px rgba(0, 246, 255, 0.3)',
      },
      fontFamily: {
        hud: ['Orbitron', 'sans-serif'],
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 4px #00f6ff, 0 0 8px #00f6ff' },
          '50%': { boxShadow: '0 0 12px #00f6ff, 0 0 24px #00f6ff' },
        },
      },
      animation: {
        glow: 'glow 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};