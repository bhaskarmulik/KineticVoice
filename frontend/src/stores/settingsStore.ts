import { create } from 'zustand';
import { AppSettings, BackendMode } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState extends AppSettings {
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
  setBackendMode: (mode: BackendMode) => Promise<void>;
  setGroqApiKey: (key: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  backendMode: 'local',
  units: 'metric',
  onboardingComplete: false,
  voiceEnabled: true,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,

  updateSettings: async (settings: Partial<AppSettings>) => {
    const newSettings = { ...get(), ...settings };
    set(settings);
    await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
  },

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem('app_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        set(settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },

  setBackendMode: async (mode: BackendMode) => {
    await get().updateSettings({ backendMode: mode });
  },

  setGroqApiKey: async (key: string) => {
    await get().updateSettings({ groqApiKey: key });
  },

  completeOnboarding: async () => {
    await get().updateSettings({ onboardingComplete: true });
  },
}));
