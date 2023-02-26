/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        Laser: ['LaserCorpsLaser', 'sans-serif'],
        LaserCorps: ['LaserCorps', 'sans-serif'],
        Power: ['Power', 'sans-serif'],
      },
      colors: {
        PINK: 'rgb(255, 0, 153)',
        BLUE: 'rgb(71, 191, 242)',
        darkBlue: '#0c1142',
        gray: 'rgb(107 114 128)',
        secondaryGray: 'rgb(166, 173, 187)',
      },
    },
  },
  plugins: [require('daisyui')],
  // daisyui: {
  //   themes: ['coffee', 'luxury', 'cyberpunk'],
  // },
};
