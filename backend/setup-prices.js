#!/usr/bin/env node

/**
 * Setup Script for Market Prices Feature
 * Verifies installation and configuration
 */

const fs = require('fs');
const path = require('path');

console.log('\n🌾 Project Kisan - Market Prices Feature Setup\n');

// Check if running in backend directory
const isBackend = fs.existsSync(path.join(process.cwd(), 'services'));

if (!isBackend) {
  console.log('❌ Please run this script from the backend directory:');
  console.log('   cd backend && node setup-prices.js\n');
  process.exit(1);
}

// 1. Check package.json dependencies
console.log('📦 Checking dependencies...');
const packageJson = require('./package.json');
const requiredDeps = ['express', 'axios', 'groq-sdk', 'dotenv', 'cors'];
const missing = [];

requiredDeps.forEach(dep => {
  if (!packageJson.dependencies[dep]) {
    missing.push(dep);
  } else {
    console.log(`   ✓ ${dep}`);
  }
});

if (missing.length > 0) {
  console.log('\n⚠️  Missing dependencies:');
  missing.forEach(dep => console.log(`   - ${dep}`));
  console.log('\nRun: npm install\n');
  process.exit(1);
}

// 2. Check environment file
console.log('\n🔐 Checking environment configuration...');
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('   ⚠️  .env file not found');
  if (fs.existsSync(envExamplePath)) {
    console.log('   📄 Copying .env.example to .env...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('   ✓ .env file created');
    console.log('   ⚠️  Please update .env with your actual API keys!');
  } else {
    console.log('   ❌ .env.example not found. Cannot create .env');
    process.exit(1);
  }
} else {
  console.log('   ✓ .env file exists');
}

// 3. Check for API keys
console.log('\n🔑 Checking API keys...');
require('dotenv').config();

const requiredKeys = [
  'VARIETY_PRICES_API_KEY',
  'MANDI_PRICES_API_KEY',
  'GROQ_API_KEY'
];

const missingKeys = [];
requiredKeys.forEach(key => {
  const value = process.env[key];
  if (!value || value.includes('your-') || value.includes('your_')) {
    missingKeys.push(key);
    console.log(`   ⚠️  ${key}: Not configured`);
  } else {
    console.log(`   ✓ ${key}: Configured`);
  }
});

if (missingKeys.length > 0) {
  console.log('\n⚠️  Please update the following keys in .env:');
  missingKeys.forEach(key => console.log(`   - ${key}`));
  console.log('\nRefer to MARKET_PRICES_README.md for instructions on obtaining API keys.');
}

// 4. Check service files
console.log('\n📁 Checking service files...');
const requiredFiles = [
  'services/pricesService.js',
  'services/groqPriceService.js',
  'api/prices.js'
];

const missingFiles = [];
requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✓ ${file}`);
  } else {
    console.log(`   ❌ ${file} - Missing!`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log('\n❌ Some required files are missing. Please check your installation.\n');
  process.exit(1);
}

// 5. Check server.js for prices route
console.log('\n🔧 Checking server configuration...');
const serverPath = path.join(process.cwd(), 'server.js');
const serverContent = fs.readFileSync(serverPath, 'utf-8');

if (serverContent.includes("app.use('/api/prices'")) {
  console.log('   ✓ Prices route registered in server.js');
} else {
  console.log('   ⚠️  Prices route not found in server.js');
  console.log('   Add this line to server.js:');
  console.log("   app.use('/api/prices', require('./api/prices'));");
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Setup Summary');
console.log('='.repeat(60));

if (missingKeys.length === 0 && missingFiles.length === 0) {
  console.log('\n✅ All checks passed! You are ready to use the Market Prices feature.');
  console.log('\nNext steps:');
  console.log('1. Start the backend server:');
  console.log('   npm run dev');
  console.log('\n2. Test the API:');
  console.log('   curl "http://localhost:5000/api/prices/current?crop=Tomato"');
  console.log('\n3. Check the frontend:');
  console.log('   Navigate to the Prices screen in your app');
} else {
  console.log('\n⚠️  Setup incomplete. Please address the warnings above.');
  console.log('\nRefer to MARKET_PRICES_README.md for detailed setup instructions.');
}

console.log('\n');
