import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { VoiceCommand } from '../types';

// Groq API configuration
const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const DEFAULT_GROQ_KEY = 'sk-emergent-94c85C89dDcC5A91fF'; // Emergent fallback key

class VoiceService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private groqApiKey: string = DEFAULT_GROQ_KEY;

  setGroqApiKey(key: string) {
    this.groqApiKey = key || DEFAULT_GROQ_KEY;
  }

  async requestPermissions(): Promise<boolean> {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  }

  async startRecording(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isRecording = true;
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }

  async stopRecording(): Promise<string | null> {
    if (!this.recording || !this.isRecording) return null;

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      this.isRecording = false;
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      return null;
    }
  }

  async transcribeAudio(uri: string, apiKey?: string): Promise<string | null> {
    try {
      const key = apiKey || this.groqApiKey;
      
      // Read audio file
      const audioData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create FormData for Groq API
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'audio/m4a',
        name: 'audio.m4a',
      } as any);
      formData.append('model', 'whisper-large-v3');
      formData.append('response_format', 'text');

      const response = await fetch(`${GROQ_API_BASE}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const text = await response.text();
      return text;
    } catch (error) {
      console.error('Failed to transcribe audio:', error);
      // Fallback to empty string
      return null;
    }
  }

  async parseCommand(text: string, context: string, apiKey?: string): Promise<VoiceCommand | null> {
    try {
      const key = apiKey || this.groqApiKey;

      const systemPrompt = `You are a fitness tracking assistant. Parse voice commands and extract the intent.
        
Valid intents:
- START_ACTIVITY: User wants to start tracking (walk or run)
- PAUSE_ACTIVITY: User wants to pause current tracking
- RESUME_ACTIVITY: User wants to resume paused tracking
- STOP_ACTIVITY: User wants to stop and save activity
- QUERY_STATUS: User is asking about their current progress
- MARK_SEGMENT: User wants to mark a specific segment (sprint, hill, etc.)
- UNKNOWN: Cannot determine intent

Respond with JSON only in this format:
{
  "intent": "INTENT_NAME",
  "confidence": 0.95,
  "data": {"activityType": "run"}
}

Current context: ${context}`;

      const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          temperature: 0.3,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        console.warn('Groq API failed, using fallback parsing');
        return this.parseCommandFallback(text);
      }

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);

      return {
        text,
        intent: parsed.intent || 'UNKNOWN',
        confidence: parsed.confidence || 0.0,
        data: parsed.data,
      };
    } catch (error) {
      console.error('Failed to parse command with AI:', error);
      // Fallback to rule-based parsing
      return this.parseCommandFallback(text);
    }
  }

  private parseCommandFallback(text: string): VoiceCommand {
    const textLower = text.toLowerCase();

    if (textLower.includes('start') || textLower.includes('begin') || textLower.includes('go')) {
      const activityType = textLower.includes('run') ? 'run' : 'walk';
      return {
        text,
        intent: 'START_ACTIVITY',
        confidence: 0.8,
        data: { activityType },
      };
    } else if (textLower.includes('pause') || textLower.includes('hold') || textLower.includes('wait')) {
      return {
        text,
        intent: 'PAUSE_ACTIVITY',
        confidence: 0.9,
        data: null,
      };
    } else if (textLower.includes('resume') || textLower.includes('continue') || textLower.includes('restart')) {
      return {
        text,
        intent: 'RESUME_ACTIVITY',
        confidence: 0.9,
        data: null,
      };
    } else if (textLower.includes('stop') || textLower.includes('finish') || textLower.includes('done') || textLower.includes('end')) {
      return {
        text,
        intent: 'STOP_ACTIVITY',
        confidence: 0.9,
        data: null,
      };
    } else if (textLower.includes('how') || textLower.includes('status') || textLower.includes('progress') || textLower.includes('doing')) {
      return {
        text,
        intent: 'QUERY_STATUS',
        confidence: 0.7,
        data: null,
      };
    } else {
      return {
        text,
        intent: 'UNKNOWN',
        confidence: 0.3,
        data: null,
      };
    }
  }

  async generateInsight(activity: any, apiKey?: string): Promise<string | null> {
    try {
      const key = apiKey || this.groqApiKey;
      const distanceKm = activity.distance / 1000;
      const durationMin = activity.duration / 60;
      const pace = activity.avgPace || 0;

      const prompt = `Analyze this fitness activity and provide a brief, motivating insight:

Activity Type: ${activity.type}
Distance: ${distanceKm.toFixed(2)} km
Duration: ${durationMin.toFixed(1)} minutes
Average Pace: ${pace.toFixed(2)} min/km

Provide a 2-3 sentence insight that is encouraging and highlights performance.`;

      const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are a supportive fitness coach.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Failed to generate insight:', error);
      return null;
    }
  }
}

export const voiceService = new VoiceService();
