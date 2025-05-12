/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'farm-green': '#45a74d',
        'farm-dark-green': '#2E7D32',
        'farm-amber': '#FFA000',
        'farm-light-green': '#8bc34a',
        'farm-brown': '#795548',
        'farm-soil': '#6d4c41',
      },      animation: {
        'grow': 'grow 2s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-in forwards',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-down': 'fadeInDown 0.5s ease-in forwards',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        grow: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ping: {
          '75%, 100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      boxShadow: {
        'panel': '0 4px 15px rgba(0, 0, 0, 0.08)',
        'menu': '0 2px 10px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'panel': '0.75rem',
      }
    },
  },
  plugins: [],
}