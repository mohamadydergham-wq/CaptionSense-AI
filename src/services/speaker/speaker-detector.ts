import { createLogger } from '@/shared/logger';
import type { TranscriptEntry } from '@/types/transcript';
import { generateUUID } from '@/utils/helpers';

const logger = createLogger('SpeakerDetector');

export class SpeakerDetector {
  private speakers: Map<string, string> = new Map();
  private currentSpeaker: string | null = null;
  private speakerCount = 0;

  public detectChange(text: string): string {
    // Placeholder for speaker change detection
    // In production, this would use audio analysis or patterns
    const speakerId = `speaker_${this.speakerCount}`;
    this.currentSpeaker = speakerId;
    logger.info(`Speaker change detected: ${speakerId}`);
    return speakerId;
  }

  public assignSpeaker(speakerId: string, name: string): void {
    this.speakers.set(speakerId, name);
    logger.info(`Speaker assigned: ${speakerId} -> ${name}`);
  }

  public getSpeakerName(speakerId: string): string {
    return this.speakers.get(speakerId) || 'Unknown Speaker';
  }

  public trackSpeaker(entry: TranscriptEntry): void {
    if (!entry.speaker) {
      entry.speaker = this.currentSpeaker || 'Unknown Speaker';
    }
  }

  public getSpeakerStats(): Map<string, number> {
    const stats = new Map<string, number>();
    this.speakers.forEach((name, id) => {
      stats.set(name, stats.get(name) ? stats.get(name)! + 1 : 1);
    });
    return stats;
  }
}
