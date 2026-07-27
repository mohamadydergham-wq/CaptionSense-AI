import type { Tone } from '@/types/tone';

export const TONE_CATEGORIES: Tone[] = [
  'calm',
  'happy',
  'neutral',
  'excited',
  'angry',
  'frustrated',
  'confident',
  'nervous',
  'sad',
];

export const TONE_DESCRIPTIONS: Record<Tone, string> = {
  calm: 'Speaker is calm and composed',
  happy: 'Speaker is happy and cheerful',
  neutral: 'Speaker is neutral',
  excited: 'Speaker is excited and enthusiastic',
  angry: 'Speaker is angry',
  frustrated: 'Speaker is frustrated',
  confident: 'Speaker is confident',
  nervous: 'Speaker is nervous',
  sad: 'Speaker is sad',
};
