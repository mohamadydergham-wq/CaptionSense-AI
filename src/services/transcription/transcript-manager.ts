import { createLogger } from '@/shared/logger';
import type { TranscriptEntry, Session } from '@/types/transcript';
import { generateUUID } from '@/utils/helpers';

const logger = createLogger('TranscriptManager');

export class TranscriptManager {
  private entries: TranscriptEntry[] = [];
  private sessionId: string;

  public constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  public add(entry: TranscriptEntry): void {
    this.entries.push(entry);
    logger.info(`Entry added: ${entry.id}`);
  }

  public update(id: string, updates: Partial<TranscriptEntry>): void {
    const index = this.entries.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Entry not found: ${id}`);
    }
    this.entries[index] = { ...this.entries[index], ...updates };
    logger.info(`Entry updated: ${id}`);
  }

  public get(id: string): TranscriptEntry | undefined {
    return this.entries.find((e) => e.id === id);
  }

  public getAll(): TranscriptEntry[] {
    return [...this.entries];
  }

  public search(query: string): TranscriptEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.entries.filter(
      (entry) =>
        entry.text.toLowerCase().includes(lowerQuery) || entry.speaker.toLowerCase().includes(lowerQuery),
    );
  }

  public clear(): void {
    this.entries = [];
    logger.info('Transcript cleared');
  }

  public export(): TranscriptEntry[] {
    return [...this.entries];
  }
}
