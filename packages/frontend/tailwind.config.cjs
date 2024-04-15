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
          info: "#75D2FA",
          "info-content": "#CBEEFE",
          success: "#A7D1A2",
          "success-content": "#DCEDD9",
          warning: "#FBCA4E",
          "warning-content": "#FEEBC0",
          error: "#FF6B6B",
          "error-content": "#FFC7C3",
        },
      },
      "night",
    ],
    darkTheme: "night",
    logs: false,
  },
};
