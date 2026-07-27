import { createLogger } from '@/shared/logger';
import { messageBus } from '@/shared/message-bus';

const logger = createLogger('OverlayUI');

export class OverlayUI {
  private isDragging = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private isMinimized = false;
  private isVisible = true;

  public constructor() {
    this.initializeOverlay();
    this.setupEventListeners();
    this.setupDragAndDrop();
    this.setupMessageHandlers();
  }

  private initializeOverlay(): void {
    const widget = document.getElementById('caption-widget');
    if (widget) {
      widget.style.position = 'fixed';
      widget.style.bottom = '20px';
      widget.style.right = '20px';
      widget.style.zIndex = '2147483647';
    }
    logger.info('Overlay initialized');
  }

  private setupEventListeners(): void {
    const closeBtn = document.getElementById('close-widget');
    const minimizeBtn = document.getElementById('toggle-minimize');
    const pinBtn = document.getElementById('toggle-pin');

    closeBtn?.addEventListener('click', () => this.closeWidget());
    minimizeBtn?.addEventListener('click', () => this.toggleMinimize());
    pinBtn?.addEventListener('click', () => this.togglePin());
  }

  private setupDragAndDrop(): void {
    const header = document.querySelector('.widget-header') as HTMLElement;
    const widget = document.getElementById('caption-widget') as HTMLElement;

    if (!header || !widget) return;

    header.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      const rect = widget.getBoundingClientRect();
      this.dragOffsetX = e.clientX - rect.left;
      this.dragOffsetY = e.clientY - rect.top;
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;

      widget.style.left = `${e.clientX - this.dragOffsetX}px`;
      widget.style.top = `${e.clientY - this.dragOffsetY}px`;
      widget.style.right = 'auto';
      widget.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
  }

  private setupMessageHandlers(): void {
    messageBus.subscribe('transcription.update', (msg) => this.updateCaption(msg.payload));
    messageBus.subscribe('tone.detected', (msg) => this.updateToneBadge(msg.payload));
    messageBus.subscribe('sentiment.analyzed', (msg) => this.updateSentimentIndicator(msg.payload));
    messageBus.subscribe('speaker.changed', (msg) => this.updateSpeakerLabel(msg.payload));
  }

  private updateCaption(payload: any): void {
    const captionsDisplay = document.getElementById('captions-display');
    if (!captionsDisplay) return;

    const text = payload.text || '';
    const html = `<p class="caption-text">${this.escapeHtml(text)}</p>`;

    if (captionsDisplay.innerHTML.includes('waiting-message')) {
      captionsDisplay.innerHTML = html;
    } else {
      captionsDisplay.innerHTML += html;
    }

    captionsDisplay.scrollTop = captionsDisplay.scrollHeight;
  }

  private updateToneBadge(payload: any): void {
    const badge = document.getElementById('tone-badge');
    if (badge && payload.tone) {
      badge.textContent = `${payload.tone.primary} ${Math.round(payload.tone.score * 100)}%`;
      badge.style.borderColor = payload.tone.color;
    }
  }

  private updateSentimentIndicator(payload: any): void {
    const indicator = document.getElementById('sentiment-indicator');
    if (indicator && payload.sentiment) {
      indicator.textContent = payload.sentiment.type.toUpperCase();
      indicator.style.borderColor = this.getSentimentColor(payload.sentiment.type);
    }
  }

  private updateSpeakerLabel(payload: any): void {
    const label = document.getElementById('speaker-label');
    if (label) {
      label.textContent = payload.speaker || 'Unknown Speaker';
    }
  }

  private toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
    const content = document.querySelector('.widget-content');
    const footer = document.querySelector('.widget-footer');

    if (this.isMinimized) {
      if (content) (content as HTMLElement).style.display = 'none';
      if (footer) (footer as HTMLElement).style.display = 'none';
    } else {
      if (content) (content as HTMLElement).style.display = 'block';
      if (footer) (footer as HTMLElement).style.display = 'flex';
    }
  }

  private togglePin(): void {
    const widget = document.getElementById('caption-widget');
    if (widget) {
      widget.classList.toggle('pinned');
    }
  }

  private closeWidget(): void {
    const widget = document.getElementById('caption-widget');
    if (widget) {
      widget.style.display = 'none';
      this.isVisible = false;
      messageBus.publish('overlay.closed', {}, 'normal');
      logger.info('Overlay closed');
    }
  }

  private getSentimentColor(sentiment: string): string {
    const colors: Record<string, string> = {
      positive: '#4CAF50',
      negative: '#F44336',
      neutral: '#9E9E9E',
    };
    return colors[sentiment] || '#9E9E9E';
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
    new OverlayUI();
  });
} else {
  new OverlayUI();
}
