import { createLogger } from '@/shared/logger';
import { messageBus } from '@/shared/message-bus';
import type { Settings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';

const logger = createLogger('PopupUI');

export class PopupUI {
  private settings: Settings = DEFAULT_SETTINGS;
  private transcriptEntries: string[] = [];
  private isRecording = false;
  private recordingTime = 0;
  private recordingInterval: NodeJS.Timeout | null = null;

  public constructor() {
    this.initializeUI();
    this.setupEventListeners();
    this.loadSettings();
  }

  private initializeUI(): void {
    logger.info('Initializing Popup UI');
    this.updateStatusDisplay();
  }

  private setupEventListeners(): void {
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const clearBtn = document.getElementById('clear-transcript-btn');
    const exportTxtBtn = document.getElementById('export-txt-btn');
    const exportMdBtn = document.getElementById('export-md-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const exportJsonBtn = document.getElementById('export-json-btn');
    const generateSummaryBtn = document.getElementById('generate-summary-btn');

    startBtn?.addEventListener('click', () => this.handleStartRecording());
    stopBtn?.addEventListener('click', () => this.handleStopRecording());
    settingsBtn?.addEventListener('click', () => this.openSettings());
    clearBtn?.addEventListener('click', () => this.clearTranscript());
    exportTxtBtn?.addEventListener('click', () => this.exportTranscript('txt'));
    exportMdBtn?.addEventListener('click', () => this.exportTranscript('md'));
    exportPdfBtn?.addEventListener('click', () => this.exportTranscript('pdf'));
    exportJsonBtn?.addEventListener('click', () => this.exportTranscript('json'));
    generateSummaryBtn?.addEventListener('click', () => this.generateSummary());

    messageBus.subscribe('transcription.update', (msg) => this.handleTranscriptionUpdate(msg.payload));
    messageBus.subscribe('tone.detected', (msg) => this.handleToneUpdate(msg.payload));
    messageBus.subscribe('sentiment.analyzed', (msg) => this.handleSentimentUpdate(msg.payload));
  }

  private async loadSettings(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get('settings');
      if (result.settings) {
        this.settings = result.settings;
      }
    } catch (error) {
      logger.error('Failed to load settings', error);
    }
  }

  private handleStartRecording(): void {
    this.isRecording = true;
    this.recordingTime = 0;
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');

    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;

    this.recordingInterval = setInterval(() => {
      this.recordingTime += 1000;
      this.updateStatusDisplay();
    }, 1000);

    messageBus.publish('recording.started', {}, 'high');
    logger.info('Recording started');
  }

  private handleStopRecording(): void {
    this.isRecording = false;
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
    }

    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const generateSummaryBtn = document.getElementById('generate-summary-btn');

    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
    if (generateSummaryBtn) generateSummaryBtn.disabled = false;

    messageBus.publish('recording.stopped', {}, 'high');
    logger.info('Recording stopped');
  }

  private updateStatusDisplay(): void {
    const statusLabel = document.getElementById('status-label');
    const statusTime = document.getElementById('status-time');
    const statusIndicator = document.getElementById('status-indicator');

    if (this.isRecording) {
      const minutes = Math.floor(this.recordingTime / 60000);
      const seconds = Math.floor((this.recordingTime % 60000) / 1000);
      const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      if (statusLabel) statusLabel.textContent = 'Recording';
      if (statusTime) statusTime.textContent = timeStr;
      if (statusIndicator) statusIndicator.classList.add('recording');
    } else {
      if (statusLabel) statusLabel.textContent = 'Ready';
      if (statusTime) statusTime.textContent = '--:--';
      if (statusIndicator) statusIndicator.classList.remove('recording');
    }
  }

  private handleTranscriptionUpdate(payload: any): void {
    const text = payload.text || '';
    const speaker = payload.speaker || 'Unknown Speaker';

    this.transcriptEntries.push(`${speaker}: ${text}`);
    this.updateTranscriptDisplay();
  }

  private handleToneUpdate(payload: any): void {
    const toneDisplay = document.getElementById('tone-display');
    if (toneDisplay && payload.tone) {
      toneDisplay.textContent = `${payload.tone.primary} (${Math.round(payload.tone.score * 100)}%)`;
    }
  }

  private handleSentimentUpdate(payload: any): void {
    const sentimentDisplay = document.getElementById('sentiment-display');
    if (sentimentDisplay && payload.sentiment) {
      sentimentDisplay.textContent = payload.sentiment.type.toUpperCase();
    }
  }

  private updateTranscriptDisplay(): void {
    const container = document.getElementById('transcript-container');
    if (!container) return;

    container.innerHTML = this.transcriptEntries
      .map((entry) => `<p class="transcript-entry">${this.escapeHtml(entry)}</p>`)
      .join('');

    container.scrollTop = container.scrollHeight;
  }

  private clearTranscript(): void {
    this.transcriptEntries = [];
    const container = document.getElementById('transcript-container');
    if (container) {
      container.innerHTML = '<p class="empty-state">No transcript yet. Start recording to begin.</p>';
    }
    logger.info('Transcript cleared');
  }

  private async exportTranscript(format: 'txt' | 'md' | 'pdf' | 'json'): Promise<void> {
    const content = this.transcriptEntries.join('\n');
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `transcript_${timestamp}.${format === 'md' ? 'md' : format === 'pdf' ? 'pdf' : format}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    logger.info(`Transcript exported as ${format}`);
    messageBus.publish('export.completed', { format }, 'normal');
  }

  private async generateSummary(): Promise<void> {
    const summaryContainer = document.getElementById('summary-container');
    if (!summaryContainer) return;

    try {
      messageBus.publish('summary.requested', { entries: this.transcriptEntries }, 'high');
      summaryContainer.classList.remove('hidden');
      logger.info('Summary generation requested');
    } catch (error) {
      logger.error('Failed to generate summary', error);
    }
  }

  private openSettings(): void {
    logger.info('Opening settings');
    messageBus.publish('settings.panel_opened', {}, 'normal');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PopupUI();
  });
} else {
  new PopupUI();
}
