import type { Tone } from './tone';
import type { Sentiment } from './sentiment';

export interface Settings {
  // Language settings
  language: 'en' | 'ar' | 'ar-EG';
  transcriptionLanguage: 'en' | 'ar' | 'ar-EG';
  translationLanguage?: 'en' | 'ar' | 'fr' | 'es';

  // UI settings
  theme: 'light' | 'dark' | 'auto';
  captionSize: 'small' | 'medium' | 'large';
  captionOpacity: number; // 0-1
  captionPosition: 'top' | 'bottom' | 'left' | 'right' | 'custom';
  customPosition?: { x: number; y: number };
  captionWidth: number; // pixels

  // Feature toggles
  enableToneDetection: boolean;
  enableSentimentAnalysis: boolean;
  enableSpeakerDetection: boolean;
  enableTranslation: boolean;
  enableSummary: boolean;
  enableAutoSave: boolean;
  enableCloudAI: boolean;

  // Auto-save settings
  autoSaveInterval: number; // ms
  autoSaveLocation: 'local' | 'cloud';
  retentionDays: number; // 0 = keep forever

  // Keyboard shortcuts
  shortcuts: Record<string, string>;

  // Privacy
  disableTracking: boolean;
  deleteOnClose: boolean;
  encryptData: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  language: 'en',
  transcriptionLanguage: 'en',
  translationLanguage: 'en',
  theme: 'auto',
  captionSize: 'medium',
  captionOpacity: 0.9,
  captionPosition: 'bottom',
  captionWidth: 800,
  enableToneDetection: true,
  enableSentimentAnalysis: true,
  enableSpeakerDetection: true,
  enableTranslation: false,
  enableSummary: true,
  enableAutoSave: true,
  enableCloudAI: false,
  autoSaveInterval: 5000,
  autoSaveLocation: 'local',
  retentionDays: 90,
  shortcuts: {
    toggleCaption: 'Ctrl+Shift+C',
    toggleOverlay: 'Ctrl+Shift+O',
    toggleTranslation: 'Ctrl+Shift+T',
    exportTranscript: 'Ctrl+Shift+E',
  },
  disableTracking: true,
  deleteOnClose: false,
  encryptData: true,
};
