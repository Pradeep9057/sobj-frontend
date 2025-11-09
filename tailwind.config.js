/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0F0F0F',
          gold: '#D4AF37',
          silver: '#C0C0C0'
        }
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'Poppins', 'sans-serif']
      }
    }
  },
  plugins: []
}


