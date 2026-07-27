export type Tone = 'calm' | 'happy' | 'neutral' | 'excited' | 'angry' | 'frustrated' | 'confident' | 'nervous' | 'sad';

export interface ToneAnalysis {
  primary: Tone;
  score: number; // 0-1
  alternatives: ToneAlternative[];
  timestamp: number;
}

export interface ToneAlternative {
  tone: Tone;
  score: number;
}

export const TONE_EMOJI: Record<Tone, string> = {
  calm: '😌',
  happy: '😊',
  neutral: '😐',
  excited: '🤩',
  angry: '😠',
  frustrated: '😤',
  confident: '💪',
  nervous: '😰',
  sad: '😢',
};

export const TONE_COLORS: Record<Tone, string> = {
  calm: '#4CAF50',
  happy: '#FFD700',
  neutral: '#9E9E9E',
  excited: '#FF6B6B',
  angry: '#F44336',
  frustrated: '#FF9800',
  confident: '#2196F3',
  nervous: '#673AB7',
  sad: '#00BCD4',
};
