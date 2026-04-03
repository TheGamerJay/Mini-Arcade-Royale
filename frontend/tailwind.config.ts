import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'arcade-primary': '#FF006E',
        'arcade-secondary': '#FB5607',
        'arcade-accent': '#FFBE0B',
        'arcade-dark': '#1A1A1A',
        'arcade-light': '#F5F5F5',
      },
      fontFamily: {
        'arcade': ['Courier New', 'monospace'],
        'display': ['system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'flicker': 'flicker 3s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 0, 110, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(255, 0, 110, 0)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
export default config
