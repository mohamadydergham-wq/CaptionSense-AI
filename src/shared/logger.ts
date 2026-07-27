export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, error?: unknown): void;
}

class ConsoleLogger implements Logger {
  private context: string;

  public constructor(context: string) {
    this.context = context;
  }

  public debug(message: string, data?: unknown): void {
    console.debug(`[${this.context}] ${message}`, data);
  }

  public info(message: string, data?: unknown): void {
    console.info(`[${this.context}] ${message}`, data);
  }

  public warn(message: string, data?: unknown): void {
    console.warn(`[${this.context}] ${message}`, data);
  }

  public error(message: string, error?: unknown): void {
    console.error(`[${this.context}] ${message}`, error);
  }
}

export function createLogger(context: string): Logger {
  return new ConsoleLogger(context);
}

export const logger = createLogger('CaptionSense');
