export interface TranscriptEntry {
  id: string;
  speaker: string;
  text: string;
  timestamp: number; // ms from start
  duration: number; // ms
  tone?: Tone;
  sentiment?: SentimentAnalysis;
  language: string;
  confidence: number; // 0-1
}

export interface Session {
  id: string;
  title: string;
  startTime: number;
  endTime?: number;
  duration?: number; // ms
  platform?: string; // 'google-meet', 'teams', 'zoom', etc.
  entries: TranscriptEntry[];
  summary?: MeetingSummary;
  speakers: Map<string, SpeakerStats>;
}

export interface MeetingSummary {
  summary: string;
  keyTopics: string[];
  decisions: string[];
  actionItems: ActionItem[];
  openQuestions: string[];
  risks: string[];
  deadlines: Deadline[];
  generatedAt: number;
}

export interface ActionItem {
  task: string;
  owner?: string;
  deadline?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface Deadline {
  date: string;
  description: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface SpeakerStats {
  speakerId: string;
  speakerName: string;
  wordCount: number;
  sentenceCount: number;
  averageTone?: Tone;
  sentimentDistribution: Record<Sentiment, number>;
  toneDistribution: Record<Tone, number>;
  speakingTime: number; // ms
}
