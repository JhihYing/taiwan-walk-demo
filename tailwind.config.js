/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7F977B", // 品牌主色
        secondary: "#e0da48", // 副色
        accent: "#BEA363", // 強調色
        main: "#525252", // 文字主色
      },
    },
    fontFamily: {
      sans: ["Inter", "Source Han Sans TC", "Noto Sans JP", "sans-serif"],
      en: ["Inter", '"Helvetica Neue"', "sans-serif"],
      zh: ['"Source Han Sans TC"', '"PingFang TC"', '"Heiti TC"', "sans-serif"],
      ja: ['"Noto Sans JP"', '"Hiragino Kaku Gothic Pro"', "sans-serif"],
    },
    screens: {
      // 預設值 https://tailwindcss.com/docs/screens
      xs: "375px",
      sm: "480px",
      md: "768px",
      lg: "992px",
      xl: "1024px",
      "2xl": "1440px",
      "3xl": "1728px",
    },
  },
  plugins: [
    require("tailwindcss-textshadow"),
    require("@tailwindcss/line-clamp"),
    require("tailwindcss-animate"),
  ],
};
