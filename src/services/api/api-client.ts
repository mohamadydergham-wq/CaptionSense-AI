import { createLogger } from '@/shared/logger';
import axios, { type AxiosInstance } from 'axios';
import type { ApiResponse, TranscriptionRequest, TranscriptionResponse } from '@/types/api';
import { BACKEND_URL, API_TIMEOUT, MAX_RETRIES, RETRY_DELAY } from '@/constants/api-endpoints';

const logger = createLogger('ApiClient');

export class ApiClient {
  private client: AxiosInstance;

  public constructor() {
    this.client = axios.create({
      baseURL: BACKEND_URL,
      timeout: API_TIMEOUT,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        if (!config || !config.__retryCount) {
          config.__retryCount = 0;
        }

        if (config.__retryCount < MAX_RETRIES) {
          config.__retryCount += 1;
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * config.__retryCount));
          return this.client(config);
        }

        return Promise.reject(error);
      },
    );
  }

  public async transcribe(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    try {
      const response = await this.client.post<ApiResponse<TranscriptionResponse>>('/api/transcribe', request);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error?.message || 'Transcription failed');
    } catch (error) {
      logger.error('Transcription API call failed', error);
      throw error;
    }
  }

  public async analyze(text: string): Promise<any> {
    try {
      const response = await this.client.post('/api/analyze', { text });
      return response.data;
    } catch (error) {
      logger.error('Analysis API call failed', error);
      throw error;
    }
  }

  public async summarize(transcript: any[]): Promise<any> {
    try {
      const response = await this.client.post('/api/summarize', { transcript });
      return response.data;
    } catch (error) {
      logger.error('Summarization API call failed', error);
      throw error;
    }
  }

  public async translate(text: string, targetLanguage: string): Promise<any> {
    try {
      const response = await this.client.post('/api/translate', {
        text,
        target_language: targetLanguage,
      });
      return response.data;
    } catch (error) {
      logger.error('Translation API call failed', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
