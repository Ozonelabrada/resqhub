const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('mjs');

// Configure path aliases for Metro
config.resolver.alias = {
  '@': __dirname + '/src',
};

module.exports = config;
