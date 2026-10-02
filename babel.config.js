module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Doit rester le dernier plugin de la liste (contrainte react-native-reanimated / worklets).
  plugins: ['react-native-reanimated/plugin'],
};
