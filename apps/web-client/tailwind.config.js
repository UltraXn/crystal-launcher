/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    // preflight: false, // Re-enabling preflight for correct button styling
  },
  plugins: [],
}
