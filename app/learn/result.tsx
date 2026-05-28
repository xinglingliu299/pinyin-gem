// 09-关卡结果页 - 含进度持久化 & 响应式布局
import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { PrimaryButton, SecondaryButton } from '@/components';
import { getLevelById, getNextLevel } from '@/data/curriculum';
import { useProgress } from '@/services/progress';
import { useResponsive } from '@/hooks/useResponsive';

export default function LevelResultPage() {
  const { id, stars: starsParam } = useLocalSearchParams<{ id: string; stars?: string }>();
  const level = getLevelById(id ?? 'b');
  const { completeLevel } = useProgress();
  const { cardWidth, fontSizeMultiplier } = useResponsive();

  const earnedStars = parseInt(starsParam ?? '3', 10);
  const nextLevel = getNextLevel(level?.id ?? '');

  // 关卡完成时保存进度（即使 stars=0 也记录完成）
  useEffect(() => {
    if (level) {
      completeLevel(level.id, Math.max(earnedStars, 1));
    }
  }, [level?.id, earnedStars]);

  if (!level) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Celebration Princess */}
      <View style={styles.princessWrap}>
        <View style={[styles.princessCircle, { width: 160 * fontSizeMultiplier, height: 160 * fontSizeMultiplier, borderRadius: 80 * fontSizeMultiplier }]}>
          <Text style={[styles.princessEmoji, { fontSize: 80 * fontSizeMultiplier }]}>
            👸
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text style={[styles.title, { fontSize: 24 * fontSizeMultiplier }]}>
        太棒了，魔法学徒！
      </Text>

      {/* Star Display */}
      <View style={styles.starRow}>
        {[1, 2, 3].map((s) => (
          <Text key={s} style={[styles.star, { fontSize: 36 * fontSizeMultiplier }]}>
            {s <= earnedStars ? '⭐' : '☆'}
          </Text>
        ))}
      </View>

      {/* Stats Card */}
      <View style={[styles.statsCard, { width: cardWidth }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { fontSize: FontSizes.callout * fontSizeMultiplier }]}>
            得分
          </Text>
          <Text style={[styles.statValue, { fontSize: FontSizes.title3 * fontSizeMultiplier }]}>
            {earnedStars === 3 ? 100 : earnedStars === 2 ? 80 : 60}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { fontSize: FontSizes.callout * fontSizeMultiplier }]}>
            用时
          </Text>
          <Text style={[styles.statValue, { fontSize: FontSizes.title3 * fontSizeMultiplier }]}>
            2:30
          </Text>
        </View>
      </View>

      {/* Reward */}
      <View style={styles.rewardRow}>
        <Text style={styles.rewardIcon}>⭐</Text>
        <Text style={[styles.rewardText, { fontSize: 16 * fontSizeMultiplier }]}>
          获得 {earnedStars} 个魔法星星
        </Text>
      </View>

      {/* Pinyin Review */}
      <View style={styles.reviewRow}>
        <View style={styles.reviewCard}>
          <Text style={[styles.reviewChar, { fontSize: 28 * fontSizeMultiplier }]}>
            {level.letter}
          </Text>
        </View>
      </View>

      {/* Button Row */}
      <View style={styles.btnRow}>
        <SecondaryButton
          title="再玩一次"
          onPress={() => router.push(`/learn/new-sound?id=${level.id}`)}
          style={styles.thirdBtn}
        />
        <PrimaryButton
          title={nextLevel ? '下一关' : '完成啦！'}
          onPress={() => {
            if (nextLevel) {
              router.push(`/learn/new-sound?id=${nextLevel.id}`);
            } else {
              router.navigate('/(tabs)' as any);
            }
          }}
          style={styles.thirdBtn}
        />
      </View>

      {/* 回到首页 */}
      <View style={styles.homeRow}>
        <TouchableOpacity
          style={styles.homeBtn}
          activeOpacity={0.8}
          onPress={() => router.navigate('/(tabs)' as any)}
        >
          <Text style={styles.homeIcon}>🏠</Text>
          <Text style={styles.homeText}>回到首页</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'center',
    flexGrow: 1,
    gap: Spacing.elementGap,
  },
  princessWrap: {
    alignItems: 'center',
  },
  princessCircle: {
    backgroundColor: Colors.glowPurple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(140, 92, 245, 0.20)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 6,
  },
  princessEmoji: {
    // fontSize set dynamically
  },
  title: {
    fontFamily: FontFamily.primary,
    fontWeight: "800",
    color: Colors.magicPurple,
    textAlign: 'center',
    marginTop: 4,
  },
  starRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  star: {
    // fontSize set dynamically
  },
  statsCard: {
    height: 76,
    backgroundColor: Colors.pureWhite,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    paddingHorizontal: Spacing.cardPadding,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontFamily: FontFamily.primary,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
  },
  statValue: {
    fontFamily: FontFamily.primary,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.borderSubtle,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  rewardIcon: {
    fontSize: 24,
  },
  rewardText: {
    fontFamily: FontFamily.primary,
    fontWeight: "600",
    color: Colors.stageGold,
  },
  reviewRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  reviewCard: {
    width: 80,
    height: 60,
    backgroundColor: Colors.pureWhite,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 1,
  },
  reviewChar: {
    fontFamily: FontFamily.primary,
    fontWeight: "800",
    color: Colors.magicPurple,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  thirdBtn: {
    flex: 1,
  },
  homeRow: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: Colors.pureWhite,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.glowPurple,
    shadowColor: 'rgba(140, 92, 245, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  homeIcon: {
    fontSize: 18,
  },
  homeText: {
    fontFamily: FontFamily.primary,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.magicPurple,
  },
});
