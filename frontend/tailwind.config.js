/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ATHENA Brand Colors
        charcoal: {
          50: '#f7f7f7',
          100: '#e8e8e8',
          200: '#d4d4d4',
          300: '#b8b8b8',
          400: '#9a9a9a',
          500: '#7a7a7a',
          600: '#5c5c5c',
          700: '#4a4a4a',
          800: '#3a3a3a',
          900: '#2d2d2d',
          950: '#1a1a1a',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Risk semantic colors
        risk: {
          low: '#22c55e',
          moderate: '#f59e0b',
          high: '#f97316',
          veryHigh: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
