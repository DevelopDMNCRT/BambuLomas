/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f8f7',
          100: '#e1efed',
          200: '#c5dfdb',
          300: '#9bc8c2',
          400: '#6ca8a1',
          500: '#4f8a84',
          600: '#40716b',
          700: '#355c58',
          800: '#2d4b48',
          900: '#273f3d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
