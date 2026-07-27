import { createLogger } from '@/shared/logger';
import type { Settings } from '@/types/settings';

const logger = createLogger('SettingsHook');

export interface UseSettingsReturn {
  settings: Settings | null;
  loading: boolean;
  error: Error | null;
  updateSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void>;
  updateSettings(newSettings: Partial<Settings>): Promise<void>;
}

export async function useSettings(): Promise<UseSettingsReturn> {
  let settings: Settings | null = null;
  let loading = true;
  let error: Error | null = null;

  try {
    const result = await chrome.storage.sync.get('settings');
    settings = result.settings || null;
  } catch (err) {
    error = err instanceof Error ? err : new Error('Failed to load settings');
    logger.error('Failed to load settings', err);
  } finally {
    loading = false;
  }

  async function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    await updateSettings(updated);
  }

  async function updateSettings(newSettings: Partial<Settings>): Promise<void> {
    if (!settings) return;
    const updated = { ...settings, ...newSettings };
    try {
      await chrome.storage.sync.set({ settings: updated });
      settings = updated;
      logger.info('Settings updated');
    } catch (err) {
      error = err instanceof Error ? err : new Error('Failed to update settings');
      logger.error('Failed to update settings', err);
      throw error;
    }
  }

  return {
    settings,
    loading,
    error,
    updateSetting,
    updateSettings,
  };
}
