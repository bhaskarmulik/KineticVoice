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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, typography } from '../../src/utils/theme';
import { Button } from '../../src/components/Button';
import { BackendMode } from '../../src/types';

export default function SettingsScreen() {
  const [backendMode, setBackendMode] = useState<BackendMode>('local');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('app_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        setBackendMode(settings.backendMode || 'local');
        setGroqApiKey(settings.groqApiKey || '');
        setVoiceEnabled(settings.voiceEnabled !== false);
        setUnits(settings.units || 'metric');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (updates: any) => {
    try {
      const stored = await AsyncStorage.getItem('app_settings');
      const current = stored ? JSON.parse(stored) : {};
      const updated = { ...current, ...updates };
      await AsyncStorage.setItem('app_settings', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleSaveGroqKey = () => {
    saveSettings({ groqApiKey });
    Alert.alert('Success', 'Groq API key saved!');
  };

  const handleToggleVoice = (value: boolean) => {
    setVoiceEnabled(value);
    saveSettings({ voiceEnabled: value });
  };

  const handleChangeUnits = (value: 'metric' | 'imperial') => {
    setUnits(value);
    saveSettings({ units: value });
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
              onChangeText={setGroqApiKey}
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
    fontSize: 16,
    marginBottom: spacing.md,
  },
  saveButton: {
    marginBottom: spacing.md,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textTertiary,
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
  divider: {
    height: 1,
    backgroundColor: colors.background,
    marginVertical: spacing.sm,
  },
});
