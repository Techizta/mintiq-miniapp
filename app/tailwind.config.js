/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MintIQ Brand Colors
        mint: {
          50: '#e6f7ff',
          100: '#b3e6ff',
          200: '#80d4ff',
          300: '#4dc3ff',
          400: '#1ab1ff',
          500: '#0099e6',
          600: '#0077b3',
          700: '#005580',
          800: '#00334d',
          900: '#001a26',
        },
        gold: {
          50: '#fff9e6',
          100: '#ffecb3',
          200: '#ffdf80',
          300: '#ffd24d',
          400: '#ffc61a',
          500: '#e6ac00',
          600: '#b38600',
          700: '#806000',
          800: '#4d3a00',
          900: '#1a1300',
        },
        dark: {
          50: '#f2f2f3',
          100: '#d9d9db',
          200: '#bfbfc2',
          300: '#a6a6aa',
          400: '#8c8c91',
          500: '#737379',
          600: '#5c5c61',
          700: '#454549',
          800: '#2e2e31',
          850: '#1c1c1f',
          900: '#141417',
          950: '#0a0a0c',
        },
        satz: '#FFD700',
        btc: '#F7931A',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
        display: ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 102, 255, 0.3)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.3)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
        'inner-light': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mint-gradient': 'linear-gradient(135deg, #0066FF 0%, #00D4FF 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        'dark-gradient': 'linear-gradient(180deg, #1c1c1f 0%, #0a0a0c 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'confetti': 'confetti 1s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 102, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 102, 255, 0.6)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-500px) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
