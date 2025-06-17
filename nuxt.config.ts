// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    tdxClientId: process.env.TDX_CLIENT_ID,
    tdxClientSecret: process.env.TDX_CLIENT_SECRET,
    public: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      appBaseUrl: process.env.APP_BASE_URL || "http://localhost:3000",
    },
  },
  modules: ["@nuxtjs/i18n", "@nuxtjs/google-fonts"],
  i18n: {
    strategy: "no_prefix",
    defaultLocale: "zh-TW",
    langDir: "language",
    locales: [
      { code: "zh-TW", name: "繁體中文", file: "zh-TW.json" },
      { code: "en-US", name: "English", file: "en-US.json" },
      { code: "ja-JP", name: "日本語", file: "ja-JP.json" },
    ],
    detectBrowserLanguage: {
      useCookie: false,
      // cookieKey: "i18n_redirected",
      // alwaysRedirect: false,
      // fallbackLocale: "zh-TW",
    },
  },
  googleFonts: {
    families: {
      Inter: [300, 400, 500],
      "Source+Han+Sans+TC": [300, 400, 500],
      "Noto+Sans+JP": [300, 400],
    },
    display: "swap",
    preconnect: true,
  },
});
