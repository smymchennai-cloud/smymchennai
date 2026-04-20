/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        keyframes: {
          bulandiTitleGradient: {
            '0%, 100%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
          },
          bulandiAmbientDrift: {
            '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
            '50%': { opacity: '0.85', transform: 'scale(1.02)' },
          },
        },
        animation: {
          bulandiTitleGradient: 'bulandiTitleGradient 5s ease-in-out infinite',
          bulandiAmbientDrift: 'bulandiAmbientDrift 6s ease-in-out infinite',
        },
      },
    },
    plugins: [],
  }