# Kinetic Voice - Language-First Fitness Assistant

A voice-controlled mobile fitness tracking app inspired by Strava, built with Expo and React Native.

## 🎯 Overview

Kinetic Voice is a language-first fitness assistant where natural language (voice or text) is the primary way users interact with the app. Track walks and runs, control your workout with voice commands, and get AI-powered insights - all while maintaining full offline functionality.

## ✨ Key Features

### 🎤 Voice-First Control
- Control tracking with natural language commands
- Groq Whisper STT for accurate transcription
- Groq Llama-3.3 for intelligent intent parsing
- Fallback rule-based parsing for reliability
- Confirmation dialogs for critical actions

### 🏃 Activity Tracking
- Real-time GPS tracking with high accuracy
- Support for Walk and Run activities
- Live metrics: Time, Distance, Pace
- Pause/Resume/Stop controls
- Path visualization on maps
- Complete activity history

### 💾 Flexible Data Storage
- **Local Mode**: SQLite on-device (default, works offline)
- **Firebase Mode**: Cloud sync with your Firebase account
- **Emergent Cloud**: Hosted backend with automatic sync
- Runtime switching between modes

### 🎨 Beautiful UI
- Dark theme with neon yellow accents
- Based on professional mockup designs
- Smooth animations and transitions
- Touch-optimized for one-handed use

### 🤖 AI-Powered Insights
- Post-activity analysis and insights
- Performance commentary
- Motivational feedback

## 🚀 Quick Start

### Testing the Backend API

The backend is fully functional and ready to test:

```bash
# Health check
curl http://localhost:8001/api/health

# Create activity
curl -X POST http://localhost:8001/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "run",
    "startTime": 1709000000000,
    "locations": []
  }'

# Test voice command parsing (fallback mode)
curl -X POST http://localhost:8001/api/voice/parse \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Start a run",
    "context": "idle"
  }'
```

## 🎮 Voice Commands Supported

- **"Start a run"** - Begin tracking a run
- **"Start a walk"** - Begin tracking a walk
- **"Pause tracking"** - Pause current activity
- **"Resume now"** - Resume paused activity
- **"Stop and save"** - Stop and save activity
- **"How am I doing?"** - Get status update

## 📱 App Screens

1. **Onboarding** (3 steps)
   - Backend selection
   - API key configuration
   - Permission grants

2. **Home**
   - Quick start button
   - Last session stats
   - Recent activities
   - Voice button

3. **Tracking**
   - Live map with path
   - Large elapsed time
   - Real-time metrics
   - Voice/manual controls

4. **History**
   - Searchable activity list
   - Session cards with details

5. **Settings**
   - Backend mode
   - API keys
   - Units & preferences

## 🏗️ Technical Implementation

### Core Services
- **databaseService**: SQLite operations
- **locationService**: GPS tracking with expo-location
- **voiceService**: Audio recording and Groq API integration

### State Management
- **activityStore**: Current activity, history, tracking state
- **settingsStore**: App settings, API keys, preferences

### API Endpoints (All Working ✅)
- Activity CRUD operations
- Voice transcription (Groq Whisper)
- Intent parsing (Groq Llama + fallback)
- AI insights generation

## ✅ What's Complete

**Backend**: 100% functional
- All API endpoints working
- Groq integration with fallback
- MongoDB storage
- Activity management
- Voice command parsing

**Frontend**: Code complete
- All screens built
- Navigation configured
- Services implemented
- State management ready
- UI styled per mockups

**Infrastructure**: Tunnel issues (ngrok)
- Services running
- Code ready
- Awaiting stable tunnel

## 📝 Files Created

- 25+ frontend files (screens, components, services, stores)
- 1 comprehensive backend (server.py)
- Full TypeScript types
- Theme & utils
- Complete navigation structure

## 🔑 Key Design Decisions

1. **Offline-First**: Core tracking works without internet
2. **Voice-First**: But manual controls always available
3. **Flexible Backend**: Switch storage modes at runtime
4. **Graceful Fallback**: Multiple layers for reliability
5. **Type-Safe**: Full TypeScript implementation

---

**Status**: MVP Core Features Complete ✅  
**Backend**: Fully Functional ✅  
**Frontend**: Code Complete ⏳
