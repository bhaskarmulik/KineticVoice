import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../src/utils/theme';
import { MetricCard } from '../../src/components/MetricCard';
import { ActivityCard } from '../../src/components/ActivityCard';
import { useActivityStore } from '../../src/stores/activityStore';
import { activityRepository } from '../../src/services/activityRepository';
import { formatDistance, formatDuration } from '../../src/utils/formatting';
import { locationService } from '../../src/services/locationService';

export default function HomeScreen() {
  const router = useRouter();
  const { activities, loadActivities } = useActivityStore();
  const [locationPermission, setLocationPermission] = useState(false);

  const loadPastActivities = useCallback(async () => {
    const stored = await activityRepository.getActivities();
    loadActivities(stored);
  }, [loadActivities]);

  const checkPermissions = async () => {
    const hasPermission = await locationService.checkPermissions();
    setLocationPermission(hasPermission);
  };

  useEffect(() => {
    loadPastActivities();
    checkPermissions();
  }, [loadPastActivities]);

  const handleStartActivity = (type: 'walk' | 'run') => {
    if (!locationPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant location permission to track your activities.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Grant Permission',
            onPress: async () => {
              const granted = await locationService.requestPermissions();
              setLocationPermission(granted);
              if (granted) {
                router.push(`/tracking?type=${type}`);
              }
            },
          },
        ]
      );
      return;
    }

    router.push(`/tracking?type=${type}`);
  };

  const recentActivities = activities.slice(0, 3);
  const lastActivity = activities[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={colors.textPrimary} />
            </View>
            <Text style={styles.appTitle}>KINETIC VOICE</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>SYSTEM READY</Text>
        </View>

        {/* Main CTA */}
        <View style={styles.ctaContainer}>
          <Text style={styles.ctaTitle}>Ready to</Text>
          <Text style={styles.ctaTitleHighlight}>Move?</Text>
          <Text style={styles.ctaSubtitle}>
            How are you feeling today? I{"'"}m ready to track your progress.
          </Text>
        </View>

        {/* Start Activity Button */}
        <View style={styles.startButtonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() =>
              Alert.alert(
                'Choose Activity',
                'What type of activity do you want to track?',
                [
                  { text: 'Walk', onPress: () => handleStartActivity('walk') },
                  { text: 'Run', onPress: () => handleStartActivity('run') },
                  { text: 'Cancel', style: 'cancel' },
                ]
              )
            }
            activeOpacity={0.8}
          >
            <View style={styles.startButtonContent}>
              <Text style={styles.startButtonText}>Start Activity</Text>
              <Text style={styles.startButtonSubtext}>GPS connecting...</Text>
            </View>
            <Ionicons name="play-circle" size={48} color={colors.background} />
          </TouchableOpacity>
        </View>

        {/* Last Session Stats */}
        {lastActivity && (
          <View style={styles.statsContainer}>
            <MetricCard
              label="Last Distance"
              value={formatDistance(lastActivity.distance).split(' ')[0]}
              unit={formatDistance(lastActivity.distance).split(' ')[1]}
            />
            <MetricCard
              label="Last Duration"
              value={formatDuration(lastActivity.duration).split(':')[0]}
              unit="min"
            />
          </View>
        )}

        {/* Voice Suggestion */}
        <View style={styles.suggestionContainer}>
          <Ionicons name="bulb" size={20} color={colors.primary} />
          <Text style={styles.suggestionText}>
            Try saying: <Text style={styles.suggestionHighlight}>{'"'}Start a run{'"'}</Text>
          </Text>
        </View>

        {/* Recent Sessions */}
        {recentActivities.length > 0 && (
          <View style={styles.recentContainer}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Recent Sessions</Text>
              <TouchableOpacity onPress={() => router.push('/history')}>
                <Text style={styles.viewAllText}>VIEW HISTORY</Text>
              </TouchableOpacity>
            </View>

            {recentActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onPress={() => router.push(`/activity/${activity.id}`)}
              />
            ))}
          </View>
        )}

        {/* Floating Voice Button Placeholder */}
        <View style={styles.floatingButtonPlaceholder} />
      </ScrollView>

      {/* Floating Voice Button */}
      <TouchableOpacity style={styles.floatingButton} activeOpacity={0.8}>
        <Ionicons name="mic" size={32} color={colors.background} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  appTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accentGreen,
  },
  statusText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  ctaContainer: {
    marginBottom: spacing.xl,
  },
  ctaTitle: {
    ...typography.h1,
    fontSize: 40,
    color: colors.textPrimary,
  },
  ctaTitleHighlight: {
    ...typography.h1,
    fontSize: 40,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  ctaSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  startButtonContainer: {
    marginBottom: spacing.lg,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  startButtonContent: {
    flex: 1,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.background,
    marginBottom: spacing.xs,
  },
  startButtonSubtext: {
    fontSize: 14,
    color: colors.background,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  suggestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  suggestionText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  suggestionHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  recentContainer: {
    marginBottom: 100,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  viewAllText: {
    ...typography.label,
    color: colors.primary,
  },
  floatingButtonPlaceholder: {
    height: 100,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
});
