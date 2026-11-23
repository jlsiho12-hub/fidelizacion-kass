/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f8',
          100: '#fbe8f2',
          200: '#f7d5e7',
          300: '#f1b3d4',
          400: '#e782b6',
          500: '#d95396',
          600: '#c23478',
          700: '#a3225e',
          800: '#871f4e',
          900: '#711e43',
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounceShort 0.6s ease-in-out 2',
      },
      keyframes: {
        bounceShort: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
