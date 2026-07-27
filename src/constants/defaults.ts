import type { Settings } from '@/types/settings';

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

export const MAX_TRANSCRIPT_LENGTH = 1000000; // 1MB
export const MAX_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
export const AUTO_SAVE_INTERVAL = 5000; // 5 seconds
export const BUFFER_SIZE = 4096;
export const SAMPLE_RATE = 16000;
