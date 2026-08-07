import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class StorageService {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return (globalThis as any).localStorage?.getItem(key) ?? null;
      }
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error(`Storage getItem error for key ${key}:`, e);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        (globalThis as any).localStorage?.setItem(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error(`Storage setItem error for key ${key}:`, e);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        (globalThis as any).localStorage?.removeItem(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`Storage removeItem error for key ${key}:`, e);
    }
  }
}

export default new StorageService();
