import { createLogger } from '@/shared/logger';
import { messageBus } from '@/shared/message-bus';
import type { AudioFrame, AudioConfig } from '@/types/audio';
import { DEFAULT_AUDIO_CONFIG } from '@/types/audio';

const logger = createLogger('AudioProcessor');

export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private config: AudioConfig;
  private isProcessing = false;

  public constructor(config: Partial<AudioConfig> = {}) {
    this.config = { ...DEFAULT_AUDIO_CONFIG, ...config };
  }

  public async initialize(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      logger.info('AudioContext initialized');
    } catch (error) {
      logger.error('Failed to initialize AudioContext', error);
      throw error;
    }
  }

  public setupScriptProcessor(stream: MediaStream): void {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    const source = this.audioContext.createMediaStreamSource(stream);
    this.processor = this.audioContext.createScriptProcessor(this.config.frameSize, 1, 1);

    this.processor.onaudioprocess = (event: AudioProcessingEvent) => {
      const inputData = event.inputBuffer.getChannelData(0);
      this.processAudioFrame(new Float32Array(inputData));
    };

    source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
    this.isProcessing = true;
    logger.info('ScriptProcessor setup complete');
  }

  private processAudioFrame(data: Float32Array): void {
    const frame: AudioFrame = {
      data,
      timestamp: Date.now(),
      sampleRate: this.config.sampleRate,
    };

    messageBus.publish('audio.frame_captured', frame, 'high');
  }

  public async captureAudio(stream: MediaStream): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        resolve(blob);
      };

      mediaRecorder.onerror = (error) => {
        logger.error('MediaRecorder error', error);
        reject(error);
      };

      mediaRecorder.start();
    });
  }

  public validateAudioQuality(data: Float32Array): boolean {
    if (data.length === 0) return false;

    const rms = Math.sqrt(data.reduce((sum, val) => sum + val * val, 0) / data.length);
    return rms > 0.001; // Minimum RMS threshold
  }

  public stop(): void {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isProcessing = false;
    logger.info('AudioProcessor stopped');
  }
}
