import { createLogger } from '@/shared/logger';
import type { TranscriptEntry, Session } from '@/types/transcript';
import { indexedDBService } from '@/storage/indexed-db';

const logger = createLogger('TranscriptHook');

export interface UseTranscriptReturn {
  entries: TranscriptEntry[];
  loading: boolean;
  error: Error | null;
  addEntry(entry: TranscriptEntry): Promise<void>;
  updateEntry(id: string, updates: Partial<TranscriptEntry>): Promise<void>;
  searchEntries(query: string): TranscriptEntry[];
  clear(): Promise<void>;
}

export async function useTranscript(sessionId: string): Promise<UseTranscriptReturn> {
  let entries: TranscriptEntry[] = [];
  let loading = true;
  let error: Error | null = null;

  try {
    await indexedDBService.initialize();
    entries = await indexedDBService.getTranscriptEntries(sessionId);
  } catch (err) {
    error = err instanceof Error ? err : new Error('Failed to load transcript');
    logger.error('Failed to load transcript', err);
  } finally {
    loading = false;
  }

  async function addEntry(entry: TranscriptEntry): Promise<void> {
    try {
      await indexedDBService.saveTranscriptEntry(entry);
      entries.push(entry);
      logger.info(`Entry added: ${entry.id}`);
    } catch (err) {
      error = err instanceof Error ? err : new Error('Failed to add entry');
      logger.error('Failed to add entry', err);
      throw error;
    }
  }

  async function updateEntry(id: string, updates: Partial<TranscriptEntry>): Promise<void> {
    const entry = entries.find((e) => e.id === id);
    if (!entry) {
      error = new Error(`Entry not found: ${id}`);
      throw error;
    }

    const updated = { ...entry, ...updates };
    try {
      await indexedDBService.saveTranscriptEntry(updated);
      const index = entries.findIndex((e) => e.id === id);
      entries[index] = updated;
      logger.info(`Entry updated: ${id}`);
    } catch (err) {
      error = err instanceof Error ? err : new Error('Failed to update entry');
      logger.error('Failed to update entry', err);
      throw error;
    }
  }

  function searchEntries(query: string): TranscriptEntry[] {
    const lowerQuery = query.toLowerCase();
    return entries.filter(
      (entry) =>
        entry.text.toLowerCase().includes(lowerQuery) || entry.speaker.toLowerCase().includes(lowerQuery),
    );
  }

  async function clear(): Promise<void> {
    entries = [];
    logger.info('Transcript cleared');
  }

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    searchEntries,
    clear,
  };
}
