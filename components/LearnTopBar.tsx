import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';

interface LearnTopBarProps {
  step: number; // 1-5
  totalSteps?: number;
}

export default function LearnTopBar({ step, totalSteps = 5 }: LearnTopBarProps) {
  const progress = step / totalSteps;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <Text style={styles.stepLabel}>
        Step {step}/{totalSteps}
      </Text>

      <TouchableOpacity style={styles.homeBtn} onPress={() => router.navigate('/(tabs)' as any)}>
        <Text style={styles.homeIcon}>🏠</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 24,
    gap: 12,
  },
  backBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontFamily: FontFamily.primary,
    fontSize: 24,
    fontWeight: FontWeights.light as any,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.glowPurple,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.magicPurple,
    borderRadius: 2,
  },
  stepLabel: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.callout,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
  },
  homeBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIcon: {
    fontSize: 16,
  },
});
