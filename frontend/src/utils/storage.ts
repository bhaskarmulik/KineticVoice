// Storage wrapper that handles AsyncStorage errors and provides fallbacks
import { Platform } from 'react-native';

// Only import AsyncStorage for native platforms
let AsyncStorage: any = null;
if (Platform.OS !== 'web') {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (error) {
    console.warn('AsyncStorage not available:', error);
  }
}

class StorageService {
  private isWeb = Platform.OS === 'web';

  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isWeb) {
        return localStorage.getItem(key);
      }
      if (AsyncStorage) {
        return await AsyncStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error(`Storage getItem error for key ${key}:`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isWeb) {
        localStorage.setItem(key, value);
        return;
      }
      if (AsyncStorage) {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Storage setItem error for key ${key}:`, error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (this.isWeb) {
        localStorage.removeItem(key);
        return;
      }
      if (AsyncStorage) {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Storage removeItem error for key ${key}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.isWeb) {
        localStorage.clear();
        return;
      }
      if (AsyncStorage) {
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      if (this.isWeb) {
        return Object.keys(localStorage);
      }
      if (AsyncStorage) {
        return await AsyncStorage.getAllKeys();
      }
      return [];
    } catch (error) {
      console.error('Storage getAllKeys error:', error);
      return [];
    }
  }
}

export const storage = new StorageService();
