/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          DEFAULT: '#25D366',
          dark: '#128C7E',
          light: '#E8F9E0',
        },
        rappi: {
          DEFAULT: '#FF4E00',
          light: '#FFF2ED',
        },
        didi: {
          DEFAULT: '#FFA033',
          light: '#FFF5E8',
        },
        uber: {
          DEFAULT: '#000000',
          light: '#F5F5F5',
        },
        accent: {
          blue: '#4A90E2',
          green: '#52C41A',
          purple: '#9B59B6',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      screens: {
        'xs': '375px',
      },
      boxShadow: {
        'focus': '0 0 0 3px rgba(37, 211, 102, 0.3)',
      },
      transitionDuration: {
        '150': '150ms',
      },
    },
  },
  plugins: [],
}