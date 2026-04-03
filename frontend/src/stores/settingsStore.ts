import { create } from 'zustand';
import { AppSettings, BackendMode } from '../types';
import { storage } from '../utils/storage';
import { voiceService } from '../services/voiceService';

interface SettingsState extends AppSettings {
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
  setBackendMode: (mode: BackendMode) => Promise<void>;
  setGroqApiKey: (key: string) => Promise<void>;
  setFirebaseConfig: (config: any) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  backendMode: 'local', // Default to local monolithic mode
  units: 'metric',
  onboardingComplete: false,
  voiceEnabled: true,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,

  updateSettings: async (settings: Partial<AppSettings>) => {
    const newSettings = { ...get(), ...settings };
    set(settings);
    await storage.setItem('app_settings', JSON.stringify(newSettings));
    
    // Update voice service if Groq key changed
    if (settings.groqApiKey) {
      voiceService.setGroqApiKey(settings.groqApiKey);
    }
  },

  loadSettings: async () => {
    try {
      const stored = await storage.getItem('app_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        set(settings);
        
        // Initialize services based on settings
        if (settings.groqApiKey) {
          voiceService.setGroqApiKey(settings.groqApiKey);
        }
        
        // Initialize Firebase if configured
        if (settings.firebaseConfig) {
          try {
            const { firebaseService } = await import('../services/firebaseService');
            await firebaseService.initialize(settings.firebaseConfig);
          } catch {
            console.log('Firebase service not available');
          }
        }
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
    voiceService.setGroqApiKey(key);
  },

  setFirebaseConfig: async (config: any) => {
    await get().updateSettings({ firebaseConfig: config });
    if (config) {
      try {
        const { firebaseService } = await import('../services/firebaseService');
        await firebaseService.initialize(config);
      } catch {
        console.log('Firebase service not available');
      }
    }
  },

  completeOnboarding: async () => {
    await get().updateSettings({ onboardingComplete: true });
  },
}));
