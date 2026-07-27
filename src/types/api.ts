export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface TranscriptionRequest {
  audioBase64: string;
  language: 'en' | 'ar' | 'ar-EG';
  speakerId?: string;
}

export interface TranscriptionResponse {
  text: string;
  confidence: number;
  language: string;
  speakerId?: string;
  durationMs: number;
}

export interface AnalysisRequest {
  text: string;
  speakerId?: string;
}

export interface AnalysisResponse {
  tone: ToneResponse;
  sentiment: SentimentResponse;
}

export interface ToneResponse {
  primary: string;
  score: number;
  alternatives: Array<{ tone: string; score: number }>;
}

export interface SentimentResponse {
  type: string;
  score: number;
  keywords: string[];
  confidence: number;
}

export interface SummarizationRequest {
  transcript: TranscriptEntry[];
  meetingTitle?: string;
}

export interface SummarizationResponse {
  summary: string;
  keyTopics: string[];
  decisions: string[];
  actionItems: ActionItem[];
  openQuestions: string[];
  risks: string[];
  deadlines: Deadline[];
}

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationResponse {
  translation: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

export interface ExportRequest {
  format: 'txt' | 'md' | 'pdf' | 'json';
  transcript: TranscriptEntry[];
  includeTone: boolean;
  includeSentiment: boolean;
  includeSummary: boolean;
}

import type { TranscriptEntry, ActionItem, Deadline } from './transcript';
