const baseConfig = require("./app.json").expo;
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:8000";

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
