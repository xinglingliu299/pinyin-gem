// 学习报告 - 数据统计
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { STAGES, getStageLevels, TOTAL_LEVELS } from '@/data/curriculum';
import { useProgress } from '@/services/progress';

// 环形进度条组件（纯 CSS 方案：用两个半圆模拟）
function RingProgress({ pct, size, color, label, subLabel }: {
  pct: number; size: number; color: string; label: string; subLabel: string;
}) {
  const strokeW = 6;
  const r = (size - strokeW) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct / 100);

  return (
    <View style={{ alignItems: 'center', gap: Spacing.gapSM }}>
      <View style={{ width: size, height: size, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
        {/* Background circle */}
        <View style={{
          position: 'absolute', width: size, height: size,
          borderRadius: size / 2,
          borderWidth: strokeW, borderColor: Colors.borderSubtle,
        }} />
        {/* Foreground arc - using simple filled background approach */}
        <View style={{
          position: 'absolute', width: size, height: size,
          borderRadius: size / 2,
          borderWidth: strokeW, borderColor: 'transparent',
          borderTopColor: pct > 0 ? color : 'transparent',
          borderRightColor: pct > 25 ? color : 'transparent',
          borderBottomColor: pct > 50 ? color : 'transparent',
          borderLeftColor: pct > 75 ? color : 'transparent',
          transform: [{ rotate: '-45deg' }],
        }} />
        <Text style={[styles.ringPct, { color }]}>{pct}%</Text>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
      <Text style={styles.ringSub}>{subLabel}</Text>
    </View>
  );
}

export default function ReportPage() {
  const { progress } = useProgress();

  const totalCompleted = progress.completedLevels.length;
  const totalStars = progress.totalStars;
  const completionPct = TOTAL_LEVELS > 0 ? Math.round((totalCompleted / TOTAL_LEVELS) * 100) : 0;

  // 计算各阶段数据
  const stageStats = STAGES.map((stage) => {
    const levels = getStageLevels(stage.id);
    const completed = levels.filter((l) => progress.completedLevels.includes(l.id)).length;
    const pct = levels.length > 0 ? Math.round((completed / levels.length) * 100) : 0;
    const stars = levels.reduce((sum, l) => sum + (progress.starRatings[l.id] || 0), 0);
    return { ...stage, completed, total: levels.length, pct, stars };
  });

  // 星级分布
  const starDistribution = [0, 0, 0, 0]; // 0星, 1星, 2星, 3星
  const allLevelIds = STAGES.flatMap((s) => getStageLevels(s.id).map((l) => l.id));
  allLevelIds.forEach((id) => {
    const stars = progress.starRatings[id] || 0;
    starDistribution[stars] = (starDistribution[stars] || 0) + 1;
  });

  const maxDist = Math.max(...starDistribution, 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>学习报告</Text>
        <Text style={styles.headerDate}>更新于 {new Date().toLocaleDateString('zh-CN')}</Text>
      </View>

      {/* 概览卡片 */}
      <View style={styles.overviewCard}>
        <RingProgress pct={completionPct} size={80} color={Colors.magicPurple} label="完成率" subLabel={`${totalCompleted}/${TOTAL_LEVELS} 关`} />
        <View style={styles.overviewDivider} />
        <View style={styles.overviewStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.stageGold }]}>{totalStars}</Text>
            <Text style={styles.statLabel}>总星星</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.successGreen }]}>{progress.streak}</Text>
            <Text style={styles.statLabel}>连续天数</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.stagePink }]}>{progress.completedLevels.length}</Text>
            <Text style={styles.statLabel}>已学关数</Text>
          </View>
        </View>
      </View>

      {/* 阶段进度 */}
      <Text style={styles.sectionTitle}>各阶段进度</Text>
      <View style={styles.stageList}>
        {stageStats.map((stage) => (
          <View key={stage.id} style={styles.stageRow}>
            <View style={styles.stageLabel}>
              <View style={[styles.stageDot, { backgroundColor: stage.barColor }]} />
              <Text style={styles.stageName}>{stage.name}</Text>
            </View>
            <View style={styles.stageBarWrap}>
              <View style={styles.stageBar}>
                <View style={[styles.stageBarFill, { width: `${stage.pct}%`, backgroundColor: stage.barColor }]} />
              </View>
              <Text style={styles.stageBarText}>{stage.completed}/{stage.total}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 星级分布 */}
      <Text style={styles.sectionTitle}>星级分布</Text>
      <View style={styles.starDistCard}>
        {[3, 2, 1, 0].map((stars) => {
          const count = starDistribution[stars] || 0;
          const barH = Math.max((count / maxDist) * 80, 4);
          return (
            <View key={stars} style={styles.distCol}>
              <Text style={styles.distCount}>{count}</Text>
              <View style={[styles.distBar, { height: barH, backgroundColor: stars > 0 ? Colors.stageGold : Colors.borderDefault }]} />
              <Text style={styles.distLabel}>
                {stars > 0 ? '★'.repeat(stars) : '未学'}
              </Text>
            </View>
          );
        })}
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
  headerDate: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.footnote,
    color: Colors.textSecondary, marginTop: Spacing.gapXS,
  },
  // Overview
  overviewCard: {
    marginHorizontal: Spacing.pagePadding,
    backgroundColor: Colors.pureWhite,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.cardPadding,
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.gapLG,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2,
  },
  overviewDivider: {
    width: 1, height: 60, backgroundColor: Colors.borderSubtle,
  },
  overviewStats: {
    flex: 1, flexDirection: 'row', justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center', gap: 2 },
  statValue: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.title2, fontWeight: FontWeights.light,
  },
  statLabel: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.footnote,
    color: Colors.textSecondary,
  },
  ringPct: {
    fontFamily: FontFamily.primary, fontSize: 18, fontWeight: FontWeights.light,
  },
  ringLabel: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.footnote,
    color: Colors.textPrimary, fontWeight: FontWeights.medium,
  },
  ringSub: {
    fontFamily: FontFamily.primary, fontSize: 10, color: Colors.textSecondary,
  },
  // Section
  sectionTitle: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.subhead,
    fontWeight: FontWeights.medium, color: Colors.textPrimary,
    paddingHorizontal: Spacing.pagePadding,
    paddingTop: Spacing.sectionGap,
    paddingBottom: Spacing.elementGap,
  },
  // Stage progress
  stageList: {
    marginHorizontal: Spacing.pagePadding,
    backgroundColor: Colors.pureWhite,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.cardPadding,
    gap: Spacing.gapMD,
  },
  stageRow: { gap: Spacing.gapSM },
  stageLabel: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.gapSM,
  },
  stageDot: { width: 8, height: 8, borderRadius: 4 },
  stageName: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.footnote,
    fontWeight: FontWeights.medium, color: Colors.textPrimary,
  },
  stageBarWrap: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.gapSM,
  },
  stageBar: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: Colors.borderSubtle, overflow: 'hidden',
  },
  stageBarFill: { height: '100%', borderRadius: 3 },
  stageBarText: {
    fontFamily: FontFamily.primary, fontSize: 10, color: Colors.textSecondary,
    width: 30, textAlign: 'right',
  },
  // Star distribution
  starDistCard: {
    marginHorizontal: Spacing.pagePadding,
    backgroundColor: Colors.pureWhite,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.cardPadding,
    flexDirection: 'row', justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
  },
  distCol: { alignItems: 'center', gap: Spacing.gapXS },
  distCount: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout,
    fontWeight: FontWeights.medium, color: Colors.textPrimary,
  },
  distBar: {
    width: 32, borderRadius: 6, minHeight: 4,
  },
  distLabel: {
    fontFamily: FontFamily.primary, fontSize: 10, color: Colors.textSecondary,
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
