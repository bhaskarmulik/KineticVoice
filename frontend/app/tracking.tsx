import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { colors, spacing, borderRadius, typography } from '../src/utils/theme';
import { MetricCard } from '../src/components/MetricCard';
import { VoiceConfirmationModal } from '../src/components/VoiceConfirmationModal';
import { useActivityStore } from '../src/stores/activityStore';
import { locationService } from '../src/services/locationService';
import { voiceService } from '../src/services/voiceService';
import { databaseService } from '../src/services/databaseService';
import { formatDuration, formatDistance, formatPace } from '../src/utils/formatting';
import { ActivityType } from '../src/types';

const { height } = Dimensions.get('window');

export default function TrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const activityType = (params.type as ActivityType) || 'walk';

  const {
    currentActivity,
    isTracking,
    startActivity,
    pauseActivity,
    resumeActivity,
    stopActivity,
    updateLocation,
    updateDuration,
  } = useActivityStore();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');
  const [voiceAction, setVoiceAction] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // Start activity when screen loads
    if (!currentActivity) {
      startActivity(activityType);
      startLocationTracking();
    }

    return () => {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      locationService.stopTracking();
    };
  }, []);

  useEffect(() => {
    // Timer logic
    if (isTracking) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1;
          updateDuration(newTime);
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTracking]);

  const startLocationTracking = async () => {
    await locationService.startTracking((location) => {
      updateLocation(location);
      
      // Center map on current location
      if (mapRef.current) {
        mapRef.current.animateCamera({
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          zoom: 16,
        });
      }
    });
  };

  const handlePause = () => {
    pauseActivity();
  };

  const handleResume = () => {
    resumeActivity();
  };

  const handleStop = () => {
    Alert.alert(
      'Stop Activity',
      'Are you sure you want to stop and save this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop & Save',
          style: 'destructive',
          onPress: async () => {
            await stopActivity();
            locationService.stopTracking();
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            
            // Save to database
            if (currentActivity) {
              await databaseService.saveActivity({
                ...currentActivity,
                status: 'completed',
                endTime: Date.now(),
              });
            }

            router.back();
          },
        },
      ]
    );
  };

  const handleVoicePress = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      const audioUri = await voiceService.stopRecording();
      
      if (audioUri) {
        // Transcribe and parse command
        // For now, show a demo modal
        setVoiceCommand('Pause tracking');
        setVoiceAction('Tracking paused...');
        setShowVoiceModal(true);
      }
    } else {
      // Start recording
      const hasPermission = await voiceService.requestPermissions();
      if (hasPermission) {
        setIsRecording(true);
        await voiceService.startRecording();
      }
    }
  };

  const handleVoiceConfirm = () => {
    setShowVoiceModal(false);
    // Execute the parsed command
    handlePause();
  };

  const handleVoiceCancel = () => {
    setShowVoiceModal(false);
  };

  const mapRegion = currentActivity && currentActivity.locations.length > 0
    ? {
        latitude: currentActivity.locations[currentActivity.locations.length - 1].latitude,
        longitude: currentActivity.locations[currentActivity.locations.length - 1].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : undefined;

  const pathCoordinates = currentActivity?.locations.map((loc) => ({
    latitude: loc.latitude,
    longitude: loc.longitude,
  })) || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Voice Command Modal */}
      <VoiceConfirmationModal
        visible={showVoiceModal}
        command={voiceCommand}
        action={voiceAction}
        onConfirm={handleVoiceConfirm}
        onCancel={handleVoiceCancel}
      />

      {/* Map */}
      <View style={styles.mapContainer}>
        {mapRegion ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={mapRegion}
            customMapStyle={darkMapStyle}
            showsUserLocation
            showsMyLocationButton={false}
            followsUserLocation
          >
            {pathCoordinates.length > 0 && (
              <>
                <Polyline
                  coordinates={pathCoordinates}
                  strokeColor={colors.primary}
                  strokeWidth={4}
                />
                <Marker coordinate={pathCoordinates[0]}>
                  <View style={[styles.marker, styles.startMarker]}>
                    <Ionicons name="flag" size={16} color={colors.background} />
                  </View>
                </Marker>
              </>
            )}
          </MapView>
        ) : (
          <View style={[styles.map, styles.mapPlaceholder]}>
            <Ionicons name="location-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.mapPlaceholderText}>Waiting for GPS...</Text>
          </View>
        )}
      </View>

      {/* Stats Overlay */}
      <View style={styles.overlay}>
        {/* Elapsed Time */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>ELAPSED TIME</Text>
          <Text style={styles.timeValue}>{formatDuration(elapsedTime)}</Text>
          <View style={[styles.statusBadge, currentActivity?.status === 'paused' && styles.statusBadgePaused]}>
            <Text style={styles.statusText}>
              {currentActivity?.status === 'active' ? 'ACTIVE' : 'PAUSED'}
            </Text>
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.metricsContainer}>
          <MetricCard
            label="Distance"
            value={formatDistance(currentActivity?.distance || 0).split(' ')[0]}
            unit={formatDistance(currentActivity?.distance || 0).split(' ')[1]}
          />
          <MetricCard
            label="Current Pace"
            value={formatPace(currentActivity?.avgPace).split('/')[0]}
            unit={`/${formatPace(currentActivity?.avgPace).split('/')[1]}`}
            subtext="+2% AVG"
          />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="map-outline" size={24} color={colors.textPrimary} />
            <Text style={styles.controlLabel}>COURSE</Text>
          </TouchableOpacity>

          {/* Voice Button */}
          <TouchableOpacity
            style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
            onPress={handleVoicePress}
            onLongPress={handleVoicePress}
            activeOpacity={0.8}
          >
            <Ionicons name="mic" size={32} color={colors.background} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="musical-notes-outline" size={24} color={colors.textPrimary} />
            <Text style={styles.controlLabel}>AUDIO</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <Text style={styles.instructions}>
          HOLD TO SPEAK | TAP FOR MANUAL {currentActivity?.status === 'active' ? 'PAUSE' : 'RESUME'}
        </Text>

        {/* Manual Controls */}
        <View style={styles.manualControls}>
          {currentActivity?.status === 'active' ? (
            <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
              <Ionicons name="pause" size={24} color={colors.background} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.resumeButton} onPress={handleResume}>
              <Ionicons name="play" size={24} color={colors.background} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
            <Ionicons name="stop" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#212121' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#212121' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2c2c2c' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8a8a8a' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#000000' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    height: height * 0.35,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startMarker: {
    backgroundColor: colors.accentGreen,
  },
  overlay: {
    flex: 1,
    padding: spacing.lg,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  timeLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  timeValue: {
    fontSize: 72,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 80,
  },
  statusBadge: {
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
  },
  statusBadgePaused: {
    backgroundColor: colors.accentOrange + '20',
  },
  statusText: {
    ...typography.label,
    color: colors.primary,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  controlButton: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 60,
  },
  controlLabel: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 10,
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  voiceButtonActive: {
    backgroundColor: colors.error,
    shadowColor: colors.error,
  },
  instructions: {
    ...typography.label,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  manualControls: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  pauseButton: {
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeButton: {
    backgroundColor: colors.accentGreen,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    backgroundColor: colors.card,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
