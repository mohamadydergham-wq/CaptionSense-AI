import { createLogger } from '@/shared/logger';
import { messageBus } from '@/shared/message-bus';
import { AudioStreamHandler } from '@/services/audio/audio-stream-handler';

const logger = createLogger('ContentScript');

logger.info('Content script loaded');

let port: chrome.runtime.Port | null = null;
let audioHandler: AudioStreamHandler | null = null;

// Connect to background service worker
function connectToBackground(): void {
  port = chrome.runtime.connect({ name: 'content-script' });

  port.onDisconnect.addListener(() => {
    logger.warn('Disconnected from background service worker');
    port = null;
    setTimeout(connectToBackground, 1000);
  });

  port.onMessage.addListener((message) => {
    handleBackgroundMessage(message);
  });
}

function handleBackgroundMessage(message: any): void {
  switch (message.type) {
    case 'start.capture':
      startAudioCapture();
      break;
    case 'stop.capture':
      stopAudioCapture();
      break;
    default:
      logger.debug(`Received message from background: ${message.type}`);
  }
}

async function startAudioCapture(): Promise<void> {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0].id === undefined) {
      throw new Error('Unable to get active tab ID');
    }

    const stream = await (navigator.mediaDevices as any).getDisplayMedia({
      audio: true,
      video: false,
    });

    audioHandler = new AudioStreamHandler();
    await audioHandler.setupStream(stream);

    logger.info('Audio capture started');
    if (port) {
      port.postMessage({ type: 'audio.capture_started' });
    }
  } catch (error) {
    logger.error('Failed to start audio capture', error);
    if (port) {
      port.postMessage({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}

function stopAudioCapture(): void {
  if (audioHandler) {
    audioHandler.cleanup();
    audioHandler = null;
    logger.info('Audio capture stopped');
  }
}

// Inject overlay iframe
function injectOverlay(): void {
  if (document.getElementById('captionsense-overlay-frame')) {
    return; // Already injected
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'captionsense-overlay-frame';
  iframe.src = chrome.runtime.getURL('overlay/overlay.html');
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.zIndex = '2147483647';
  iframe.style.pointerEvents = 'none';

  document.documentElement.appendChild(iframe);
  logger.info('Overlay injected');
}

// Initialize
connectToBackground();
injectOverlay();

logger.info('Content script ready');
