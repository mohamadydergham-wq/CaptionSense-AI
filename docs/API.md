# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints require an OpenAI API key to be passed in the request headers:

```
Authorization: Bearer sk_...
```

## Endpoints

### POST /api/transcribe

Transcribe audio to text using OpenAI Realtime API.

**Request Body:**
```json
{
  "audio_base64": "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU5LjI3LjEwMAAAAAAAAAAAAAAA//NkwA...",
  "language": "en",
  "speaker_id": "speaker_1"
}
```

**Parameters:**
- `audio_base64` (string, required): Base64-encoded audio data
- `language` (string, required): Language code ('en', 'ar', 'ar-EG')
- `speaker_id` (string, optional): Identifier for the speaker

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "We need to finish before Friday",
    "confidence": 0.95,
    "language": "en",
    "speaker_id": "speaker_1",
    "duration_ms": 2500
  },
  "timestamp": 1627483647000
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid request
- `401`: Unauthorized
- `429`: Rate limited
- `500`: Server error

---

### POST /api/analyze

Analyze text for tone and sentiment.

**Request Body:**
```json
{
  "text": "We need to finish before Friday",
  "speaker_id": "speaker_1"
}
```

**Parameters:**
- `text` (string, required): Text to analyze
- `speaker_id` (string, optional): Speaker identifier

**Response:**
```json
{
  "success": true,
  "data": {
    "tone": {
      "primary": "confident",
      "score": 0.91,
      "alternatives": [
        { "tone": "calm", "score": 0.08 },
        { "tone": "neutral", "score": 0.01 }
      ]
    },
    "sentiment": {
      "type": "neutral",
      "score": 0.5,
      "keywords": ["finish", "Friday"],
      "confidence": 0.92
    }
  },
  "timestamp": 1627483647000
}
```

---

### POST /api/summarize

Generate a meeting summary from transcript entries.

**Request Body:**
```json
{
  "transcript": [
    {
      "id": "entry_1",
      "speaker": "Speaker A",
      "text": "Let's discuss the Q3 roadmap",
      "timestamp": 0,
      "duration": 2000,
      "language": "en",
      "confidence": 0.95
    }
  ],
  "meeting_title": "Q3 Planning"
}
```

**Parameters:**
- `transcript` (array, required): Array of transcript entries
- `meeting_title` (string, optional): Title of the meeting

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Team discussed Q3 roadmap and prioritization. Decision made to focus on feature X. Action items assigned to team members with deadline of end of Q3.",
    "key_topics": [
      "Q3 roadmap",
      "Feature prioritization",
      "Resource allocation"
    ],
    "decisions": [
      "Prioritize feature X",
      "Allocate 3 engineers to project Y"
    ],
    "action_items": [
      {
        "task": "Implement feature X",
        "owner": "Speaker A",
        "deadline": "2024-09-30",
        "priority": "high"
      },
      {
        "task": "Create design specs",
        "owner": "Speaker B",
        "deadline": "2024-09-15",
        "priority": "high"
      }
    ],
    "open_questions": [
      "When should we launch feature X?",
      "How will this affect existing users?"
    ],
    "risks": [
      "Resource constraints may impact timeline",
      "Unknown technical complexity"
    ],
    "deadlines": [
      { "date": "2024-09-15", "description": "Design specs due" },
      { "date": "2024-09-30", "description": "Feature X launch" }
    ]
  },
  "timestamp": 1627483647000
}
```

---

### POST /api/translate

Translate text to target language.

**Request Body:**
```json
{
  "text": "We need to finish before Friday",
  "source_language": "en",
  "target_language": "ar"
}
```

**Parameters:**
- `text` (string, required): Text to translate
- `source_language` (string, required): Source language code
- `target_language` (string, required): Target language code

**Response:**
```json
{
  "success": true,
  "data": {
    "translation": "نحتاج إلى الانتهاء قبل يوم الجمعة",
    "source_language": "en",
    "target_language": "ar",
    "confidence": 0.98
  },
  "timestamp": 1627483647000
}
```

---

### POST /api/export

Export transcript in various formats.

**Request Body:**
```json
{
  "format": "pdf",
  "transcript": [...],
  "include_tone": true,
  "include_sentiment": true,
  "include_summary": true
}
```

**Parameters:**
- `format` (string, required): Export format ('txt', 'md', 'pdf', 'json')
- `transcript` (array, required): Transcript data
- `include_tone` (boolean, optional): Include tone analysis
- `include_sentiment` (boolean, optional): Include sentiment analysis
- `include_summary` (boolean, optional): Include meeting summary

**Response:**
File download with appropriate content-type header.

---

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1627483647000,
  "version": "1.0.0"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Missing required parameter: text",
    "details": {
      "missing_parameter": "text"
    }
  },
  "timestamp": 1627483647000
}
```

**Common Error Codes:**
- `INVALID_REQUEST`: Request validation failed
- `UNAUTHORIZED`: Authentication failed
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error
- `SERVICE_UNAVAILABLE`: External service unavailable

---

## Rate Limiting

API requests are rate limited to 100 requests per minute.

Rate limit headers:
- `X-RateLimit-Limit`: 100
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Webhooks

Optional webhook support for asynchronous processing:

```
POST /api/transcribe?webhook_url=https://example.com/callback
```

Webhook payload:
```json
{
  "event": "transcription.complete",
  "data": { ... },
  "timestamp": 1627483647000
}
```

---

## Examples

### cURL

```bash
curl -X POST http://localhost:3000/api/transcribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_..." \
  -d '{
    "audio_base64": "...",
    "language": "en"
  }'
```

### JavaScript

```javascript
const response = await fetch('http://localhost:3000/api/transcribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk_...',
  },
  body: JSON.stringify({
    audio_base64: audioData,
    language: 'en',
  }),
});

const result = await response.json();
```

### Python

```python
import requests

headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk_...',
}

data = {
    'audio_base64': audio_data,
    'language': 'en',
}

response = requests.post(
    'http://localhost:3000/api/transcribe',
    json=data,
    headers=headers,
)

result = response.json()
```
