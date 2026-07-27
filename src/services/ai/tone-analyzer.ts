import { createLogger } from '@/shared/logger';
import type { ToneAnalysis, Tone } from '@/types/tone';
import { TONE_CATEGORIES } from '@/constants/tones';

const logger = createLogger('ToneAnalyzer');

export class ToneAnalyzer {
  public async analyze(text: string): Promise<ToneAnalysis> {
    try {
      // This would call the backend API for actual implementation
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      logger.info(`Tone analysis complete: ${result.data.tone.primary}`);

      return this.formatToneAnalysis(result.data.tone);
    } catch (error) {
      logger.error('Tone analysis failed', error);
      return this.getDefaultTone();
    }
  }

  private formatToneAnalysis(toneData: any): ToneAnalysis {
    return {
      primary: toneData.primary || 'neutral',
      score: toneData.score || 0.5,
      alternatives: toneData.alternatives || [],
      timestamp: Date.now(),
    };
  }

  private getDefaultTone(): ToneAnalysis {
    return {
      primary: 'neutral',
      score: 0.5,
      alternatives: [],
      timestamp: Date.now(),
    };
  }
}
