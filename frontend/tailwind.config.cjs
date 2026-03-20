/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#40C4FF',
        'brand-dark': '#0d1117',
        'brand-card': '#161b22',
        'brand-border': '#30363d',
      }
    },
  },
  plugins: [],
}
