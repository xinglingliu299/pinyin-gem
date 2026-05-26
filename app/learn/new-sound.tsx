// 04-认识新音 - 两步学习法：先听字母音，再听连读
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { PrimaryButton, LearnTopBar } from '@/components';
import { getLevelById } from '@/data/curriculum';
import { playLetter, playPinyin } from '@/services/audio';
import { useResponsive } from '@/hooks/useResponsive';

export default function NewSoundPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const level = getLevelById(id ?? 'b');
  const { cardWidth, fontSizeMultiplier } = useResponsive();
  const [activeArea, setActiveArea] = useState<'letter' | 'example' | null>(null);
  const [letterPlayed, setLetterPlayed] = useState(false);
  const letterScale = useState(new Animated.Value(1))[0];
  const exampleScale = useState(new Animated.Value(1))[0];

  if (!level) return null;

  const handlePressLetter = async () => {
    if (activeArea) return;
    setActiveArea('letter');
    setLetterPlayed(true);
    Animated.sequence([
      Animated.spring(letterScale, { toValue: 0.92, useNativeDriver: true }),
      Animated.spring(letterScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    try {
      await playLetter(level.id, { rate: 0.6 });
    } catch { /* silent */ }
    setActiveArea(null);
  };

  const handlePressExample = async () => {
    if (activeArea) return;
    setActiveArea('example');
    Animated.sequence([
      Animated.spring(exampleScale, { toValue: 0.92, useNativeDriver: true }),
      Animated.spring(exampleScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    try {
      await playPinyin(level.pinyin, { rate: 0.5 });
    } catch { /* silent */ }
    setActiveArea(null);
  };

  // 判断是否是声母（声母需要强调两步法）
  const isInitial = level.type === 'initial';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar */}
      <LearnTopBar step={1} />

      {/* Princess Companion */}
      <View style={styles.princessWrap}>
        <View style={styles.princessCircle}>
          <Text style={styles.princessEmoji}>👸</Text>
        </View>
      </View>

      {/* Step Indicator */}
      {isInitial && (
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, letterPlayed ? styles.stepDotDone : styles.stepDotActive]}>
            <Text style={styles.stepDotText}>1</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, letterPlayed ? styles.stepDotActive : styles.stepDotPending]}>
            <Text style={styles.stepDotText}>2</Text>
          </View>
        </View>
      )}

      {/* Pinyin Card - Split into two clickable areas */}
      <View style={[styles.pinyinCard, { width: cardWidth }]}>
        {/* Area 1: Letter */}
        <TouchableOpacity
          style={[styles.letterArea, activeArea === 'letter' && styles.areaActive]}
          activeOpacity={0.8}
          onPress={handlePressLetter}
          disabled={!!activeArea}
        >
          <Animated.View style={{ transform: [{ scale: letterScale }] }}>
            <Text style={[styles.pinyinChar, { fontSize: 80 * fontSizeMultiplier }]}>
              {level.letter}
            </Text>
          </Animated.View>
          <View style={styles.letterHintRow}>
            <Text style={styles.tapIcon}>{activeArea === 'letter' ? '🔊' : '👆'}</Text>
            <Text style={styles.areaLabel}>
              {activeArea === 'letter' ? '正在读字母...' : '先听字母发音'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Area 2: Example Character */}
        <TouchableOpacity
          style={[styles.exampleArea, activeArea === 'example' && styles.areaActive]}
          activeOpacity={0.8}
          onPress={handlePressExample}
          disabled={!!activeArea}
        >
          <Animated.View style={{ transform: [{ scale: exampleScale }] }}>
            <Text style={[styles.exampleChar, { fontSize: 48 * fontSizeMultiplier }]}>
              {level.example}
            </Text>
          </Animated.View>
          <View style={styles.exampleHintRow}>
            <Text style={styles.tapIcon}>{activeArea === 'example' ? '🔊' : '👆'}</Text>
            <Text style={styles.areaLabel}>
              {activeArea === 'example' ? '正在连读...' : `再听"${level.pinyin}"连读`}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Word Example */}
      <View style={styles.wordRow}>
        <Text style={[styles.wordText, { fontSize: 16 * fontSizeMultiplier }]}>
          📝 组词：{level.word}
        </Text>
      </View>

      {/* CTA */}
      <PrimaryButton
        title="我学会了"
        onPress={() => router.push(`/learn/mouth?id=${level.id}`)}
        style={styles.cta}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pageBackground,
  },
  content: {
    padding: Spacing.pagePadding,
    paddingBottom: 100,
    alignItems: 'center',
    gap: Spacing.sectionGap,
  },
  princessWrap: {
    alignItems: 'center',
  },
  princessCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.glowPurple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(140, 92, 245, 0.12)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  princessEmoji: {
    fontSize: 32,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.magicPurple,
  },
  stepDotDone: {
    backgroundColor: '#0FBA82',
  },
  stepDotPending: {
    backgroundColor: 'rgba(140, 92, 245, 0.2)',
  },
  stepDotText: {
    fontFamily: FontFamily.primary,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.pureWhite,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(140, 92, 245, 0.2)',
  },
  pinyinCard: {
    backgroundColor: Colors.pureWhite,
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: 'rgba(140, 92, 245, 0.30)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
  letterArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
    backgroundColor: Colors.pureWhite,
  },
  exampleArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
    backgroundColor: 'rgba(140, 92, 245, 0.03)',
  },
  areaActive: {
    backgroundColor: 'rgba(140, 92, 245, 0.08)',
  },
  pinyinChar: {
    fontFamily: FontFamily.primary,
    fontWeight: '800',
    color: Colors.magicPurple,
  },
  exampleChar: {
    fontFamily: FontFamily.chinese,
    fontWeight: '500',
    color: '#F59E0B',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(140, 92, 245, 0.1)',
    marginHorizontal: 32,
  },
  letterHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exampleHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tapIcon: {
    fontSize: 16,
  },
  areaLabel: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.footnote,
    color: Colors.textSecondary,
  },
  wordRow: {
    backgroundColor: Colors.pureWhite,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: 'rgba(140, 92, 245, 0.10)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  wordText: {
    fontFamily: FontFamily.primary,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  cta: {
    width: '100%',
  },
});
