import type { Logger } from './logger';
import { createLogger } from './logger';

export type MessagePriority = 'high' | 'normal' | 'low';

export interface Message<T = unknown> {
  type: string;
  payload: T;
  priority: MessagePriority;
  timestamp: number;
  id: string;
}

export type MessageHandler<T = unknown> = (message: Message<T>) => Promise<void> | void;

export class MessageBus {
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private logger: Logger;
  private messageQueue: Message[] = [];
  private isProcessing = false;

  public constructor() {
    this.logger = createLogger('MessageBus');
  }

  public subscribe<T = unknown>(type: string, handler: MessageHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }

    this.handlers.get(type)!.add(handler as MessageHandler);

    return () => {
      this.handlers.get(type)?.delete(handler as MessageHandler);
    };
  }

  public async publish<T = unknown>(
    type: string,
    payload: T,
    priority: MessagePriority = 'normal',
  ): Promise<void> {
    const message: Message<T> = {
      type,
      payload,
      priority,
      timestamp: Date.now(),
      id: `${type}-${Date.now()}-${Math.random()}`,
    };

    this.logger.debug(`Publishing message: ${type}`, { priority, payloadSize: JSON.stringify(payload).length });

    this.messageQueue.push(message);
    this.messageQueue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    await this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (!message) break;

        const handlers = this.handlers.get(message.type);
        if (handlers && handlers.size > 0) {
          await Promise.all(Array.from(handlers).map((handler) => handler(message)));
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  public clear(): void {
    this.handlers.clear();
    this.messageQueue = [];
    this.logger.info('Message bus cleared');
  }
}

export const messageBus = new MessageBus();
