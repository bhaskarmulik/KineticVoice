import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../src/utils/theme';
import { Button } from '../../src/components/Button';
import { BackendMode } from '../../src/types';
import { useSettingsStore } from '../../src/stores/settingsStore';

export default function SettingsScreen() {
  const {
    backendMode,
    groqApiKey: storedGroqApiKey,
    voiceEnabled,
    units,
    loadSettings,
    setGroqApiKey,
    setBackendMode,
    updateSettings,
  } = useSettingsStore();

  const [groqApiKey, setGroqApiKeyInput] = useState('');

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    setGroqApiKeyInput(storedGroqApiKey || '');
  }, [storedGroqApiKey]);

  const handleSaveGroqKey = async () => {
    await setGroqApiKey(groqApiKey);
    Alert.alert('Success', 'Groq API key saved!');
  };

  const handleToggleVoice = async (value: boolean) => {
    await updateSettings({ voiceEnabled: value });
  };

  const handleChangeUnits = async (value: 'metric' | 'imperial') => {
    await updateSettings({ units: value });
  };

  const handleChangeBackendMode = async (mode: BackendMode) => {
    await setBackendMode(mode);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Backend Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backend Storage</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Storage Mode</Text>
                <Text style={styles.rowSubtitle}>
                  {backendMode === 'local'
                    ? 'Local Storage (On Device)'
                    : backendMode === 'firebase'
                    ? 'Firebase Cloud'
                    : 'Emergent Cloud'}
                </Text>
              </View>
              <Ionicons
                name={backendMode === 'local' ? 'phone-portrait' : 'cloud'}
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.row, styles.radioRow]}
              onPress={() => handleChangeBackendMode('local')}
            >
              <Text style={styles.rowTitle}>Local</Text>
              <View style={styles.radioOuter}>
                {backendMode === 'local' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.row, styles.radioRow]}
              onPress={() => handleChangeBackendMode('firebase')}
            >
              <Text style={styles.rowTitle}>Firebase</Text>
              <View style={styles.radioOuter}>
                {backendMode === 'firebase' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.row, styles.radioRow]}
              onPress={() => handleChangeBackendMode('emergent')}
            >
              <Text style={styles.rowTitle}>Emergent</Text>
              <View style={styles.radioOuter}>
                {backendMode === 'emergent' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* API Keys */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          <View style={styles.card}>
            <Text style={styles.inputLabel}>GROQ API KEY</Text>
            <TextInput
              style={styles.input}
              value={groqApiKey}
              onChangeText={setGroqApiKeyInput}
              placeholder="sk-..."
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            <Button
              title="Save Key"
              onPress={handleSaveGroqKey}
              variant="primary"
              style={styles.saveButton}
            />
            <Text style={styles.hint}>
              Add your Groq API key for enhanced voice features. Leave empty to use the
              default key.
            </Text>
          </View>
        </View>

        {/* Voice Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Control</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Voice Commands</Text>
                <Text style={styles.rowSubtitle}>
                  Control workouts with your voice
                </Text>
              </View>
              <Switch
                value={voiceEnabled}
                onValueChange={handleToggleVoice}
                trackColor={{ false: colors.card, true: colors.primary + '40' }}
                thumbColor={voiceEnabled ? colors.primary : colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Units */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Measurement Units</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.row, styles.radioRow]}
              onPress={() => handleChangeUnits('metric')}
            >
              <Text style={styles.rowTitle}>Metric (km, m)</Text>
              <View style={styles.radioOuter}>
                {units === 'metric' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.row, styles.radioRow]}
              onPress={() => handleChangeUnits('imperial')}
            >
              <Text style={styles.rowTitle}>Imperial (mi, ft)</Text>
              <View style={styles.radioOuter}>
                {units === 'imperial' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowTitle}>Version</Text>
              <Text style={styles.rowSubtitle}>1.0.0</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radioRow: {
    paddingVertical: spacing.sm,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  rowSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  inputLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    fontSize: 16,
  },
  saveButton: {
    marginBottom: spacing.md,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
});
