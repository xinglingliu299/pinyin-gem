// 04-认识新音 - 含 TTS 朗读 & 响应式布局
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { PrimaryButton, LearnTopBar } from '@/components';
import { getLevelById } from '@/data/curriculum';
import { playPinyin } from '@/services/audio';
import { useResponsive } from '@/hooks/useResponsive';

export default function NewSoundPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const level = getLevelById(id ?? 'b');
  const [isPlaying, setIsPlaying] = useState(false);
  const { cardWidth, fontSizeMultiplier } = useResponsive();

  if (!level) return null;

  const handlePlay = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await playPinyin(level.pinyin, { rate: 0.5 });
    } catch (e) {
      // silent fail for child-friendly UX
    } finally {
      setIsPlaying(false);
    }
  };

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

      {/* Pinyin Card */}
      <View style={[styles.pinyinCard, { width: cardWidth }]}>
        <Text style={[styles.pinyinChar, { fontSize: 72 * fontSizeMultiplier }]}>
          {level.letter}
        </Text>
        <View style={styles.illustration}>
          <Text style={[styles.illustrationText, { fontSize: 48 * fontSizeMultiplier }]}>
            {level.example}
          </Text>
        </View>
        <Text style={[styles.pinyinWord, { fontSize: 20 * fontSizeMultiplier }]}>
          {level.example} {level.pinyin}
        </Text>
      </View>

      {/* Play Button */}
      <View style={styles.playWrap}>
        <TouchableOpacity
          style={[styles.playBtn, isPlaying && styles.playBtnActive]}
          activeOpacity={0.8}
          onPress={handlePlay}
          disabled={isPlaying}
        >
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>
          {isPlaying ? '正在朗读...' : '点击播放，听声音'}
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
  pinyinCard: {
    height: 280,
    backgroundColor: Colors.pureWhite,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    shadowColor: 'rgba(140, 92, 245, 0.30)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
    padding: Spacing.cardPadding,
  },
  pinyinChar: {
    fontFamily: FontFamily.primary,
    fontWeight: '800',
    color: Colors.magicPurple,
  },
  illustration: {
    width: 120,
    height: 100,
    backgroundColor: Colors.glowPurple,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationText: {
    fontFamily: FontFamily.chinese,
    fontWeight: "500",
    color: Colors.magicPurple,
  },
  pinyinWord: {
    fontFamily: FontFamily.primary,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  playWrap: {
    alignItems: 'center',
    gap: 12,
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.magicPurple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(140, 92, 245, 0.30)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  playBtnActive: {
    backgroundColor: Colors.stagePink,
    opacity: 0.85,
  },
  playIcon: {
    fontSize: 32,
    color: Colors.pureWhite,
    marginLeft: 4,
  },
  hint: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.callout,
    color: Colors.textSecondary,
  },
  cta: {
    width: '100%',
  },
});
