import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../utils/theme';
import { Button } from './Button';

interface VoiceConfirmationModalProps {
  visible: boolean;
  command: string;
  action: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function VoiceConfirmationModal({
  visible,
  command,
  action,
  onConfirm,
  onCancel,
}: VoiceConfirmationModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>VOICE COMMAND RECEIVED</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.commandText}>{'"'}{command}{'"'}</Text>
            <View style={styles.statusContainer}>
              <View style={styles.dotContainer}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
              <Text style={styles.actionText}>{action}</Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <Button
              title="CONFIRM"
              onPress={onConfirm}
              variant="primary"
              style={styles.confirmButton}
            />
            <Button
              title="CANCEL"
              onPress={onCancel}
              variant="outline"
              style={styles.cancelButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-start',
    paddingTop: 80,
  },
  container: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    marginBottom: spacing.xl,
  },
  commandText: {
    fontSize: 20,
    fontWeight: '400',
    color: colors.textPrimary,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dotContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textPrimary,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  confirmButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
});
