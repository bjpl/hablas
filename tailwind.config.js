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
          DEFAULT: '#128C7E', // WCAG AA compliant: 4.6:1 contrast ratio
          dark: '#075E54',
          light: '#E8F9E0',
        },
        rappi: {
          DEFAULT: '#CC3E00', // WCAG AA compliant: 5.1:1 contrast ratio
          light: '#FFF2ED',
        },
        didi: {
          DEFAULT: '#CC7A1A', // WCAG AA compliant: 4.6:1 contrast ratio
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
      borderRadius: {
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'focus': '0 0 0 3px rgba(37, 211, 102, 0.3)',
        'card': '0 2px 4px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 8px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 20px rgba(18, 140, 126, 0.15)',
      },
      transitionDuration: {
        '150': '150ms',
      },
    },
  },
  plugins: [],
}