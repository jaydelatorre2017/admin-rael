/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {  
       fontFamily: {
        unifraktur: ['"UnifrakturCook"', 'cursive'],
      },
    },
  },
  plugins: [],
}