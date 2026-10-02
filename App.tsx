/**
 * EcoScan
 * @format
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getDatabase } from './src/db';
import { AppNavigator } from './src/navigation/AppNavigator';
import { couleurs } from './src/theme';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [pret, setPret] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    getDatabase()
      .then(() => setPret(true))
      .catch((error: Error) => setErreur(error.message));
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        {erreur ? (
          <View style={styles.centre}>
            <Text style={styles.erreur}>Erreur d'initialisation de la base : {erreur}</Text>
          </View>
        ) : !pret ? (
          <View style={styles.centre}>
            <ActivityIndicator size="large" color={couleurs.primary} />
          </View>
        ) : (
          <AppNavigator />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: couleurs.background },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: couleurs.background },
  erreur: { color: couleurs.danger, textAlign: 'center' },
});

export default App;
