import { Redirect } from 'expo-router';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { storage } from '../src/utils/storage';
import { colors } from '../src/utils/theme';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const stored = await storage.getItem('app_settings');
        if (stored) {
          const settings = JSON.parse(stored);
          setOnboardingComplete(settings.onboardingComplete || false);
        }
      } catch (error) {
        console.error('Failed to check onboarding:', error);
      } finally {
        setLoading(false);
      }
    }

    checkOnboarding();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
