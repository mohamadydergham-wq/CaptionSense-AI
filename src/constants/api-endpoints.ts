export const API_ENDPOINTS = {
  TRANSCRIBE: '/api/transcribe',
  ANALYZE: '/api/analyze',
  SUMMARIZE: '/api/summarize',
  TRANSLATE: '/api/translate',
  EXPORT: '/api/export',
  SETTINGS: '/api/settings',
  HISTORY: '/api/history',
  HEALTH: '/api/health',
};

export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export const API_TIMEOUT = 30000; // 30 seconds
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 second
