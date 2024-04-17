/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [
    require('flowbite/plugin')
  ],
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'mono': ['Roboto Mono', 'sans-serif']
      },
      colors: {
        'default': '#fff',
        'emerald-480': '#1a9f7a',
      },
      height: {
        '260': '260px'
      },
      width: {
        '150': '150px',
        '145': '145px'
      }
    },
  }
}

