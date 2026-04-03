import { create } from 'zustand';
import { Activity, ActivityType, Location } from '../types';

interface ActivityState {
  currentActivity: Activity | null;
  activities: Activity[];
  isTracking: boolean;
  
  startActivity: (type: ActivityType) => void;
  pauseActivity: () => void;
  resumeActivity: () => void;
  stopActivity: () => Promise<void>;
  updateLocation: (location: Location) => void;
  updateDuration: (duration: number) => void;
  loadActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  currentActivity: null,
  activities: [],
  isTracking: false,

  startActivity: (type: ActivityType) => {
    const now = Date.now();
    const activity: Activity = {
      id: `activity_${now}`,
      type,
      status: 'active',
      startTime: now,
      duration: 0,
      distance: 0,
      locations: [],
      createdAt: now,
    };
    set({ currentActivity: activity, isTracking: true });
  },

  pauseActivity: () => {
    const { currentActivity } = get();
    if (currentActivity && currentActivity.status === 'active') {
      set({
        currentActivity: { ...currentActivity, status: 'paused' },
        isTracking: false,
      });
    }
  },

  resumeActivity: () => {
    const { currentActivity } = get();
    if (currentActivity && currentActivity.status === 'paused') {
      set({
        currentActivity: { ...currentActivity, status: 'active' },
        isTracking: true,
      });
    }
  },

  stopActivity: async () => {
    const { currentActivity, activities } = get();
    if (currentActivity) {
      const completedActivity: Activity = {
        ...currentActivity,
        status: 'completed',
        endTime: Date.now(),
      };
      set({
        currentActivity: null,
        isTracking: false,
        activities: [completedActivity, ...activities],
      });
    }
  },

  updateLocation: (location: Location) => {
    const { currentActivity } = get();
    if (currentActivity && currentActivity.status === 'active') {
      const locations = [...currentActivity.locations, location];
      let distance = currentActivity.distance;
      
      // Calculate distance using Haversine formula
      if (locations.length > 1) {
        const prevLoc = locations[locations.length - 2];
        distance += calculateDistance(
          prevLoc.latitude,
          prevLoc.longitude,
          location.latitude,
          location.longitude
        );
      }

      set({
        currentActivity: {
          ...currentActivity,
          locations,
          distance,
        },
      });
    }
  },

  updateDuration: (duration: number) => {
    const { currentActivity } = get();
    if (currentActivity) {
      const avgPace = duration > 0 && currentActivity.distance > 0
        ? (duration / 60) / (currentActivity.distance / 1000)
        : undefined;
      
      set({
        currentActivity: {
          ...currentActivity,
          duration,
          avgPace,
        },
      });
    }
  },

  loadActivities: (activities: Activity[]) => {
    set({ activities });
  },

  addActivity: (activity: Activity) => {
    set((state) => ({
      activities: [activity, ...state.activities],
    }));
  },
}));

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
