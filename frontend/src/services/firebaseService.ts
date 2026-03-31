// Optional Firebase service - only used if user provides config
import { storage } from '../utils/storage';
import { Activity } from '../types';

interface FirebaseConfig {
  apiKey: string;
  projectId: string;
  storageBucket?: string;
  appId?: string;
}

class FirebaseService {
  private config: FirebaseConfig | null = null;
  private enabled: boolean = false;

  async initialize(config: FirebaseConfig): Promise<void> {
    this.config = config;
    this.enabled = true;
    // Store config for future use
    await storage.setItem('firebase_config', JSON.stringify(config));
  }

  async loadConfig(): Promise<void> {
    try {
      const stored = await storage.getItem('firebase_config');
      if (stored) {
        this.config = JSON.parse(stored);
        this.enabled = true;
      }
    } catch (error) {
      console.error('Failed to load Firebase config:', error);
    }
  }

  isEnabled(): boolean {
    return this.enabled && this.config !== null;
  }

  async syncActivity(activity: Activity): Promise<void> {
    if (!this.isEnabled() || !this.config) {
      console.log('Firebase not configured, skipping sync');
      return;
    }

    try {
      // Use Firebase REST API for simplicity
      const url = `https://firestore.googleapis.com/v1/projects/${this.config.projectId}/databases/(default)/documents/activities/${activity.id}`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            type: { stringValue: activity.type },
            status: { stringValue: activity.status },
            startTime: { integerValue: activity.startTime.toString() },
            duration: { integerValue: activity.duration.toString() },
            distance: { doubleValue: activity.distance },
            createdAt: { integerValue: activity.createdAt.toString() },
          },
        }),
      });

      if (response.ok) {
        console.log('Activity synced to Firebase');
      }
    } catch (error) {
      console.error('Failed to sync to Firebase:', error);
      // Don't throw - Firebase is optional
    }
  }

  async getActivities(): Promise<Activity[]> {
    if (!this.isEnabled() || !this.config) {
      return [];
    }

    try {
      const url = `https://firestore.googleapis.com/v1/projects/${this.config.projectId}/databases/(default)/documents/activities`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      // Parse Firebase REST API response
      return data.documents?.map((doc: any) => ({
        id: doc.name.split('/').pop(),
        type: doc.fields.type?.stringValue,
        status: doc.fields.status?.stringValue,
        startTime: parseInt(doc.fields.startTime?.integerValue || '0'),
        duration: parseInt(doc.fields.duration?.integerValue || '0'),
        distance: parseFloat(doc.fields.distance?.doubleValue || '0'),
        locations: [],
        createdAt: parseInt(doc.fields.createdAt?.integerValue || '0'),
      })) || [];
    } catch (error) {
      console.error('Failed to get activities from Firebase:', error);
      return [];
    }
  }
}

export const firebaseService = new FirebaseService();