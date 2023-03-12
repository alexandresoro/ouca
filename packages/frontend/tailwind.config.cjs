/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("@headlessui/tailwindcss"), require("daisyui")],
  daisyui: {
    themes: [
      {
        ouca: {
          primary: "#00838f",
          secondary: "#ff4081",
          accent: "#37CDBE",
          neutral: "#3D4451",
          "base-100": "#f4f4f4",
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
        },
      },
      "night",
    ],
    darkTheme: "night",
  },
};
