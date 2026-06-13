/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Normies Alpha palette — deep space + neon intelligence
        void:    '#080B12',  // true background
        surface: '#0F1420',  // cards / panels
        border:  '#1A2035',  // subtle separators
        muted:   '#2A3550',  // disabled / secondary elements
        ink:     '#8A9BC0',  // secondary text
        text:    '#D6E4FF',  // primary text
        white:   '#FFFFFF',

        // Brand accents
        alpha:   '#5B6EFF',  // primary blue-violet — alpha intelligence
        pulse:   '#00E5A0',  // green — positive / gains / active
        danger:  '#FF4D6A',  // red — alerts / losses
        amber:   '#FFB547',  // yellow — warning / neutral
        whale:   '#9B6BFF',  // purple — whale signals

        // Glow variants (used in box-shadow / filter)
        'alpha-dim': '#5B6EFF33',
        'pulse-dim': '#00E5A033',
        'whale-dim': '#9B6BFF33',
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body:    ['var(--font-inter)', 'sans-serif'],
        mono:    ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'grid-void': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231A2035' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'glow-alpha': 'radial-gradient(ellipse 60% 40% at 50% 0%, #5B6EFF22, transparent)',
        'glow-pulse': 'radial-gradient(ellipse 40% 30% at 50% 100%, #00E5A011, transparent)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow-flicker': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { filter: 'brightness(1)' },
          '100%': { filter: 'brightness(1.3)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      boxShadow: {
        'alpha': '0 0 20px #5B6EFF33, 0 0 40px #5B6EFF11',
        'pulse': '0 0 20px #00E5A033, 0 0 40px #00E5A011',
        'whale': '0 0 20px #9B6BFF33',
        'card': '0 4px 24px rgba(0,0,0,0.5)',
        'glow-alpha': '0 0 0 1px #5B6EFF, 0 0 30px #5B6EFF44',
      },
    },
  },
  plugins: [],
};
