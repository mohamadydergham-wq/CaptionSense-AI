export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface SentimentAnalysis {
  type: Sentiment;
  score: number; // -1 to 1 (negative to positive)
  keywords: string[];
  confidence: number; // 0-1
  timestamp: number;
}

export const SENTIMENT_COLORS: Record<Sentiment, string> = {
  positive: '#4CAF50',
  negative: '#F44336',
  neutral: '#9E9E9E',
};

export const SENTIMENT_EMOJI: Record<Sentiment, string> = {
  positive: '👍',
  negative: '👎',
  neutral: '➖',
};
