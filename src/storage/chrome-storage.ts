import { createLogger } from '@/shared/logger';
import { DEFAULT_SETTINGS } from '@/constants/defaults';
import type { Settings } from '@/types/settings';

const logger = createLogger('ChromeStorage');

export class ChromeStorageService {
  public async getSettings(): Promise<Settings> {
    try {
      const result = await chrome.storage.sync.get('settings');
      return result.settings || DEFAULT_SETTINGS;
    } catch (error) {
      logger.error('Failed to get settings', error);
      return DEFAULT_SETTINGS;
    }
  }

  public async saveSettings(settings: Settings): Promise<void> {
    try {
      await chrome.storage.sync.set({ settings });
      logger.info('Settings saved');
    } catch (error) {
      logger.error('Failed to save settings', error);
      throw error;
    }
  }

  public async getSessionData(key: string): Promise<unknown> {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key];
    } catch (error) {
      logger.error(`Failed to get session data: ${key}`, error);
      return null;
    }
  }

  public async saveSessionData(key: string, data: unknown): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: data });
      logger.info(`Session data saved: ${key}`);
    } catch (error) {
      logger.error(`Failed to save session data: ${key}`, error);
      throw error;
    }
  }

  public async removeSessionData(key: string): Promise<void> {
    try {
      await chrome.storage.local.remove(key);
      logger.info(`Session data removed: ${key}`);
    } catch (error) {
      logger.error(`Failed to remove session data: ${key}`, error);
      throw error;
    }
  }

  public async clearAllData(): Promise<void> {
    try {
      await chrome.storage.local.clear();
      await chrome.storage.sync.clear();
      logger.info('All storage cleared');
    } catch (error) {
      logger.error('Failed to clear storage', error);
      throw error;
    }
  }
}

export const chromeStorageService = new ChromeStorageService();
