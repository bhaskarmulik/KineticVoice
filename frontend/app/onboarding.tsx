import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../src/utils/theme';
import { Button } from '../src/components/Button';
import { useSettingsStore } from '../src/stores/settingsStore';
import { BackendMode } from '../src/types';
import { locationService } from '../src/services/locationService';
import { voiceService } from '../src/services/voiceService';

export default function OnboardingScreen() {
  const router = useRouter();
  const { setBackendMode, setGroqApiKey, completeOnboarding } = useSettingsStore();
  const [step, setStep] = useState(1);
  const [selectedBackend, setSelectedBackend] = useState<BackendMode>('local');
  const [groqKey, setGroqKey] = useState('');
  const [firebaseKey, setFirebaseKey] = useState('');

  const handleBackendSelection = (mode: BackendMode) => {
    setSelectedBackend(mode);
  };

  const handleContinue = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      // Final step - request permissions and complete onboarding
      await requestPermissions();
      await setBackendMode(selectedBackend);
      if (groqKey) {
        await setGroqApiKey(groqKey);
      }
      await completeOnboarding();
      router.replace('/(tabs)');
    }
  };

  const requestPermissions = async () => {
    await locationService.requestPermissions();
    await voiceService.requestPermissions();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>KINETIC VOICE</Text>
            <View style={styles.statusDot} />
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
            <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
            <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
            <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
            <View style={[styles.progressDot, step >= 3 && styles.progressDotActive]} />
          </View>

          {/* Step 1: Backend Selection */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Welcome to</Text>
              <Text style={styles.titleHighlight}>Kinetic Voice</Text>
              <Text style={styles.subtitle}>
                Choose how you{"'"}d like to store your fitness data
              </Text>

              <View style={styles.options}>
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedBackend === 'local' && styles.optionSelected,
                  ]}
                  onPress={() => handleBackendSelection('local')}
                >
                  <View style={styles.optionHeader}>
                    <Ionicons
                      name="phone-portrait"
                      size={32}
                      color={selectedBackend === 'local' ? colors.primary : colors.textSecondary}
                    />
                    <View style={styles.radioOuter}>
                      {selectedBackend === 'local' && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <Text style={styles.optionTitle}>Local Storage</Text>
                  <Text style={styles.optionDescription}>
                    Store everything on your device. Works offline, private, and fast.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedBackend === 'firebase' && styles.optionSelected,
                  ]}
                  onPress={() => handleBackendSelection('firebase')}
                >
                  <View style={styles.optionHeader}>
                    <Ionicons
                      name="cloud"
                      size={32}
                      color={selectedBackend === 'firebase' ? colors.primary : colors.textSecondary}
                    />
                    <View style={styles.radioOuter}>
                      {selectedBackend === 'firebase' && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <Text style={styles.optionTitle}>Firebase</Text>
                  <Text style={styles.optionDescription}>
                    Sync across devices with your own Firebase account.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedBackend === 'emergent' && styles.optionSelected,
                  ]}
                  onPress={() => handleBackendSelection('emergent')}
                >
                  <View style={styles.optionHeader}>
                    <Ionicons
                      name="server"
                      size={32}
                      color={selectedBackend === 'emergent' ? colors.primary : colors.textSecondary}
                    />
                    <View style={styles.radioOuter}>
                      {selectedBackend === 'emergent' && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <Text style={styles.optionTitle}>Emergent Cloud</Text>
                  <Text style={styles.optionDescription}>
                    Hosted backend with automatic sync. No setup required.
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 2: API Keys */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Configure</Text>
              <Text style={styles.titleHighlight}>Voice Features</Text>
              <Text style={styles.subtitle}>
                Add your Groq API key for voice commands, or skip to use the default.
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>GROQ API KEY (OPTIONAL)</Text>
                <TextInput
                  style={styles.input}
                  value={groqKey}
                  onChangeText={setGroqKey}
                  placeholder="sk-..."
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.inputHint}>
                  Get your free key at groq.com
                </Text>
              </View>

              {selectedBackend === 'firebase' && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>FIREBASE CONFIG (REQUIRED)</Text>
                  <TextInput
                    style={[styles.input, styles.inputMultiline]}
                    value={firebaseKey}
                    onChangeText={setFirebaseKey}
                    placeholder='{"apiKey": "...", "projectId": "..."}'
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    numberOfLines={4}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text style={styles.inputHint}>
                    Paste your Firebase configuration JSON
                  </Text>
                </View>
              )}

              <TouchableOpacity onPress={() => setStep(3)}>
                <Text style={styles.skipText}>Skip for now →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 3: Permissions */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Almost</Text>
              <Text style={styles.titleHighlight}>Ready!</Text>
              <Text style={styles.subtitle}>
                Grant permissions to track your activities accurately
              </Text>

              <View style={styles.permissions}>
                <View style={styles.permission}>
                  <Ionicons name="location" size={24} color={colors.primary} />
                  <View style={styles.permissionContent}>
                    <Text style={styles.permissionTitle}>Location</Text>
                    <Text style={styles.permissionDescription}>
                      Track your runs and walks accurately
                    </Text>
                  </View>
                </View>

                <View style={styles.permission}>
                  <Ionicons name="mic" size={24} color={colors.primary} />
                  <View style={styles.permissionContent}>
                    <Text style={styles.permissionTitle}>Microphone</Text>
                    <Text style={styles.permissionDescription}>
                      Control your workout with voice commands
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.readyContainer}>
                <View style={styles.readyIcon}>
                  <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
                </View>
                <Text style={styles.readyText}>Ready to Move?</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <Button
            title={step === 3 ? "LET'S GO" : 'CONTINUE'}
            onPress={handleContinue}
            variant="primary"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accentGreen,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.card,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.card,
    marginHorizontal: spacing.xs,
  },
  progressLineActive: {
    backgroundColor: colors.primary,
  },
  stepContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  titleHighlight: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  options: {
    gap: spacing.md,
  },
  option: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: colors.primary,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  optionDescription: {
    ...typography.body,
    color: colors.textSecondary,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.cardLight,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputHint: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  skipText: {
    ...typography.body,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  permissions: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  permission: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  permissionDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  readyContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  readyIcon: {
    marginBottom: spacing.md,
  },
  readyText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
