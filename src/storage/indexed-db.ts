import { createLogger } from '@/shared/logger';
import type { Session, TranscriptEntry } from '@/types/transcript';

const logger = createLogger('IndexedDB');
const DB_NAME = 'CaptionSenseDB';
const DB_VERSION = 1;

export class IndexedDBService {
  private db: IDBDatabase | null = null;

  public async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        logger.error('Failed to open database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        logger.info('Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('transcripts')) {
          db.createObjectStore('transcripts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }

        logger.info('Database schema created');
      };
    });
  }

  public async saveSession(session: Session): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      const request = store.put(session);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        logger.info(`Session saved: ${session.id}`);
        resolve();
      };
    });
  }

  public async getSession(sessionId: string): Promise<Session | undefined> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const request = store.get(sessionId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  public async getAllSessions(): Promise<Session[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  public async deleteSession(sessionId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      const request = store.delete(sessionId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        logger.info(`Session deleted: ${sessionId}`);
        resolve();
      };
    });
  }

  public async saveTranscriptEntry(entry: TranscriptEntry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['transcripts'], 'readwrite');
      const store = transaction.objectStore('transcripts');
      const request = store.put(entry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  public async getTranscriptEntries(sessionId: string): Promise<TranscriptEntry[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['transcripts'], 'readonly');
      const store = transaction.objectStore('transcripts');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entries = request.result.filter((e: TranscriptEntry) => e.id.startsWith(sessionId));
        resolve(entries);
      };
    });
  }

  public async setCacheData(key: string, data: unknown, ttlMs = 3600000): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const cacheEntry = {
      key,
      data,
      expiry: Date.now() + ttlMs,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put(cacheEntry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  public async getCacheData(key: string): Promise<unknown | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entry = request.result;
        if (entry && entry.expiry > Date.now()) {
          resolve(entry.data);
        } else {
          resolve(null);
        }
      };
    });
  }

  public async clearExpiredCache(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    const request = store.getAll();

    request.onsuccess = () => {
      const entries = request.result;
      entries.forEach((entry) => {
        if (entry.expiry <= Date.now()) {
          store.delete(entry.key);
        }
      });
    };
  }
}

export const indexedDBService = new IndexedDBService();
