/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        devanagari: ['Noto Sans Devanagari', 'serif'],
      },
      colors: {
        ink: {
          50:  '#f5f4f2',
          100: '#e8e6e0',
          200: '#cfc9be',
          300: '#b0a898',
          400: '#8f8474',
          500: '#6e6456',
          600: '#564e42',
          700: '#3d3830',
          800: '#28241e',
          900: '#14120e',
        },
        signal: {
          blue:   '#2563eb',
          green:  '#16a34a',
          amber:  '#d97706',
          red:    '#dc2626',
          violet: '#7c3aed',
        },
      },
    },
  },
  plugins: [],
}
