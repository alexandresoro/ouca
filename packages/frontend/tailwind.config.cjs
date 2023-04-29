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
          secondary: "#C5D6BA",
          accent: "#F98585",
          neutral: "#5D5656",
          "base-100": "#F4F4F4",
          "base-200": "#eeebee",
          info: "#C1DEE6",
          success: "#CDD98D",
          warning: "#FCE181",
          error: "#F2B6B5",
        },
      },
      "night",
    ],
    darkTheme: "night",
  },
};
