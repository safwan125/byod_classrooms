/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#4f46e5', light: '#818cf8', dark: '#3730a3', 50: '#eef2ff', 100: '#e0e7ff' },
        violet:    { DEFAULT: '#7c3aed', light: '#a78bfa' },
        cyan:      { DEFAULT: '#06b6d4', light: '#67e8f9' },
        success:   { DEFAULT: '#10b981', light: '#d1fae5' },
        danger:    { DEFAULT: '#f43f5e', light: '#ffe4e6' },
        warning:   { DEFAULT: '#f59e0b', light: '#fef3c7' },
        surface:   '#f0f0ff',
        sidebar:   '#0f0c29',
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      boxShadow: {
        card:       '0 1px 4px rgba(79,70,229,0.08), 0 1px 2px rgba(79,70,229,0.04)',
        'card-hover':'0 8px 24px rgba(79,70,229,0.14), 0 2px 8px rgba(79,70,229,0.08)',
        primary:    '0 4px 14px rgba(79,70,229,0.4)',
        alert:      '0 4px 16px rgba(244,63,94,0.3)',
        glow:       '0 0 24px rgba(99,102,241,0.35)',
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(180deg,#0f0c29 0%,#302b63 60%,#24243e 100%)',
        'primary-gradient': 'linear-gradient(135deg,#4f46e5,#7c3aed)',
        'success-gradient': 'linear-gradient(135deg,#10b981,#06b6d4)',
        'danger-gradient':  'linear-gradient(135deg,#f43f5e,#f59e0b)',
        'card-shimmer':     'linear-gradient(135deg,rgba(79,70,229,0.04) 0%,rgba(124,58,237,0.04) 100%)',
      },
      animation: {
        'fade-in':   'fadeIn .3s ease-out',
        'slide-up':  'slideUp .4s ease-out',
        'slide-in':  'slideIn .35s ease-out',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
        'shake':     'shake .4s ease',
        'ping-slow': 'ping 2s cubic-bezier(0,0,.2,1) infinite',
      },
      keyframes: {
        fadeIn:   { '0%':{opacity:'0'},                                  '100%':{opacity:'1'} },
        slideUp:  { '0%':{opacity:'0',transform:'translateY(16px)'},     '100%':{opacity:'1',transform:'translateY(0)'} },
        slideIn:  { '0%':{opacity:'0',transform:'translateX(-12px)'},    '100%':{opacity:'1',transform:'translateX(0)'} },
        pulseDot: { '0%,100%':{opacity:1,transform:'scale(1)'},          '50%':{opacity:.5,transform:'scale(1.3)'} },
        shake:    { '0%,100%':{transform:'translateX(0)'},               '20%,60%':{transform:'translateX(-6px)'},'40%,80%':{transform:'translateX(6px)'} },
      },
    },
  },
  plugins: [],
}
