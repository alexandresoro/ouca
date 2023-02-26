/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  important: "#root",
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  corePlugins: {
    // Remove the Tailwind CSS preflight styles so it can use Material UI's preflight instead (CssBaseline).
    preflight: false,
  },
  daisyui: {
    themes: [
      {
        ouca: {
          primary: "#00838f",
          secondary: "#ff4081",
          accent: "#37CDBE",
          neutral: "#3D4451",
          "base-100": "#fafafa",
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
