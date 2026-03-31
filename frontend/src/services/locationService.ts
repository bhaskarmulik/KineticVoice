import * as Location from 'expo-location';
import { Location as LocationType } from '../types';

class LocationService {
  private watchSubscription: Location.LocationSubscription | null = null;
  private onLocationUpdate: ((location: LocationType) => void) | null = null;

  async requestPermissions(): Promise<boolean> {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      return false;
    }

    // Request background location permission
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    return backgroundStatus === 'granted' || foregroundStatus === 'granted';
  }

  async checkPermissions(): Promise<boolean> {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  }

  async getCurrentLocation(): Promise<LocationType | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
        accuracy: location.coords.accuracy || undefined,
      };
    } catch (error) {
      console.error('Failed to get current location:', error);
      return null;
    }
  }

  async startTracking(callback: (location: LocationType) => void): Promise<void> {
    this.onLocationUpdate = callback;

    try {
      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000, // 5 seconds
          distanceInterval: 10, // 10 meters
        },
        (location) => {
          if (this.onLocationUpdate) {
            this.onLocationUpdate({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: location.timestamp,
              accuracy: location.coords.accuracy || undefined,
            });
          }
        }
      );
    } catch (error) {
      console.error('Failed to start location tracking:', error);
    }
  }

  stopTracking(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }
    this.onLocationUpdate = null;
  }
}

export const locationService = new LocationService();
