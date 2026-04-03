import { Activity, BackendMode } from '../types';
import { databaseService } from './databaseService';
import { firebaseService } from './firebaseService';
import { useSettingsStore } from '../stores/settingsStore';

const DEFAULT_EMERGENT_API_URL =
  process.env.EXPO_PUBLIC_EMERGENT_API_URL || 'http://localhost:8000';

class ActivityRepository {
  async init(): Promise<void> {
    // Keep local mode first-class and always available.
    await databaseService.init();
  }

  async saveActivity(activity: Activity): Promise<void> {
    const mode = this.getBackendMode();

    if (mode === 'firebase') {
      // Optional local cache for reliability/offline history.
      await databaseService.saveActivity(activity);
      await firebaseService.syncActivity(activity);
      return;
    }

    if (mode === 'emergent') {
      await this.saveToEmergent(activity);
      return;
    }

    await databaseService.saveActivity(activity);
  }

  async getActivities(): Promise<Activity[]> {
    const mode = this.getBackendMode();

    if (mode === 'firebase') {
      const remoteActivities = await firebaseService.getActivities();

      if (remoteActivities.length > 0) {
        return remoteActivities;
      }

      // Optional local cache fallback.
      return databaseService.getActivities();
    }

    if (mode === 'emergent') {
      return this.getFromEmergent();
    }

    return databaseService.getActivities();
  }

  async getActivity(id: string): Promise<Activity | null> {
    const mode = this.getBackendMode();

    if (mode === 'firebase') {
      const localActivity = await databaseService.getActivity(id);
      if (localActivity) {
        return localActivity;
      }

      const remoteActivities = await firebaseService.getActivities();
      return remoteActivities.find((activity) => activity.id === id) ?? null;
    }

    if (mode === 'emergent') {
      return this.getOneFromEmergent(id);
    }

    return databaseService.getActivity(id);
  }

  private getBackendMode(): BackendMode {
    return useSettingsStore.getState().backendMode || 'local';
  }

  private async saveToEmergent(activity: Activity): Promise<void> {
    try {
      const response = await fetch(`${DEFAULT_EMERGENT_API_URL}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activity),
      });

      if (!response.ok) {
        throw new Error(`Emergent save failed (${response.status})`);
      }
    } catch (error) {
      console.error('Failed to save activity to Emergent backend:', error);
      // Preserve local-first behavior as a safety fallback.
      await databaseService.saveActivity(activity);
    }
  }

  private async getFromEmergent(): Promise<Activity[]> {
    try {
      const response = await fetch(`${DEFAULT_EMERGENT_API_URL}/activities`);

      if (!response.ok) {
        throw new Error(`Emergent fetch failed (${response.status})`);
      }

      return (await response.json()) as Activity[];
    } catch (error) {
      console.error('Failed to fetch activities from Emergent backend:', error);
      return databaseService.getActivities();
    }
  }

  private async getOneFromEmergent(id: string): Promise<Activity | null> {
    try {
      const response = await fetch(`${DEFAULT_EMERGENT_API_URL}/activities/${id}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Emergent fetch by id failed (${response.status})`);
      }

      return (await response.json()) as Activity;
    } catch (error) {
      console.error('Failed to fetch activity from Emergent backend:', error);
      return databaseService.getActivity(id);
    }
  }
}

export const activityRepository = new ActivityRepository();
