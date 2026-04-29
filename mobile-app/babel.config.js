module.exports = function (api) {
  api.cache(true);

  const plugins = [];
  
  if (process.env.NODE_ENV === 'production') {
    plugins.push('transform-remove-console');
  }
  
  // react-native-reanimated plugin is auto-included by babel-preset-expo in SDK 54
  return {
    presets: ['babel-preset-expo'],
    plugins: plugins,
  };
};