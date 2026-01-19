const { expo } = require('./app.json');
const fs = require('fs');
const path = require('path');

// Manually parse .env file since dotenv might not be loaded in this context
// and we want to be absolutely sure we get the key.
const envPath = path.resolve(__dirname, '.env');
let env = {};

if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) return;
      
      const parts = trimmedLine.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        // Join back parts in case value contains =
        const value = parts.slice(1).join('=').trim();
        env[key] = value;
      }
    });
  } catch (error) {
    console.warn("Choose not to parse .env file manually:", error);
  }
}

// prioritize process.env (loaded by system/EAS), then manual .env
const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || env.EXPO_PUBLIC_GEMINI_API_KEY;

module.exports = {
  expo: {
    ...expo,
    extra: {
      ...expo.extra,
      geminiApiKey: geminiApiKey,
    },
  },
};
