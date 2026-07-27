# Architecture Guide

## System Overview

CaptionSense AI is a real-time audio processing and analysis system designed to run as a Chrome Extension with optional cloud backend support.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Chrome Browser                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Video Conferencing Tab                    │   │
│  │         (Google Meet, Teams, Zoom, etc.)                    │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │  Audio Output                                        │   │   │
│  │  │  ▼                                                   │   │   │
│  │  │  Content Script (Audio Capturer)                    │   │   │
│  │  │  • Capture audio stream via tabCapture              │   │   │
│  │  │  • Handle audio processing                          │   │   │
│  │  │  • Send to background worker                        │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  └────────────────┬──────────────────────────────────────────────┘   │
│                   │                                                  │
│                   │ MessagePort                                      │
│                   ▼                                                  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │            Background Service Worker                        │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │  • Route messages                                   │   │   │
│  │  │  • Manage extension state                          │   │   │
│  │  │  • Handle API communication                        │   │   │
│  │  │  • Coordinate services                             │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  └────────┬──────────────────────┬──────────────┬────────────────┘   │
│           │                      │              │                    │
│           ▼                      ▼              ▼                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │    Popup UI      │  │  Overlay Widget  │  │  Storage Layer   │   │
│  │                  │  │                  │  │                  │   │
│  │  • Settings      │  │  • Captions      │  │  • IndexedDB     │   │
│  │  • Transcript    │  │  • Tone Badge    │  │  • Chrome Store  │   │
│  │  • Summary       │  │  • Draggable     │  │  • Local Cache   │   │
│  │  • Export        │  │  • Resizable     │  │  • Session Data  │   │
│  │                  │  │  • Glassmorphic  │  │                  │   │
│  └────────┬─────────┘  └────────┬─────────┘  └──────────────────┘   │
│           │                     │                                    │
│           └─────────────────────┼─────────────────────────────────┐  │
│                                 │ Message Bus                      │  │
│                                 ▼                                  │  │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │               Services Layer (Local Processing)                │ │
│  │                                                                │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────┐ │ │
│  │  │   Audio Service  │  │   AI Services    │  │  Formatting │ │ │
│  │  │                  │  │                  │  │  Services   │ │ │
│  │  │  • Processor     │  │  • Tone Analyzer │  │  • Exporters│ │ │
│  │  │  • Buffer Mgmt   │  │  • Sentiment     │  │  • Formatrs │ │ │
│  │  │  • Stream Hdlr   │  │  • Diarizer      │  │             │ │ │
│  │  │  • Validation    │  │  • Translator    │  │             │ │ │
│  │  └──────────────────┘  └──────────────────┘  └─────────────┘ │ │
│  └──────────────────────┬──────────────────────────────────────────┘ │
│                         │ When Cloud Enabled                         │
│                         ▼                                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Backend Server      │
                  │  (Node.js/Express)   │
                  │                      │
                  │  • API Routes        │
                  │  • OpenAI Integration│
                  │  • Processing        │
                  │  • Caching           │
                  │  • Rate Limiting     │
                  │  • Logging           │
                  └──────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  External Services   │
                  │                      │
                  │  • OpenAI Realtime   │
                  │  • OpenAI GPT        │
                  │  • Other AI Services │
                  └──────────────────────┘
```

## Component Details

### 1. Content Script (`content/content-script.ts`)

**Responsibility**: Audio capture and injection into web pages

**Key Functions**:
- Inject overlay iframe into page
- Capture audio from `tabCapture` API
- Forward audio streams to service worker
- Handle tab lifecycle events

**Communication**: MessagePort bidirectional communication with background worker

### 2. Service Worker (`background/service-worker.ts`)

**Responsibility**: Central coordination hub

**Key Functions**:
- Message routing and dispatch
- Extension state management
- Service instantiation and caching
- API request handling
- Error recovery and retry logic

**Communication**: 
- Receives messages from content scripts
- Forwards to appropriate services
- Sends responses back to UI

### 3. Popup UI (`popup/popup.ts`)

**Responsibility**: Main user interface and controls

**Features**:
- Settings management
- Transcript display
- Search functionality
- Export controls
- Summary display
- Theme switching

**State Management**: Chrome storage sync + IndexedDB for large data

### 4. Overlay Widget (`overlay/overlay.ts`)

**Responsibility**: Floating caption display

**Features**:
- Real-time caption updates
- Tone/sentiment badges
- Draggable positioning
- Resizable dimensions
- Glassmorphic styling
- Always-on-top behavior

**Performance**: DOM optimization, efficient re-renders

### 5. Services Layer

#### Audio Processing (`services/audio/`)

```typescript
AudioProcessor
├── capture() - Get audio stream
├── process() - Apply filters
├── encode() - Convert format
└── validate() - Verify quality

RealtimeTranscriber
├── connect() - Initialize WebSocket
├── transcribe() - Stream audio
├── close() - Cleanup
└── retry() - Reconnect logic

AudioStreamHandler
├── setupStream() - Initialize
├── handleData() - Process chunks
├── handleError() - Error recovery
└── cleanup() - Resource release
```

#### AI Services (`services/ai/`)

```typescript
ToneAnalyzer
├── analyze(text) -> Tone
├── detectEmotions()
├── calculateConfidence()
└── mapToToneCategory()

SentimentAnalyzer
├── analyze(text) -> Sentiment
├── extractKeywords()
├── calculateScore()
└── detectNegation()

Summarizer
├── generateSummary(transcript)
├── extractTopics()
├── identifyDecisions()
├── findActionItems()
└── extractDeadlines()

Translator
├── translate(text, target)
├── detectLanguage()
├── validateSupported()
└── cache() - Translation caching
```

#### Speaker Detection (`services/speaker/`)

```typescript
SpeakerDiarizer
├── initialize() - Setup model
├── diarize(audio) -> Speaker labels
├── identify() - Speaker ID
└── update() - New speakers

SpeakerDetector
├── detectChange() - Speaker change
├── assignID() - Label speakers
├── trackSpeaker() - Maintain state
└── getSpeakerStats() - Statistics
```

#### Transcription Management (`services/transcription/`)

```typescript
TranscriptManager
├── add() - Add entry
├── update() - Update existing
├── get() - Retrieve
├── search() - Full-text search
├── clear() - Reset
└── export() - Export data

TranscriptFormatter
├── toTXT() - Plain text
├── toMarkdown() - Markdown
├── toPDF() - PDF document
├── toJSON() - JSON with metadata
└── format() - Pretty print
```

### 6. Storage Layer (`storage/`)

```typescript
IndexedDB
├── transcripts - Full transcript data
├── sessions - Meeting sessions
├── settings - User configuration
└── cache - Temporary data

ChromeStorage
├── sync - Synced settings
└── local - Local-only data

SessionStore
├── current - Active session
├── history - Past sessions
└── temp - Session temp data
```

### 7. Backend API (`backend/`)

```
GET  /api/health              - Health check
POST /api/transcribe          - Audio transcription
POST /api/analyze             - Tone/Sentiment analysis
POST /api/summarize           - Meeting summarization
POST /api/translate           - Text translation
POST /api/export              - Transcript export
GET  /api/settings            - Fetch settings
POST /api/settings            - Save settings
GET  /api/history             - Meeting history
DELETE /api/session/:id       - Delete session
```

## Data Flow

### Real-Time Transcription Flow

```
1. User joins video call
   ↓
2. Content script captures audio via tabCapture
   ↓
3. Audio chunks forwarded to service worker
   ↓
4. Service worker routes to RealtimeTranscriber
   ↓
5. Audio streamed to OpenAI Realtime API (< 100ms latency)
   ↓
6. Transcribed text received
   ↓
7. Text forwarded to AI services for analysis
   ├─→ ToneAnalyzer (parallel)
   ├─→ SentimentAnalyzer (parallel)
   └─→ SpeakerDetector (parallel)
   ↓
8. Results aggregated and formatted
   ↓
9. UI updated via message bus
   ├─→ Overlay widget (captions)
   ├─→ Popup (transcript)
   └─→ Storage (persistence)
   ↓
10. Stored in IndexedDB for search/export
```

### Meeting Summary Generation Flow

```
1. Call ends or user requests summary
   ↓
2. Complete transcript retrieved from storage
   ↓
3. Service worker sends to backend (if enabled)
   ↓
4. Backend processes with OpenAI GPT
   ├─→ Generates summary
   ├─→ Extracts key topics
   ├─→ Identifies decisions
   ├─→ Finds action items
   ├─→ Extracts deadlines
   └─→ Identifies risks
   ↓
5. Results formatted and returned
   ↓
6. Summary displayed in popup
   ↓
7. Stored with transcript session
```

## Message Bus Architecture

```typescript
interface Message {
  type: string;          // e.g., 'transcription.update'
  payload: unknown;      // Data
  priority?: 'high' | 'normal' | 'low';
  timestamp: number;     // When sent
}

Message Types:
- audio.capture_started
- audio.capture_stopped
- transcription.chunk_received
- transcription.complete
- tone.detected
- sentiment.analyzed
- speaker.changed
- summary.generated
- export.requested
- settings.changed
- theme.changed
- error.occurred
```

## State Management

### Global State

```typescript
interface ExtensionState {
  // Current session
  currentSession?: Session;
  
  // Recording state
  isRecording: boolean;
  isPaused: boolean;
  
  // UI state
  theme: 'light' | 'dark' | 'auto';
  uiVisible: boolean;
  
  // Processing state
  isProcessing: boolean;
  lastUpdate: number;
  
  // Settings
  settings: Settings;
  
  // Error state
  lastError?: ExtensionError;
}
```

## Error Handling Strategy

```typescript
Error Categories:

1. Audio Capture Errors
   - Permission denied → Show permission dialog
   - Device not available → Fallback message
   - Stream interrupted → Auto-reconnect

2. API Errors
   - Network timeout → Retry with exponential backoff
   - Rate limit → Queue and retry
   - Invalid API key → Show configuration dialog
   - API down → Queue locally, retry later

3. Processing Errors
   - Invalid audio format → Re-encode
   - Analysis failure → Use fallback model
   - Storage error → Use in-memory fallback

4. UI Errors
   - Render failure → Graceful degradation
   - DOM manipulation error → Try again with delay
```

## Performance Optimizations

### Memory Management

1. **Audio Buffer Pooling**
   - Reuse buffers instead of allocating new ones
   - Limit buffer size based on sample rate
   - Clear buffers when not needed

2. **Service Caching**
   - Singleton pattern for heavy services
   - Cache translations and analyses
   - Cleanup on service stop

3. **DOM Optimization**
   - Virtual scrolling for long transcripts
   - Debounce DOM updates
   - Use CSS transforms for animations

### Network Optimization

1. **Streaming Responses**
   - Stream large exports instead of buffering
   - Use Server-Sent Events for updates
   - Compress API responses

2. **Caching Strategy**
   - Cache static assets in service worker
   - Cache API responses with TTL
   - Invalidate on updates

3. **Lazy Loading**
   - Load overlay only when needed
   - Load settings on demand
   - Defer heavy computations

## Security Architecture

### Data Security

1. **Local Storage**
   - Encrypted at rest using crypto-js
   - Automatic cleanup on logout
   - Secure session tokens

2. **API Communication**
   - HTTPS only
   - Request signing
   - CORS validation

3. **Extension Permissions**
   - Minimal required permissions
   - Runtime permission requests
   - User consent tracking

### Privacy Controls

1. **Data Retention**
   - User-configurable retention policy
   - Automatic deletion after period
   - Manual deletion option

2. **Cloud Processing**
   - Explicit user opt-in
   - Clear notification when enabled
   - Never store audio permanently

3. **Analytics**
   - No tracking by default
   - Optional anonymous analytics
   - User can disable anytime

## Testing Strategy

### Unit Tests
- Service methods (50+ tests)
- Utility functions (40+ tests)
- Data formatters (30+ tests)

### Integration Tests
- Message bus communication
- Service interactions
- Storage operations

### E2E Tests
- Full recording workflow
- UI interactions
- Export functionality

### Performance Tests
- Memory usage profiling
- Audio processing latency
- UI render performance

## Deployment Architecture

### Development Environment
```
Local Machine
├── Chrome Extension (load unpacked)
├── Backend Server (localhost:3000)
└── IndexedDB (local storage)
```

### Production Environment
```
Chrome Web Store
├── Extension Package
├── Service Worker
└── (Optional) Cloud Backend
    ├── Load Balancer
    ├── API Servers
    ├── Database
    └── Cache Layer
```

## Future Enhancements

1. **Real-time Collaboration**
   - Share transcripts with attendees
   - Collaborative note-taking
   - Real-time meeting updates

2. **Advanced ML Models**
   - Custom emotion detection
   - Advanced NLP for summaries
   - Speaker identification ML

3. **Integration APIs**
   - Calendar integration
   - Email/Slack notifications
   - CRM integration

4. **Mobile Support**
   - Mobile app version
   - Cross-device sync
   - Offline support
