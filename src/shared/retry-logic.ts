import type { Logger } from './logger';
import { createLogger } from './logger';

export interface RetryOptions {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
  maxDelayMs?: number;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 30000,
};

export async function retry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const logger = createLogger('RetryLogic');
  let lastError: Error | null = null;
  let delay = config.delayMs;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      logger.debug(`Attempt ${attempt + 1}/${config.maxRetries + 1}`);
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.warn(`Attempt ${attempt + 1} failed: ${lastError.message}`);

      if (attempt < config.maxRetries) {
        logger.debug(`Retrying in ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs || 30000);
      }
    }
  }

  throw lastError || new Error('Retry failed');
}
