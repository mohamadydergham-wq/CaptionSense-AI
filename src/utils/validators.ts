import type { Settings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/constants/defaults';

export function validateSettings(settings: unknown): settings is Settings {
  if (typeof settings !== 'object' || settings === null) {
    return false;
  }

  const s = settings as Record<string, unknown>;

  return (
    typeof s.language === 'string' &&
    typeof s.theme === 'string' &&
    typeof s.enableToneDetection === 'boolean'
  );
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateLanguage(lang: string): boolean {
  return ['en', 'ar', 'ar-EG'].includes(lang);
}

export function validateTheme(theme: string): boolean {
  return ['light', 'dark', 'auto'].includes(theme);
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function sanitizeString(str: string, maxLength = 1000): string {
  return str
    .trim()
    .substring(0, maxLength)
    .replace(/[<>"']/g, (char) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return escapeMap[char] || char;
    });
}
