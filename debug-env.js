#!/usr/bin/env node
/**
 * Debug script to show ALL environment variables during build
 * This helps identify if the variable exists but with a different name
 */

console.log('\n🔍 FULL ENVIRONMENT VARIABLE DEBUG\n');
console.log('='.repeat(60));

// Show all environment variables that might be related
const envVars = Object.keys(process.env).sort();

console.log('\n📋 All environment variables (' + envVars.length + ' total):\n');

// Look for anything related to Google, Maps, or API
const relevant = envVars.filter(key =>
  key.toLowerCase().includes('google') ||
  key.toLowerCase().includes('map') ||
  key.toLowerCase().includes('api')
);

if (relevant.length > 0) {
  console.log('🎯 Variables containing "google", "map", or "api":');
  relevant.forEach(key => {
    const value = process.env[key] || '';
    const displayValue = value.length > 20 ? value.substring(0, 20) + '...' : value;
    console.log(`  - ${key}: ${displayValue || '(empty)'}`);
  });
  console.log('');
} else {
  console.log('⚠️  No environment variables found containing "google", "map", or "api"\n');
}

// Check exact variable name
console.log('🔍 Checking exact variable name:\n');
console.log('  - GOOGLE_MAPS_API_KEY:', process.env.GOOGLE_MAPS_API_KEY ? '✅ EXISTS' : '❌ NOT FOUND');
console.log('  - Length:', (process.env.GOOGLE_MAPS_API_KEY || '').length);
console.log('');

// Check for common typos
const commonTypos = [
  'GOOGLE_MAPS_API_KEY',
  'GOOGLE_MAP_API_KEY',
  'GOOGLEMAPS_API_KEY',
  'GOOGLE_MAPS_APIKEY',
  'GOOGLE_MAPS_KEY',
  'MAPS_API_KEY',
  'GMAPS_API_KEY'
];

console.log('🔍 Checking common typos:\n');
commonTypos.forEach(name => {
  if (process.env[name]) {
    console.log(`  ✅ Found: ${name} = ${process.env[name].substring(0, 20)}...`);
  }
});

// Show first 50 environment variables alphabetically
console.log('\n📝 First 50 environment variables (alphabetically):\n');
envVars.slice(0, 50).forEach(key => {
  const value = process.env[key] || '';
  const displayValue = value.length > 40 ? value.substring(0, 40) + '...' : value;
  console.log(`  ${key}: ${displayValue}`);
});

if (envVars.length > 50) {
  console.log(`\n  ... and ${envVars.length - 50} more variables\n`);
}

console.log('='.repeat(60));
console.log('\n✅ Debug script completed\n');
