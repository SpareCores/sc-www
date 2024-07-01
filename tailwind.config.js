/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [
    require('flowbite/plugin')
  ],
  content: [
    "./src/**/*.{html,ts}",
    "./src/assets/articles/*.md",
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
        teal: {
          '500': '#14B8A6',
        },
      },
      height: {
        '260': '260px'
      },
      width: {
        '150': '150px',
        '145': '145px',
        '225': '225px',
        '250': '250px',
      },
      minWidth: {
        '140': '140px',
        '150': '150px',
        '145': '145px',
        '160': '160px',
        '225': '225px',
      },
      maxWidth: {
        '140': '140px',
        '150': '150px',
        '145': '145px',
        '160': '160px',
        '225': '225px',
      },
      zIndex: {
        '100': 100,
      }
    },
  }
}

