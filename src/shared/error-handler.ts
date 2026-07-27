import type { Logger } from './logger';
import { createLogger } from './logger';

export interface ExtensionError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
  stack?: string;
}

export class CaptionSenseError extends Error {
  public code: string;
  public details?: Record<string, unknown>;

  public constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'CaptionSenseError';
  }
}

export class ErrorHandler {
  private logger: Logger;

  public constructor() {
    this.logger = createLogger('ErrorHandler');
  }

  public handle(error: unknown): ExtensionError {
    const extensionError = this.normalize(error);
    this.logger.error(extensionError.message, extensionError);
    return extensionError;
  }

  public normalize(error: unknown): ExtensionError {
    if (error instanceof CaptionSenseError) {
      return {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: Date.now(),
        stack: error.stack,
      };
    }

    if (error instanceof Error) {
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        timestamp: Date.now(),
        stack: error.stack,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: String(error),
      timestamp: Date.now(),
    };
  }
}

export const errorHandler = new ErrorHandler();
