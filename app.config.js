const { expo } = require('./app.json');

module.exports = {
  expo: {
    ...expo,
    extra: {
      ...expo.extra,
      geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
    },
  },
};
