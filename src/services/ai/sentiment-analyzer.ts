import { createLogger } from '@/shared/logger';
import type { SentimentAnalysis } from '@/types/sentiment';
import { extractKeywords } from '@/utils/helpers';

const logger = createLogger('SentimentAnalyzer');

export class SentimentAnalyzer {
  public async analyze(text: string): Promise<SentimentAnalysis> {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      logger.info(`Sentiment analysis complete: ${result.data.sentiment.type}`);

      return this.formatSentimentAnalysis(result.data.sentiment);
    } catch (error) {
      logger.error('Sentiment analysis failed', error);
      return this.getDefaultSentiment();
    }
  }

  private formatSentimentAnalysis(sentimentData: any): SentimentAnalysis {
    return {
      type: sentimentData.type || 'neutral',
      score: sentimentData.score || 0,
      keywords: sentimentData.keywords || [],
      confidence: sentimentData.confidence || 0.5,
      timestamp: Date.now(),
    };
  }

  private getDefaultSentiment(): SentimentAnalysis {
    return {
      type: 'neutral',
      score: 0,
      keywords: [],
      confidence: 0.5,
      timestamp: Date.now(),
    };
  }
}
