import { createLogger } from '@/shared/logger';
import type { TranslationResponse } from '@/types/api';

const logger = createLogger('Translator');

export class Translator {
  private cache: Map<string, string> = new Map();

  public async translate(text: string, targetLanguage: string): Promise<TranslationResponse> {
    const cacheKey = `${text}:${targetLanguage}`;
    if (this.cache.has(cacheKey)) {
      logger.debug('Translation retrieved from cache');
      return {
        translation: this.cache.get(cacheKey)!,
        sourceLanguage: 'auto',
        targetLanguage,
        confidence: 1.0,
      };
    }

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          target_language: targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      this.cache.set(cacheKey, result.data.translation);
      logger.info(`Translation complete: ${targetLanguage}`);

      return result.data;
    } catch (error) {
      logger.error('Translation failed', error);
      throw error;
    }
  }

  public clearCache(): void {
    this.cache.clear();
    logger.info('Translation cache cleared');
  }
}
