/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [
    require('flowbite/plugin')
  ],
  content: [
    "./src/**/*.{html,ts}",
    "./src/assets/articles/featured/*.md",
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
        '100': '100px',
        '150': '150px',
        '145': '145px',
        '225': '225px',
      },
      minWidth: {
        '140': '140px',
        '150': '150px',
        '145': '145px',
        '160': '160px',
        '225': '225px',
      },
      maxWidth: {
        '150': '150px',
        '145': '145px',
        '160': '160px',
        '225': '225px',
      },
    },
  }
}

