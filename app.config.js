const { expo } = require('./app.json');
const path = require('path');

// Load environment variables from .env file using dotenv
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Manually parse .env file as backup in case dotenv doesn't work in this context
// and we want to be absolutely sure we get the key.
const envPath = path.resolve(__dirname, '.env');
let env = {};

try {
  const fs = require('fs');
  if (fs.existsSync(envPath)) {
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
  }
} catch (error) {
  console.warn("Error parsing .env file:", error.message);
}

// prioritize process.env (loaded by system/EAS), then dotenv, then manual .env
const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || env.EXPO_PUBLIC_GEMINI_API_KEY;

module.exports = {
  expo: {
    ...expo,
    extra: {
      ...expo.extra,
      geminiApiKey: geminiApiKey,
    },
    plugins: [
    ]
  },
};