const baseConfig = require("./app.json").expo;
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "https://thinkare-application.onrender.com";

module.exports = {
  ...baseConfig,
  plugins: [
    ...(baseConfig.plugins ?? []),
    ["./withLocalApiCleartext", { enabled: apiUrl.startsWith("http://") }],
  ],
  android: {
    ...baseConfig.android,
  },
};
