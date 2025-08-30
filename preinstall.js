// Preinstall script to prevent yarn usage
// This will throw an error if yarn is detected

if (process.env.npm_execpath && process.env.npm_execpath.includes('yarn')) {
  console.error('❌ This project must be installed with npm, not yarn!');
  console.error('Please use: npm install');
  process.exit(1);
}

// Clean any yarn artifacts
const fs = require('fs');
const path = require('path');

const yarnFiles = [
  'yarn.lock',
  '.yarnrc',
  '.yarnrc.yml',
  'frontend/yarn.lock',
  'frontend/.yarnrc',
  'frontend/.yarnrc.yml'
];

yarnFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`🧹 Removed ${file}`);
    }
  } catch (err) {
    // Ignore errors
  }
});

console.log('✅ Preinstall check passed - using npm');