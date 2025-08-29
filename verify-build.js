#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying BudgetWise build...');

const buildDir = path.join(__dirname, 'frontend', 'build');
const requiredFiles = [
  'index.html',
  'static/css',
  'static/js',
  '_headers',
  '_redirects'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(buildDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

// Check if main JS and CSS files exist
const staticJs = path.join(buildDir, 'static', 'js');
const staticCss = path.join(buildDir, 'static', 'css');

if (fs.existsSync(staticJs)) {
  const jsFiles = fs.readdirSync(staticJs).filter(f => f.endsWith('.js'));
  console.log(`✅ Found ${jsFiles.length} JS files`);
} else {
  console.log('❌ No JS files found');
  allFilesExist = false;
}

if (fs.existsSync(staticCss)) {
  const cssFiles = fs.readdirSync(staticCss).filter(f => f.endsWith('.css'));
  console.log(`✅ Found ${cssFiles.length} CSS files`);
} else {
  console.log('❌ No CSS files found');
  allFilesExist = false;
}

if (allFilesExist) {
  console.log('\n🎉 Build verification passed! Ready for Cloudflare Pages deployment.');
  console.log('\nNext steps:');
  console.log('1. Push your code to GitHub');
  console.log('2. Connect your repository to Cloudflare Pages');
  console.log('3. Set build command: npm run build');
  console.log('4. Set build output directory: frontend/build');
  console.log('5. Deploy! 🚀');
} else {
  console.log('\n❌ Build verification failed. Please check the build process.');
  process.exit(1);
}