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
          info: "#0D47A1",
          "info-content": "#E3F2FD",
          success: "#1B5E20",
          "success-content": "#E8F5E9",
          warning: "#E65100",
          "warning-content": "#FFF3E0",
          error: "#B71C1C",
          "error-content": "#FFEBEE",
        },
      },
      "night",
    ],
    darkTheme: "night",
    logs: false,
  },
};
