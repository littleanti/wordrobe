/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backgroundImage: {
        'wordrobe-gradient': 'linear-gradient(to top right, #ec4899, #f43f5e, #fb923c)',
        'wordrobe-gradient-subtle': 'linear-gradient(to top right, #ec489920, #f43f5e20, #fb923c20)',
        'wordrobe-gradient-mesh': 'radial-gradient(ellipse at 20% 50%, #ec489918 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #a855f718 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, #fb923c18 0%, transparent 50%)',
      },
      boxShadow: {
        'glow': '0 0 20px 2px rgba(236, 72, 153, 0.25)',
        'glow-sm': '0 0 10px 1px rgba(236, 72, 153, 0.15)',
      },
      colors: {
        zinc: {
          950: '#09090b',
        },
      },
      keyframes: {
        'slide-up': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.18s ease-out',
      },
    },
  },
  plugins: [],
};
