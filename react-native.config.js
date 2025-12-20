/**
 * React Native CLI / expo-modules-autolinking configuration.
 *
 * F-Droid buildserver was intermittently generating Gradle subprojects for some deps without Android
 * variants (e.g. AsyncStorage + SafeAreaContext). Explicitly declaring Android config here makes
 * autolinking deterministic across environments.
 */
module.exports = {
  dependencies: {
    '@react-native-async-storage/async-storage': {
      platforms: {
        android: {
          // Uses `<packageRoot>/android` by default, but we set it explicitly to avoid ambiguity.
          sourceDir: 'android',
        },
      },
    },
    'react-native-safe-area-context': {
      platforms: {
        android: {
          sourceDir: 'android',
        },
      },
    },
  },
};


