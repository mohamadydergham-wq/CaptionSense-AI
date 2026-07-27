export const SUPPORTED_LANGUAGES = {
  'en': { name: 'English', nativeName: 'English' },
  'ar': { name: 'Arabic', nativeName: 'العربية' },
  'ar-EG': { name: 'Egyptian Arabic', nativeName: 'اللهجة المصرية' },
};

export const TRANSLATION_LANGUAGES = {
  'en': { name: 'English', nativeName: 'English' },
  'ar': { name: 'Arabic', nativeName: 'العربية' },
  'fr': { name: 'French', nativeName: 'Français' },
  'es': { name: 'Spanish', nativeName: 'Español' },
};

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;
export type TranslationLanguage = keyof typeof TRANSLATION_LANGUAGES;

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const DEFAULT_TRANSLATION_LANGUAGE: TranslationLanguage = 'en';
