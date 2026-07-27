import { createLogger } from '@/shared/logger';
import { messageBus } from '@/shared/message-bus';
import { indexedDBService } from '@/storage/indexed-db';

const logger = createLogger('ServiceWorker');

logger.info('Service Worker initialized');

// Initialize IndexedDB
indexedDBService.initialize().catch((error) => {
  logger.error('Failed to initialize IndexedDB', error);
});

// Message listener for communication with content scripts
chrome.runtime.onConnect.addListener((port) => {
  logger.info(`Connected to ${port.name}`);

  port.onMessage.addListener((message, sender) => {
    handleMessage(message, sender, port);
  });

  port.onDisconnect.addListener(() => {
    logger.info(`Disconnected from ${port.name}`);
  });
});

async function handleMessage(message: any, sender: chrome.runtime.MessageSender, port: chrome.runtime.Port): Promise<void> {
  try {
    switch (message.type) {
      case 'audio.capture':
        await handleAudioCapture(message, port);
        break;
      case 'transcription.request':
        await handleTranscriptionRequest(message, port);
        break;
      case 'analysis.request':
        await handleAnalysisRequest(message, port);
        break;
      case 'storage.save':
        await handleStorageSave(message, port);
        break;
      case 'storage.load':
        await handleStorageLoad(message, port);
        break;
      default:
        logger.warn(`Unknown message type: ${message.type}`);
    }
  } catch (error) {
    logger.error('Error handling message', error);
    port.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function handleAudioCapture(message: any, port: chrome.runtime.Port): Promise<void> {
  logger.info('Audio capture received');
  messageBus.publish('audio.captured', message.data, 'high');
  port.postMessage({ type: 'ack', status: 'ok' });
}

async function handleTranscriptionRequest(message: any, port: chrome.runtime.Port): Promise<void> {
  try {
    const response = await fetch('http://localhost:3000/api/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message.data),
    });

    const result = await response.json();
    messageBus.publish('transcription.complete', result.data, 'high');
    port.postMessage({ type: 'transcription.result', data: result.data });
  } catch (error) {
    logger.error('Transcription request failed', error);
    throw error;
  }
}

async function handleAnalysisRequest(message: any, port: chrome.runtime.Port): Promise<void> {
  try {
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message.data),
    });

    const result = await response.json();
    messageBus.publish('analysis.complete', result.data, 'high');
    port.postMessage({ type: 'analysis.result', data: result.data });
  } catch (error) {
    logger.error('Analysis request failed', error);
    throw error;
  }
}

async function handleStorageSave(message: any, port: chrome.runtime.Port): Promise<void> {
  try {
    await indexedDBService.saveSessionData(message.key, message.data);
    port.postMessage({ type: 'storage.saved', key: message.key });
  } catch (error) {
    logger.error('Storage save failed', error);
    throw error;
  }
}

async function handleStorageLoad(message: any, port: chrome.runtime.Port): Promise<void> {
  try {
    const data = await indexedDBService.getSessionData(message.key);
    port.postMessage({ type: 'storage.loaded', key: message.key, data });
  } catch (error) {
    logger.error('Storage load failed', error);
    throw error;
  }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    logger.info('Extension installed');
    chrome.runtime.openOptionsPage();
  } else if (details.reason === 'update') {
    logger.info('Extension updated');
  }
});
