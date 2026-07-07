/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A6B3C',
          light: '#E8F5EE',
          dark: '#134D2B',
        },
        accent: {
          DEFAULT: '#F4A025',
          light: '#FEF3DC',
        },
        danger: {
          DEFAULT: '#C0392B',
          light: '#FDECEA',
        },
        subscription: {
          DEFAULT: '#2D6DA8',
        },
        neutral: {
          900: '#1C1C1E',
          700: '#3C3C43',
          400: '#8E8E93',
          200: '#E5E5EA',
          100: '#F2F2F7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
      spacing: {
        'sp-1': '4px',
        'sp-2': '8px',
        'sp-3': '12px',
        'sp-4': '16px',
        'sp-5': '24px',
        'sp-6': '32px',
        'sp-8': '48px',
        'sp-12': '64px',
      }
    },
  },
  plugins: [],
}
