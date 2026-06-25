/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        accent: {
          50: '#eef3f3',
          100: '#d5e3e3',
          200: '#abc7c7',
          300: '#82abab',
          400: '#629494',
          500: '#4e7a7a',
          600: '#3d6161',
          700: '#2e4a4a',
          800: '#1f3333',
          900: '#101a1a',
        },
      },
    },
  },
  plugins: [],
}
