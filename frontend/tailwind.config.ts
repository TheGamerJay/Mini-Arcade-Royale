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
        // Primary: Electric Blue
        'arcade-primary': '#00C2FF',
        'arcade-primary-dark': '#0099CC',
        'arcade-primary-light': '#40D4FF',
        // Secondary: Royal Purple
        'arcade-secondary': '#7B2FBE',
        'arcade-secondary-dark': '#5B1E8E',
        'arcade-secondary-light': '#9B5FDE',
        // Accent: Neon Cyan / Violet
        'arcade-accent': '#00FFF5',
        'arcade-accent-2': '#BF00FF',
        // Surfaces
        'arcade-dark': '#08080F',
        'arcade-surface': '#0E0E1A',
        'arcade-surface-2': '#141428',
        'arcade-surface-3': '#1A1A35',
        'arcade-border': '#1E1E3A',
        'arcade-border-bright': '#2A2A50',
        // Text
        'arcade-text': '#E8E8F0',
        'arcade-text-muted': '#8888A8',
        'arcade-text-dim': '#5555778',
        // Semantic
        'arcade-success': '#00E676',
        'arcade-warning': '#FFD600',
        'arcade-error': '#FF3D71',
        'arcade-info': '#00B4D8',
        // Gold / Premium
        'arcade-gold': '#FFD700',
        'arcade-gold-dark': '#B8860B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(0, 194, 255, 0.4), 0 0 60px rgba(0, 194, 255, 0.15)',
        'glow-blue-sm': '0 0 10px rgba(0, 194, 255, 0.3)',
        'glow-purple': '0 0 20px rgba(123, 47, 190, 0.5), 0 0 60px rgba(123, 47, 190, 0.2)',
        'glow-purple-sm': '0 0 10px rgba(123, 47, 190, 0.4)',
        'glow-cyan': '0 0 20px rgba(0, 255, 245, 0.4), 0 0 60px rgba(0, 255, 245, 0.15)',
        'glow-cyan-sm': '0 0 10px rgba(0, 255, 245, 0.3)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.15)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        'inner-glow': 'inset 0 0 40px rgba(0, 194, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-arcade': 'linear-gradient(135deg, #00C2FF 0%, #7B2FBE 100%)',
        'gradient-arcade-dark': 'linear-gradient(135deg, #0099CC 0%, #5B1E8E 100%)',
        'gradient-surface': 'linear-gradient(180deg, #0E0E1A 0%, #08080F 100%)',
        'gradient-card': 'linear-gradient(145deg, #141428 0%, #0E0E1A 100%)',
        'gradient-hero': 'radial-gradient(ellipse at 50% 0%, rgba(0,194,255,0.15) 0%, rgba(123,47,190,0.1) 50%, transparent 100%)',
        'gradient-glow': 'radial-gradient(ellipse at center, rgba(0,194,255,0.08) 0%, transparent 70%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'pulse-glow-purple': 'pulseGlowPurple 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
        'count-up': 'fadeIn 0.6s ease-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,194,255,0.3), 0 0 20px rgba(0,194,255,0.1)' },
          '50%': { boxShadow: '0 0 25px rgba(0,194,255,0.6), 0 0 50px rgba(0,194,255,0.25)' },
        },
        pulseGlowPurple: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(123,47,190,0.4), 0 0 20px rgba(123,47,190,0.15)' },
          '50%': { boxShadow: '0 0 25px rgba(123,47,190,0.7), 0 0 50px rgba(123,47,190,0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
      transitionTimingFunction: {
        'arcade': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}

export default config
