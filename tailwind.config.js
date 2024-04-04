/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
      colors: {
        'default': '#fff',
      },
      height: {
        '260': '260px'
      },
      width: {
        '150': '150px',
        '145': '145px'
      }
    },
  },
  plugins: [],
}

