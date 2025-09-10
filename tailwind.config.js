/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.js',
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'primary': '#26252F',
        'secondary': '#5C5C5F',
        'accent': '#D9D9D9',
      },
      fontFamily: {
        'comfortaa': ['Comfortaa', 'sans-serif'],
        'comfortaa-medium': ['Comfortaa_500Medium'],
        'comfortaa-bold': ['Comfortaa_700Bold'],
        'inter': ['Inter', 'sans-serif'],
        'inter-medium': ['Inter_500Medium'],
      },
      fontSize: {
        'time-inactive': ['48px', { lineHeight: '48px' }],
        'time-active': ['72px', { lineHeight: '72px' }],
      },
    },
  },
  plugins: [],
};
