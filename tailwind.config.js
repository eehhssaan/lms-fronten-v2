/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA',
        primary: '#595959',
        secondary: '#A3A3A3',
        accent: '#D9D9D9',
        text: '#333333',
        error: '#D32F2F',
        success: '#388E3C',
        warning: '#F57C00',
        info: '#1976D2',
        white: '#FFFFFF',
        lightGray: '#F5F5F5',
        border: '#E0E0E0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};