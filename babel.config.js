module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-export-namespace-from', // For web support
      'react-native-reanimated/plugin' // Must be last
    ]
  };
};
