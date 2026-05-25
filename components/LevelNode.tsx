import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';

type LevelStatus = 'done' | 'current' | 'locked';

interface LevelNodeProps {
  number: number;
  title: string;
  status: LevelStatus;
}

export default function LevelNode({ number, title, status }: LevelNodeProps) {
  const isLocked = status === 'locked';
  const isDone = status === 'done';

  const bgColor = isDone
    ? Colors.successGreen
    : status === 'current'
      ? Colors.magicPurple
      : Colors.lockGray;

  const textColor = Colors.pureWhite;

  return (
    <View style={[styles.container, isLocked && styles.locked]}>
      <View style={[styles.circle, { backgroundColor: bgColor }]}>
        {isDone ? (
          <Text style={styles.checkmark}>&#10003;</Text>
        ) : isLocked ? (
          <Text style={styles.lockIcon}>&#128274;</Text>
        ) : (
          <Text style={[styles.number, { color: textColor }]}>{number}</Text>
        )}
      </View>
      <Text
        style={[
          styles.title,
          isLocked && styles.lockedText,
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.gapSM,
    width: 72,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(140, 92, 245, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  number: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.title3,
    fontWeight: FontWeights.bold,
  },
  checkmark: {
    color: Colors.pureWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  lockIcon: {
    fontSize: 16,
  },
  title: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.footnote,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  locked: {
    opacity: 0.5,
  },
  lockedText: {
    color: Colors.textSecondary,
  },
});
