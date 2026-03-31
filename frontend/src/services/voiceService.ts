import { Audio } from 'expo-av';
import axios from 'axios';
import { VoiceCommand } from '../types';
import Constants from 'expo-constants';

class VoiceService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;

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
      const backendUrl = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;
      
      const formData = new FormData();
      formData.append('audio', {
        uri,
        type: 'audio/m4a',
        name: 'voice_command.m4a',
      } as any);

      const response = await axios.post(`${backendUrl}/api/voice/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(apiKey && { 'X-Groq-Key': apiKey }),
        },
      });

      return response.data.text;
    } catch (error) {
      console.error('Failed to transcribe audio:', error);
      return null;
    }
  }

  async parseCommand(text: string, context: string, apiKey?: string): Promise<VoiceCommand | null> {
    try {
      const backendUrl = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;
      
      const response = await axios.post(
        `${backendUrl}/api/voice/parse`,
        { text, context },
        {
          headers: {
            ...(apiKey && { 'X-Groq-Key': apiKey }),
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to parse command:', error);
      return null;
    }
  }
}

export const voiceService = new VoiceService();
