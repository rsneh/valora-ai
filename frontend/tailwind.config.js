// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ensure .ts and .tsx are included
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}