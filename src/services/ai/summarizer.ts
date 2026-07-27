import { createLogger } from '@/shared/logger';
import type { TranscriptEntry, MeetingSummary } from '@/types/transcript';

const logger = createLogger('Summarizer');

export class Summarizer {
  public async generateSummary(entries: TranscriptEntry[], meetingTitle?: string): Promise<MeetingSummary> {
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: entries,
          meeting_title: meetingTitle,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      logger.info('Meeting summary generated');

      return result.data;
    } catch (error) {
      logger.error('Summary generation failed', error);
      return this.getDefaultSummary();
    }
  }

  private getDefaultSummary(): MeetingSummary {
    return {
      summary: 'Unable to generate summary',
      keyTopics: [],
      decisions: [],
      actionItems: [],
      openQuestions: [],
      risks: [],
      deadlines: [],
      generatedAt: Date.now(),
    };
  }
}
