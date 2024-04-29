/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        ouca: {
          primary: "#5C7F67",
          "primary-content": "#DDE4DF",
          secondary: "#8F4263",
          "secondary-content": "#EAD8DE",
          accent: "#F50076",
          "accent-content": "#FFC6D4",
          neutral: "#291E00",
          "neutral-content": "#E7E6E2",
          "base-100": "#F4F3F3",
          "base-200": "#EEECEC",
          "base-300": "#D3CFCF",
          info: "#3ABFF8",
          "info-content": "#CDEDFE",
          success: "#36D399",
          "success-content": "#CEF3E0",
          warning: "#FBBD23",
          "warning-content": "#FFECCA",
          error: "#F87272",
          "error-content": "#FFD6D4",
        },
      },
      "night",
    ],
    darkTheme: "night",
    logs: false,
  },
};
