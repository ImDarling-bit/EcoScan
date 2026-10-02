module.exports = {
  preset: '@react-native/jest-preset',
  // Résolveur requis par react-native-reanimated v4 / react-native-worklets
  // pour retomber sur leurs implémentations JS (non natives) sous Jest.
  resolver: 'react-native-reanimated/jest/resolver.js',
  setupFiles: ['react-native-gesture-handler/jestSetup', './jest/setup.js'],
  // Le preset RN ne transforme que react-native/@react-native par défaut ;
  // ces libs (navigation, screens, safe-area, gesture-handler, animations,
  // dégradés) publient du JS non transpilé (ESM) qu'il faut donc laisser
  // passer à Babel aussi.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-screens|react-native-safe-area-context|react-native-gesture-handler|react-native-linear-gradient|react-native-reanimated|react-native-worklets)/)',
  ],
};
