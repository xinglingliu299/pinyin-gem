// 学习成就 - 徽章墙
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { useProgress } from '@/services/progress';
import { TOTAL_LEVELS } from '@/data/curriculum';

// 成就定义
const ALL_ACHIEVEMENTS = [
  // 学习类
  { id: 'first_lesson', emoji: '🌟', name: '初学者', desc: '完成第1个关卡', category: '学习', check: (p: any) => p.completedLevels.length >= 1 },
  { id: 'five_lessons', emoji: '📖', name: '小书虫', desc: '完成5个关卡', category: '学习', check: (p: any) => p.completedLevels.length >= 5 },
  { id: 'ten_lessons', emoji: '📚', name: '勤学者', desc: '完成10个关卡', category: '学习', check: (p: any) => p.completedLevels.length >= 10 },
  { id: 'twenty_lessons', emoji: '🎓', name: '小学霸', desc: '完成20个关卡', category: '学习', check: (p: any) => p.completedLevels.length >= 20 },
  { id: 'all_lessons', emoji: '👑', name: '拼音大王', desc: '完成全部54个关卡', category: '学习', check: (p: any) => p.completedLevels.length >= TOTAL_LEVELS },
  // 质量类
  { id: 'first_3star', emoji: '⭐', name: '三星通关', desc: '首次获得3星评价', category: '质量', check: (p: any) => Object.values(p.starRatings).some((s: any) => s >= 3) },
  { id: 'ten_3star', emoji: '✨', name: '追求完美', desc: '获得10个三星', category: '质量', check: (p: any) => Object.values(p.starRatings).filter((s: any) => s >= 3).length >= 10 },
  { id: 'star_30', emoji: '🎖️', name: '星星收藏家', desc: '累计获得30颗星星', category: '质量', check: (p: any) => p.totalStars >= 30 },
  { id: 'star_100', emoji: '🏅', name: '闪耀之星', desc: '累计获得100颗星星', category: '质量', check: (p: any) => p.totalStars >= 100 },
  // 游戏类
  { id: 'play_game', emoji: '🎮', name: '游戏达人', desc: '体验任意一个游戏', category: '游戏', check: () => true },
  { id: 'game_3star', emoji: '🏆', name: '游戏冠军', desc: '在游戏中获得3星', category: '游戏', check: () => false },
  // 坚持类
  { id: 'streak_3', emoji: '🔥', name: '连续3天', desc: '连续学习3天', category: '坚持', check: (p: any) => p.streak >= 3 },
  { id: 'streak_7', emoji: '💪', name: '连续7天', desc: '连续学习7天', category: '坚持', check: (p: any) => p.streak >= 7 },
];

const CATEGORY_COLORS: Record<string, string> = {
  '学习': Colors.magicPurple,
  '质量': Colors.stageGold,
  '游戏': Colors.stagePink,
  '坚持': Colors.successGreen,
};

export default function AchievementsPage() {
  const { progress } = useProgress();

  const unlocked = ALL_ACHIEVEMENTS.filter((a) => a.check(progress));
  const locked = ALL_ACHIEVEMENTS.filter((a) => !a.check(progress));

  // 按类别分组
  const categories = [...new Set(ALL_ACHIEVEMENTS.map((a) => a.category))];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>学习成就</Text>
        <Text style={styles.headerSub}>
          已解锁 {unlocked.length}/{ALL_ACHIEVEMENTS.length} 个成就
        </Text>
        <View style={styles.progressMini}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.round((unlocked.length / ALL_ACHIEVEMENTS.length) * 100)}%` }]} />
          </View>
        </View>
      </View>

      {/* 已解锁成就 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          ✨ 已解锁 ({unlocked.length})
        </Text>
        {unlocked.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🔮</Text>
            <Text style={styles.emptyText}>还没有解锁的成就</Text>
            <Text style={styles.emptyHint}>去学习拼音解锁第一个成就吧！</Text>
          </View>
        ) : (
          <View style={styles.badgeGrid}>
            {unlocked.map((a) => (
              <View key={a.id} style={[styles.badgeCard, { borderColor: CATEGORY_COLORS[a.category] }]}>
                <Text style={styles.badgeEmoji}>{a.emoji}</Text>
                <Text style={styles.badgeName}>{a.name}</Text>
                <Text style={[styles.badgeCat, { color: CATEGORY_COLORS[a.category] }]}>{a.category}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 未解锁成就 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          🔒 未解锁 ({locked.length})
        </Text>
        <View style={styles.badgeGrid}>
          {locked.map((a) => (
            <View key={a.id} style={styles.lockedCard}>
              <Text style={styles.lockedEmoji}>🔒</Text>
              <Text style={styles.lockedName}>{a.name}</Text>
              <Text style={styles.lockedDesc}>{a.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 返回 */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← 返回</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBackground },
  content: { paddingBottom: 80 },
  // Header
  header: {
    paddingHorizontal: Spacing.pagePadding,
    paddingTop: Spacing.sectionGap + 40,
    paddingBottom: Spacing.gapLG,
  },
  headerTitle: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.title1, fontWeight: FontWeights.light,
    color: Colors.textPrimary, letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout,
    color: Colors.textSecondary, marginTop: Spacing.gapXS,
  },
  progressMini: { marginTop: Spacing.gapMD },
  progressBar: { height: 8, borderRadius: 4, backgroundColor: Colors.borderSubtle, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: Colors.magicPurple },
  // Section
  section: {
    paddingHorizontal: Spacing.pagePadding,
    marginBottom: Spacing.gapLG,
  },
  sectionTitle: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.subhead,
    fontWeight: FontWeights.medium, color: Colors.textPrimary,
    marginBottom: Spacing.elementGap,
  },
  // Badge grid
  badgeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.gapSM,
  },
  badgeCard: {
    width: '31%',
    backgroundColor: Colors.pureWhite,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.paddingSM,
    alignItems: 'center',
    gap: Spacing.gapSM,
    borderWidth: 1.5,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 1,
  },
  badgeEmoji: { fontSize: 32 },
  badgeName: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.footnote,
    fontWeight: FontWeights.medium, color: Colors.textPrimary, textAlign: 'center',
  },
  badgeCat: {
    fontFamily: FontFamily.primary, fontSize: 10,
    fontWeight: FontWeights.medium,
  },
  // Locked
  lockedCard: {
    width: '31%',
    backgroundColor: Colors.pureWhite,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.paddingSM,
    alignItems: 'center',
    gap: Spacing.gapXS,
    borderWidth: 1, borderColor: Colors.borderSubtle,
    opacity: 0.5,
  },
  lockedEmoji: { fontSize: 24 },
  lockedName: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.footnote,
    fontWeight: FontWeights.medium, color: Colors.textSecondary,
  },
  lockedDesc: {
    fontFamily: FontFamily.primary, fontSize: 10,
    color: Colors.borderDefault, textAlign: 'center',
  },
  // Empty
  emptyCard: {
    backgroundColor: Colors.pureWhite,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.paddingXL,
    alignItems: 'center',
    gap: Spacing.gapSM,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout,
    fontWeight: FontWeights.medium, color: Colors.textPrimary,
  },
  emptyHint: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.footnote,
    color: Colors.textSecondary,
  },
  // Back
  backBtn: {
    marginHorizontal: Spacing.pagePadding, marginTop: Spacing.gapSM,
    paddingVertical: Spacing.paddingMD, alignItems: 'center',
    backgroundColor: Colors.pureWhite, borderRadius: Spacing.cardRadius,
    borderWidth: 1, borderColor: Colors.borderSubtle,
  },
  backText: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout, fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
  },
});
