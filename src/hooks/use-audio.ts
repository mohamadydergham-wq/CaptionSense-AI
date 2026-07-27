import { createLogger } from '@/shared/logger';

const logger = createLogger('AudioHook');

export interface AudioDeviceInfo {
  deviceId: string;
  groupId: string;
  kind: MediaDeviceKind;
  label: string;
}

export interface UseAudioReturn {
  stream: MediaStream | null;
  isRecording: boolean;
  error: Error | null;
  startRecording(): Promise<void>;
  stopRecording(): Promise<void>;
  getDevices(): Promise<AudioDeviceInfo[]>;
  requestPermission(): Promise<boolean>;
}

export async function useAudio(): Promise<UseAudioReturn> {
  let stream: MediaStream | null = null;
  let isRecording = false;
  let error: Error | null = null;

  async function requestPermission(): Promise<boolean> {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' });
      return result.state === 'granted';
    } catch (err) {
      logger.warn('Permission query not supported', err);
      return true;
    }
  }

  async function startRecording(): Promise<void> {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      isRecording = true;
      logger.info('Recording started');
    } catch (err) {
      error = err instanceof Error ? err : new Error('Failed to start recording');
      logger.error('Failed to start recording', err);
      throw error;
    }
  }

  async function stopRecording(): Promise<void> {
    if (!stream) return;

    stream.getTracks().forEach((track) => track.stop());
    stream = null;
    isRecording = false;
    logger.info('Recording stopped');
  }

  async function getDevices(): Promise<AudioDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter((device) => device.kind === 'audioinput')
        .map((device) => ({
          deviceId: device.deviceId,
          groupId: device.groupId,
          kind: device.kind,
          label: device.label || `Audio Device ${device.deviceId.substring(0, 5)}`,
        }));
    } catch (err) {
      logger.error('Failed to enumerate devices', err);
      return [];
    }
  }

  return {
    stream,
    isRecording,
    error,
    startRecording,
    stopRecording,
    getDevices,
    requestPermission,
  };
}
