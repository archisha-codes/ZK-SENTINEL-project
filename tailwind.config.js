/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        midnight: '#0F172A',
        cyber: '#00FF94',
        'cyber-purple': '#8B5CF6',
      },
    },
  },
  plugins: [],
};
