import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';

interface ProgressBarProps {
  progress: number;       // 0 - 1
  label?: string;
  style?: ViewStyle;
  color?: string;
}

export default function ProgressBar({
  progress,
  label,
  style,
  color = Colors.magicPurple,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress * 100}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <Text style={styles.percentage}>{Math.round(clampedProgress * 100)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.gapSM,
  },
  label: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.subhead,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  track: {
    height: 8,
    backgroundColor: Colors.glowPurple,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.footnote,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
});
