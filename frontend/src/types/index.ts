export type ActivityType = 'walk' | 'run';

export type ActivityStatus = 'idle' | 'active' | 'paused' | 'completed';

export type BackendMode = 'local' | 'firebase' | 'emergent';

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

export interface Activity {
  id: string;
  type: ActivityType;
  status: ActivityStatus;
  name?: string;
  startTime: number;
  endTime?: number;
  duration: number; // seconds
  distance: number; // meters
  avgPace?: number; // min/km
  locations: Location[];
  aiInsight?: string;
  createdAt: number;
}

export interface AppSettings {
  backendMode: BackendMode;
  groqApiKey?: string;
  firebaseConfig?: any;
  units: 'metric' | 'imperial';
  onboardingComplete: boolean;
  voiceEnabled: boolean;
}

export interface VoiceCommand {
  text: string;
  intent: string;
  confidence: number;
  data?: any;
}
