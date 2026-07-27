# CaptionSense AI - Production-Ready Chrome Extension

**Live captions with real-time tone detection, sentiment analysis, and speaker identification for video calls.**

A production-grade Chrome Extension that captures audio from video meetings (Google Meet, Microsoft Teams, Zoom) and provides:
- Real-time speech-to-text transcription (< 1s latency)
- Live tone detection (9 emotional states)
- Sentiment analysis (positive/negative/neutral)
- Speaker identification
- Multi-language support (Arabic, Egyptian Arabic, English)
- Live translation (Arabic, English, French, Spanish)
- Meeting summarization with key topics and action items
- Transcript export (TXT, Markdown, PDF, JSON)
- Privacy-first architecture (local processing when possible)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Chrome/Chromium browser
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mohamadydergham-wq/CaptionSense-AI.git
   cd CaptionSense-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   OPENAI_API_KEY=sk_...
   BACKEND_URL=http://localhost:3000
   ```

4. **Build the extension**
   ```bash
   npm run build
   ```

5. **Load into Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## 📋 Features

### 1. Live Speech Recognition
- Real-time audio capture from browser tabs
- < 1 second latency using OpenAI Realtime API
- Support for:
  - English
  - Arabic
  - Egyptian Arabic
- Automatic language detection and switching

### 2. Live Caption Overlay
- Floating, draggable subtitle widget
- Resizable and customizable
- Adjustable font size and opacity
- Dark/Light theme support
- Word-by-word updates for real-time feel
- Always-on-top positioning
- Auto-scrolling transcript

### 3. Tone Detection
Classifies speaker emotion into:
- 😌 Calm
- 😊 Happy
- 😐 Neutral
- 🤩 Excited
- 😠 Angry
- 😤 Frustrated
- 💪 Confident
- 😰 Nervous
- 😢 Sad

Each with confidence scores (0-100%)

### 4. Sentiment Analysis
For every message:
- Positive/Negative/Neutral classification
- Confidence score
- Keyword extraction
- Historical trend tracking

### 5. Speaker Detection
- Automatic speaker diarization (when available)
- Speaker labels (Speaker A, Speaker B, etc.)
- Fallback to "Unknown Speaker"
- Speaker statistics in summary

### 6. Live Translation
- Toggle translation on/off
- Supported languages:
  - Arabic
  - English
  - French
  - Spanish
- Side-by-side original and translation display

### 7. Smart Summary
Automatic generation of:
- Meeting summary
- Key topics discussed
- Important decisions made
- Action items with owners
- Open questions
- Identified risks
- Deadlines mentioned

### 8. Search
- Instant full-text search in transcript
- Highlight matching terms
- Jump to relevant sections
- Search by speaker, tone, or sentiment

### 9. Transcript Management
- Local storage with auto-save
- Export to:
  - Plain text (.txt)
  - Markdown (.md)
  - PDF with formatting
  - JSON with metadata
- Copy to clipboard
- Share via link

### 10. Settings
- Language selection (UI + transcription)
- Caption styling (size, color, font)
- Theme selection (dark/light/auto)
- Opacity adjustment
- Auto-save configuration
- Toggle features on/off
- Keyboard shortcuts customization
- Privacy settings

### 11. Privacy & Security
- Local processing for all features by default
- Cloud processing optional and explicitly enabled
- No permanent audio storage
- No data tracking
- Open-source and auditable
- Compliant with GDPR and CCPA

## 📁 Project Structure

```
caption-sense-ai/
├── src/
│   ├── popup/                 # Main UI popup
│   │   ├── popup.ts
│   │   ├── popup.html
│   │   └── styles/
│   │       ├── popup.css
│   │       ├── components.css
│   │       └── theme.css
│   ├── background/            # Service worker
│   │   ├── service-worker.ts
│   │   └── listeners.ts
│   ├── content/               # Content script
│   │   ├── content-script.ts
│   │   ├── audio-capturer.ts
│   │   └── injector.ts
│   ├── overlay/               # Floating caption widget
│   │   ├── overlay.ts
│   │   ├── overlay.html
│   │   ├── styles/
│   │   │   ├── overlay.css
│   │   │   ├── animations.css
│   │   │   └── glassmorphism.css
│   │   └── components/
│   │       ├── caption-display.ts
│   │       ├── tone-badge.ts
│   │       └── sentiment-indicator.ts
│   ├── services/              # Business logic
│   │   ├── audio/
│   │   │   ├── audio-processor.ts
│   │   │   ├── realtime-transcriber.ts
│   │   │   └── audio-stream-handler.ts
│   │   ├── ai/
│   │   │   ├── tone-analyzer.ts
│   │   │   ├── sentiment-analyzer.ts
│   │   │   ├── summarizer.ts
│   │   │   └── translator.ts
│   │   ├── speaker/
│   │   │   ├── speaker-diarizer.ts
│   │   │   └── speaker-detector.ts
│   │   ├── transcription/
│   │   │   ├── transcript-manager.ts
│   │   │   └── transcript-formatter.ts
│   │   └── api/
│   │       └── api-client.ts
│   ├── storage/               # Data persistence
│   │   ├── indexed-db.ts
│   │   ├── chrome-storage.ts
│   │   └── session-store.ts
│   ├── hooks/                 # Custom React-like hooks
│   │   ├── use-transcript.ts
│   │   ├── use-settings.ts
│   │   ├── use-audio.ts
│   │   └── use-theme.ts
│   ├── shared/                # Shared utilities
│   │   ├── logger.ts
│   ���   ├── error-handler.ts
│   │   ├── retry-logic.ts
│   │   └── message-bus.ts
│   ├── types/                 # TypeScript types
│   │   ├── audio.ts
│   │   ├── transcript.ts
│   │   ├── sentiment.ts
│   │   ├── tone.ts
│   │   ├── settings.ts
│   │   └── api.ts
│   ├── constants/             # App constants
│   │   ├── languages.ts
│   │   ├── tones.ts
│   │   ├── api-endpoints.ts
│   │   └── defaults.ts
│   ├── utils/                 # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── converters.ts
│   │   └── helpers.ts
│   ├── backend/               # Express server
│   │   ├── server.ts
│   │   ├── routes/
│   │   │   ├── transcribe.ts
│   │   │   ├── analyze.ts
│   │   │   ├── summarize.ts
│   │   │   ├── translate.ts
│   │   │   └── export.ts
│   │   ├── controllers/
│   │   │   ├── transcription.ts
│   │   │   ├── analysis.ts
│   │   │   ├── summarization.ts
│   │   │   ├── translation.ts
│   │   │   └── export.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── error-handler.ts
│   │   │   ├── rate-limit.ts
│   │   │   └── logging.ts
│   │   ├── services/
│   │   │   ├── openai-service.ts
│   │   │   ├── analysis-service.ts
│   │   │   └── export-service.ts
│   │   └── utils/
│   │       ├── validators.ts
│   │       └── helpers.ts
│   └── assets/                # Static assets
│       ├── icons/
│       │   ├── icon-16.png
│       │   ├── icon-48.png
│       │   └── icon-128.png
│       └── fonts/
├── dist/                      # Build output
├── tests/                     # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEVELOPMENT.md
│   ├── DEPLOYMENT.md
│   └── TESTING.md
├── .env.example
├── .eslintrc.json
├── .prettierrc.json
├── tsconfig.json
├── webpack.config.js
├── jest.config.js
├── package.json
├── manifest.json
└── README.md
```

## 🛠️ Development

### Development Setup

```bash
# Install dependencies
npm install

# Start development build (watch mode)
npm run dev

# Start backend server
npm run backend:dev

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Type checking
npm run type-check
```

### Running the Extension

1. Build the extension:
   ```bash
   npm run build
   ```

2. Load into Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder

3. Click the extension icon to open the popup

## 📚 Documentation

- **[Architecture Guide](docs/ARCHITECTURE.md)** - System design and data flow
- **[API Documentation](docs/API.md)** - Backend API endpoints and specifications
- **[Development Guide](docs/DEVELOPMENT.md)** - Getting started with development
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Testing Strategy](docs/TESTING.md)** - Testing approach and coverage

## 🔌 API Endpoints

### POST /api/transcribe
Transcribe audio to text

**Request:**
```json
{
  "audio_base64": "...",
  "language": "en",
  "speaker_id": "speaker_1"
}
```

**Response:**
```json
{
  "text": "We need to finish before Friday",
  "confidence": 0.95,
  "language": "en",
  "speaker_id": "speaker_1",
  "duration_ms": 2500
}
```

### POST /api/analyze
Analyze tone and sentiment

**Request:**
```json
{
  "text": "We need to finish before Friday",
  "speaker_id": "speaker_1"
}
```

**Response:**
```json
{
  "tone": {
    "primary": "confident",
    "score": 0.91,
    "alternatives": [
      { "tone": "calm", "score": 0.08 }
    ]
  },
  "sentiment": {
    "type": "neutral",
    "score": 0.5,
    "keywords": ["finish", "Friday"]
  }
}
```

### POST /api/summarize
Generate meeting summary

**Request:**
```json
{
  "transcript": [
    {
      "speaker": "Speaker A",
      "text": "Let's discuss the Q3 roadmap",
      "timestamp": 0
    }
  ],
  "meeting_title": "Q3 Planning"
}
```

**Response:**
```json
{
  "summary": "Team discussed Q3 roadmap",
  "key_topics": ["Q3 planning", "roadmap"],
  "decisions": ["Prioritize feature X"],
  "action_items": [
    {
      "task": "Implement feature X",
      "owner": "Speaker A",
      "deadline": "2024-09-30"
    }
  ],
  "open_questions": ["When to launch?"],
  "risks": ["Resource constraints"],
  "deadlines": ["2024-09-30"]
}
```

### POST /api/translate
Translate text

**Request:**
```json
{
  "text": "We need to finish before Friday",
  "source_language": "en",
  "target_language": "ar"
}
```

**Response:**
```json
{
  "translation": "نحتاج إلى الانتهاء قبل يوم الجمعة",
  "source_language": "en",
  "target_language": "ar",
  "confidence": 0.98
}
```

### POST /api/export
Export transcript

**Request:**
```json
{
  "format": "pdf",
  "transcript": [...],
  "include_tone": true,
  "include_sentiment": true,
  "include_summary": true
}
```

**Response:**
File download with appropriate headers

## 🔐 Security & Privacy

- **Local-First**: All processing happens locally by default
- **No Tracking**: No analytics or user tracking
- **No Storage**: Audio is never stored permanently
- **Open Source**: Code is auditable and transparent
- **Encryption**: Sensitive data encrypted at rest
- **GDPR Compliant**: Respects user privacy rights

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- audio-processor.test.ts

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Target coverage:
- Statements: 70%+
- Branches: 70%+
- Functions: 70%+
- Lines: 70%+

## 📦 Build & Deployment

### Development Build
```bash
npm run build
```

### Production Build
```bash
npm run build:webpack
```

### Backend Deployment

See [Deployment Guide](docs/DEPLOYMENT.md) for:
- Docker containerization
- Kubernetes deployment
- Environment configuration
- Scaling strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- TypeScript for all code
- ESLint configuration enforced
- Prettier for formatting
- No `any` types
- Full type coverage
- Meaningful variable names
- SOLID principles

## 📝 License

MIT License - see LICENSE file for details

## 👥 Team

**CaptionSense AI Development Team**

## 📞 Support

For issues, questions, or suggestions:
- Open an [issue on GitHub](https://github.com/mohamadydergham-wq/CaptionSense-AI/issues)
- Check [documentation](docs/) first
- Review [FAQ](docs/ARCHITECTURE.md#faq)

## 🎯 Roadmap

- [x] Live speech recognition
- [x] Tone detection
- [x] Sentiment analysis
- [x] Live caption overlay
- [x] Multi-language support
- [ ] Advanced speaker diarization
- [ ] Real-time translation improvements
- [ ] Meeting integration APIs
- [ ] Custom vocabulary support
- [ ] Advanced search and filtering

## ⭐ Acknowledgments

- OpenAI for Realtime API
- Chrome Extension team
- Open source community

---

**Built with ❤️ for better meetings**
