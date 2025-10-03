#!/usr/bin/env node
/**
 * Build script to replace environment variable placeholders in HTML files
 * This runs during Vercel build to inject the Google Maps API key
 */

const fs = require('fs');
const path = require('path');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const PLACEHOLDER = '__GOOGLE_MAPS_API_KEY__';

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('⚠️  Warning: GOOGLE_MAPS_API_KEY environment variable not set');
}

// Find all HTML files that contain the placeholder
const findHTMLFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (!file.startsWith('.') && file !== 'node_modules') {
        findHTMLFiles(filePath, fileList);
      }
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });

  return fileList;
};

// Replace placeholder in file
const replaceInFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes(PLACEHOLDER)) {
      content = content.replace(new RegExp(PLACEHOLDER, 'g'), GOOGLE_MAPS_API_KEY);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Replaced API key in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
};

// Main execution
console.log('🔧 Starting build process to inject environment variables...\n');

const htmlFiles = findHTMLFiles('.');
let replacedCount = 0;

htmlFiles.forEach(file => {
  if (replaceInFile(file)) {
    replacedCount++;
  }
});

console.log(`\n✨ Build complete! Replaced API key in ${replacedCount} file(s)`);

if (replacedCount === 0) {
  console.log('ℹ️  No files with placeholder found. This is normal if API keys are already set.');
}
