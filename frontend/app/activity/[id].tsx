import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { databaseService } from '../../src/services/databaseService';
import { Activity } from '../../src/types';
import { colors, spacing, borderRadius, typography } from '../../src/utils/theme';
import { formatDate, formatDistance, formatDuration, formatPace, formatTime } from '../../src/utils/formatting';

export default function ActivityDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadActivity = async () => {
      if (!id) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      if (mounted) {
        setLoading(true);
      }

      const found = await databaseService.getActivity(id);
      if (mounted) {
        setActivity(found);
        setLoading(false);
      }
    };

    loadActivity();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>Loading session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activity) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.stateTitle}>Session not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Session Details</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.activityName}>
            {activity.name || `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} Session`}
          </Text>
          <Text style={styles.activityMeta}>
            {formatDate(activity.createdAt)} at {formatTime(activity.createdAt)}
          </Text>
        </View>

        <View style={styles.metricsGrid}>
          <MetricItem label="Distance" value={formatDistance(activity.distance)} />
          <MetricItem label="Duration" value={formatDuration(activity.duration)} />
          <MetricItem label="Avg Pace" value={formatPace(activity.avgPace)} />
          <MetricItem label="Track Points" value={`${activity.locations.length}`} />
        </View>

        {activity.aiInsight ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>AI Insight</Text>
            <Text style={styles.sectionBody}>{activity.aiInsight}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  activityName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  activityMeta: {
    ...typography.body,
    color: colors.textSecondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  metricLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metricValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sectionBody: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  stateTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  stateText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    ...typography.label,
    color: colors.background,
  },
});
