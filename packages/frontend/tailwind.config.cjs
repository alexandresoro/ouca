/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  important: "#root",
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    // Remove the Tailwind CSS preflight styles so it can use Material UI's preflight instead (CssBaseline).
    preflight: false,
  },
};
