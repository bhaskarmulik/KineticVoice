import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { activityRepository } from '../src/services/activityRepository';
import { colors } from '../src/utils/theme';

export default function RootLayout() {
  useEffect(() => {
    async function initializeApp() {
      // Initialize database
      await activityRepository.init();
    }

    initializeApp();
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Slot />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
