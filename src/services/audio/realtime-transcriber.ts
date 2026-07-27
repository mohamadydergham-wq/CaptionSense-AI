import { createLogger } from '@/shared/logger';
import { retry } from '@/shared/retry-logic';
import { messageBus } from '@/shared/message-bus';
import type { TranscriptionResponse } from '@/types/api';

const logger = createLogger('RealtimeTranscriber');

export class RealtimeTranscriber {
  private apiKey: string;
  private ws: WebSocket | null = null;
  private isConnected = false;

  public constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async connect(): Promise<void> {
    await retry(async () => {
      return new Promise((resolve, reject) => {
        try {
          // This would connect to your backend WebSocket endpoint
          // For now, we'll use a placeholder that would be implemented
          logger.info('Connecting to realtime transcriber...');
          resolve();
        } catch (error) {
          logger.error('Failed to connect to realtime transcriber', error);
          reject(error);
        }
      });
    });

    this.isConnected = true;
  }

  public async transcribe(audioData: Blob, language: string): Promise<TranscriptionResponse> {
    if (!this.isConnected) {
      throw new Error('Not connected to transcriber');
    }

    try {
      const base64Audio = await this.blobToBase64(audioData);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          audio_base64: base64Audio,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      logger.info('Transcription successful');
      return result.data;
    } catch (error) {
      logger.error('Transcription failed', error);
      throw error;
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  public close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    logger.info('Transcriber closed');
  }
}
