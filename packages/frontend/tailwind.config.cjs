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
          secondary: "#8F4263",
          accent: "#F50076",
          neutral: "#291E00",
          "base-100": "#F4F3F3",
          "base-200": "#EEECEC",
          "base-300": "#D3CFCF",
          info: "#75D2FA",
          success: "#A7D1A2",
          warning: "#FBCA4E",
          error: "#FF6B6B",
        },
      },
      "night",
    ],
    darkTheme: "night",
    logs: false,
  },
};
