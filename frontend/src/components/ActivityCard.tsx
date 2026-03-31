import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Activity, ActivityType } from '../types';
import { colors, spacing, borderRadius, typography } from '../utils/theme';
import { formatDistance, formatDuration, formatDate, formatTime } from '../utils/formatting';

interface ActivityCardProps {
  activity: Activity;
  onPress: () => void;
}

export function ActivityCard({ activity, onPress }: ActivityCardProps) {
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'run':
        return 'walk';
      case 'walk':
        return 'walk';
      default:
        return 'fitness';
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'run':
        return colors.primary;
      case 'walk':
        return colors.accentGreen;
      default:
        return colors.primary;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconContainer, { backgroundColor: getActivityColor(activity.type) + '20' }]}>
        <Ionicons name={getActivityIcon(activity.type)} size={24} color={getActivityColor(activity.type)} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{activity.name || `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}`}</Text>
        <Text style={styles.date}>
          {formatDate(activity.createdAt)}, {formatTime(activity.createdAt)}
        </Text>

        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>DISTANCE</Text>
            <Text style={styles.metricValue}>{formatDistance(activity.distance)}</Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>TIME</Text>
            <Text style={styles.metricValue}>{formatDuration(activity.duration)}</Text>
          </View>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    ...typography.h3,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  metricLabel: {
    ...typography.label,
    color: colors.textTertiary,
    fontSize: 10,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
