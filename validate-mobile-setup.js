#!/usr/bin/env node

/**
 * Mobile App Setup Validator
 * Run this to verify all files are in place and configured correctly
 * 
 * Usage: node validate-mobile-setup.js
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = {
  'mobile/package.json': 'Mobile dependencies',
  'mobile/app.json': 'Expo configuration',
  'mobile/eas.json': 'Build profiles',
  'mobile/tsconfig.json': 'TypeScript config',
  'mobile/babel.config.js': 'Babel transformer',
  'mobile/metro.config.js': 'Metro bundler',
  'mobile/tailwind.config.js': 'Tailwind theme',
  'mobile/nativewind.config.ts': 'NativeWind setup',
  'mobile/constants.ts': 'App constants',
  'mobile/utils.ts': 'Utility functions',
  'mobile/.env.example': 'Environment template',
  'mobile/.gitignore': 'Git exclusions',
  'mobile/README.md': 'Mobile README',
  'mobile/DOCUMENTATION.md': 'Complete documentation',
  'mobile/app/_layout.tsx': 'Root layout',
  'mobile/app/index.tsx': 'Home screen',
  'mobile/app/report-lost.tsx': 'Report lost form',
  'mobile/app/report-found.tsx': 'Report found form',
  'mobile/app/browse.tsx': 'Browse screen',
  'mobile/app/item-detail.tsx': 'Item detail screen',
  'mobile/hooks/useReports.ts': 'Data fetching hook',
  '.github/workflows/build-expo-android.yml': 'GitHub Actions workflow',
  'MOBILE_SETUP_GUIDE.md': 'Setup guide',
  'EXPO_ANDROID_BUILD.md': 'Build guide',
  'MOBILE_APP_COMPLETE.md': 'Complete reference',
};

const REQUIRED_PACKAGES = [
  'expo',
  'react-native',
  'nativewind',
  'react-navigation',
  'eas-cli',
];

console.log('🔍 FindrHub Mobile App Setup Validator\n');
console.log('=' .repeat(50));

let allGood = true;

// Check files
console.log('\n📁 Checking required files...\n');

Object.entries(REQUIRED_FILES).forEach(([file, description]) => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${file} (${description})`);
  if (!exists) allGood = false;
});

// Check package.json
console.log('\n📦 Checking required packages...\n');

try {
  const packageJsonPath = path.join(__dirname, 'mobile', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  REQUIRED_PACKAGES.forEach((pkg) => {
    const exists = pkg in dependencies;
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${pkg}`);
    if (!exists) allGood = false;
  });
} catch (error) {
  console.log('❌ Could not read package.json');
  allGood = false;
}

// Check build scripts
console.log('\n🔧 Checking build scripts...\n');

try {
  const packageJsonPath = path.join(__dirname, 'mobile', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredScripts = [
    'dev',
    'build:preview',
    'build:production',
  ];

  requiredScripts.forEach((script) => {
    const exists = script in packageJson.scripts;
    const status = exists ? '✅' : '❌';
    console.log(`${status} npm run ${script}`);
    if (!exists) allGood = false;
  });
} catch (error) {
  console.log('❌ Could not read scripts');
  allGood = false;
}

// Check environment template
console.log('\n🌍 Checking environment setup...\n');

const envExamplePath = path.join(__dirname, 'mobile', '.env.example');
if (fs.existsSync(envExamplePath)) {
  console.log('✅ .env.example exists (template available)');
  
  const envLocalPath = path.join(__dirname, 'mobile', '.env.local');
  if (fs.existsSync(envLocalPath)) {
    console.log('✅ .env.local exists (configured)');
  } else {
    console.log('⚠️  .env.local not found - copy from .env.example');
  }
} else {
  console.log('❌ .env.example missing');
  allGood = false;
}

// Results
console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('\n✅ All checks passed! Mobile app is ready.\n');
  console.log('Next steps:');
  console.log('1. cd mobile');
  console.log('2. npm install');
  console.log('3. cp .env.example .env.local');
  console.log('4. npm run dev\n');
} else {
  console.log('\n❌ Some checks failed. Review above and fix missing items.\n');
}

process.exit(allGood ? 0 : 1);
