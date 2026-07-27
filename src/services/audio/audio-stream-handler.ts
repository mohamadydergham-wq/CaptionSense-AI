import { createLogger } from '@/shared/logger';
import { messageBus } from '@/shared/message-bus';
import type { AudioStream } from '@/types/audio';
import { generateUUID } from '@/utils/helpers';

const logger = createLogger('AudioStreamHandler');

export class AudioStreamHandler {
  private stream: MediaStream | null = null;
  private processor: AudioWorkletNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private audioContext: AudioContext | null = null;
  private streamId: string;

  public constructor() {
    this.streamId = generateUUID();
  }

  public async setupStream(stream: MediaStream): Promise<void> {
    try {
      this.stream = stream;
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.source = this.audioContext.createMediaStreamSource(stream);
      logger.info(`Audio stream setup complete: ${this.streamId}`);
    } catch (error) {
      logger.error('Failed to setup audio stream', error);
      throw error;
    }
  }

  public handleData(data: Float32Array): void {
    messageBus.publish('audio.data_received', { streamId: this.streamId, data }, 'high');
  }

  public handleError(error: Error): void {
    logger.error(`Stream error (${this.streamId}):`, error);
    messageBus.publish('audio.error', { streamId: this.streamId, error: error.message }, 'high');
  }

  public cleanup(): void {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    logger.info(`Audio stream cleaned up: ${this.streamId}`);
  }

  public getStreamId(): string {
    return this.streamId;
  }

  public isActive(): boolean {
    return this.stream !== null && this.stream.active;
  }
}
