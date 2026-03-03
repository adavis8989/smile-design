/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spg: {
          blue: '#1B4D8E',
          'blue-dark': '#143A6B',
          'blue-light': '#2563EB',
          gold: '#C5A55A',
          'gold-light': '#D4B96E',
          white: '#FFFFFF',
          gray: '#F5F5F5',
          'gray-dark': '#333333',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
