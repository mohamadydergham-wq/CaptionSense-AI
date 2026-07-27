import { createLogger } from '@/shared/logger';
import type { TranscriptEntry, MeetingSummary } from '@/types/transcript';
import pdfkit from 'pdfkit';

const logger = createLogger('TranscriptFormatter');

export class TranscriptFormatter {
  public toTXT(entries: TranscriptEntry[], summary?: MeetingSummary): string {
    let output = '=== TRANSCRIPT ===\n\n';

    entries.forEach((entry) => {
      output += `[${this.formatTime(entry.timestamp)}] ${entry.speaker}\n`;
      output += `${entry.text}\n`;
      if (entry.tone) {
        output += `Tone: ${entry.tone.primary} (${Math.round(entry.tone.score * 100)}%)\n`;
      }
      if (entry.sentiment) {
        output += `Sentiment: ${entry.sentiment.type}\n`;
      }
      output += '\n';
    });

    if (summary) {
      output += '\n=== SUMMARY ===\n\n';
      output += `${summary.summary}\n\n`;
      output += 'KEY TOPICS:\n';
      summary.keyTopics.forEach((topic) => {
        output += `- ${topic}\n`;
      });
      output += '\nDECISIONS:\n';
      summary.decisions.forEach((decision) => {
        output += `- ${decision}\n`;
      });
    }

    return output;
  }

  public toMarkdown(entries: TranscriptEntry[], summary?: MeetingSummary): string {
    let output = '# Meeting Transcript\n\n';

    entries.forEach((entry) => {
      output += `## ${entry.speaker} - ${this.formatTime(entry.timestamp)}\n\n`;
      output += `${entry.text}\n\n`;
      if (entry.tone) {
        output += `> **Tone:** ${entry.tone.primary} (${Math.round(entry.tone.score * 100)}%)\n\n`;
      }
      if (entry.sentiment) {
        output += `> **Sentiment:** ${entry.sentiment.type}\n\n`;
      }
    });

    if (summary) {
      output += '\n## Meeting Summary\n\n';
      output += `${summary.summary}\n\n`;
      output += '### Key Topics\n';
      summary.keyTopics.forEach((topic) => {
        output += `- ${topic}\n`;
      });
      output += '\n### Decisions\n';
      summary.decisions.forEach((decision) => {
        output += `- ${decision}\n`;
      });
    }

    return output;
  }

  public toJSON(entries: TranscriptEntry[], summary?: MeetingSummary): string {
    const data = {
      transcript: entries,
      summary,
      generatedAt: new Date().toISOString(),
      version: '1.0',
    };
    return JSON.stringify(data, null, 2);
  }

  public async toPDF(entries: TranscriptEntry[], summary?: MeetingSummary): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new (pdfkit as any)();
        const chunks: BlobPart[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(new Blob(chunks, { type: 'application/pdf' })));
        doc.on('error', reject);

        doc.fontSize(16).text('Meeting Transcript', { underline: true });
        doc.moveDown();

        entries.forEach((entry) => {
          doc.fontSize(12).text(`${entry.speaker} - ${this.formatTime(entry.timestamp)}`, {
            underline: true,
          });
          doc.fontSize(10).text(entry.text);
          if (entry.tone) {
            doc.fontSize(9).text(`Tone: ${entry.tone.primary} (${Math.round(entry.tone.score * 100)}%)`);
          }
          doc.moveDown();
        });

        if (summary) {
          doc.addPage()
            .fontSize(14)
            .text('Meeting Summary', { underline: true })
            .moveDown()
            .fontSize(10)
            .text(summary.summary);
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const displaySeconds = seconds % 60;
    return `${minutes}:${displaySeconds.toString().padStart(2, '0')}`;
  }
}
