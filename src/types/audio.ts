export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  frameSize: number;
}

export interface AudioFrame {
  data: Float32Array;
  timestamp: number;
  sampleRate: number;
}

export interface AudioStream {
  id: string;
  stream: MediaStream;
  processor?: AudioWorkletNode;
  isActive: boolean;
}

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  sampleRate: 16000,
  channels: 1,
  bitDepth: 16,
  frameSize: 4096,
};
