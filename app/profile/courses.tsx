// 我的课程 - 全部54关进度总览
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { STAGES, getStageLevels, TOTAL_LEVELS } from '@/data/curriculum';
import { useProgress } from '@/services/progress';
import type { StageId } from '@/data/types';

export default function CoursesPage() {
  const { progress } = useProgress();

  const totalCompleted = progress.completedLevels.length;
  const completionPct = TOTAL_LEVELS > 0 ? Math.round((totalCompleted / TOTAL_LEVELS) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 头部统计 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的课程</Text>
        <View style={styles.progressWrap}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${completionPct}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {totalCompleted}/{TOTAL_LEVELS} 关 · {completionPct}%
          </Text>
        </View>
      </View>

      {/* 按阶段分组 */}
      {STAGES.map((stage) => {
        const stageLevels = getStageLevels(stage.id);
        const completedInStage = stageLevels.filter((l) => progress.completedLevels.includes(l.id)).length;
        const stagePct = stageLevels.length > 0
          ? Math.round((completedInStage / stageLevels.length) * 100)
          : 0;

        return (
          <View key={stage.id} style={styles.stageSection}>
            {/* 阶段标题 */}
            <View style={styles.stageHeader}>
              <View style={[styles.stageDot, { backgroundColor: stage.barColor }]} />
              <Text style={styles.stageName}>{stage.name}</Text>
              <Text style={styles.stageSub}>{stage.subtitle}</Text>
              <Text style={[styles.stageCount, { color: stage.barColor }]}>
                {completedInStage}/{stageLevels.length}
              </Text>
            </View>

            {/* 阶段进度条 */}
            <View style={styles.stageProgressBar}>
              <View style={[styles.stageProgressFill, { width: `${stagePct}%`, backgroundColor: stage.barColor }]} />
            </View>

            {/* 关卡列表 */}
            <View style={styles.levelGrid}>
              {stageLevels.map((level) => {
                const isDone = progress.completedLevels.includes(level.id);
                const stars = progress.starRatings[level.id] || 0;

                return (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.levelCard,
                      { borderColor: isDone ? stage.barColor : Colors.borderDefault },
                      isDone && { backgroundColor: stage.barColor + '10' },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/learn/new-sound?id=${level.id}` as any)}
                  >
                    <Text style={[
                      styles.levelLetter,
                      { color: isDone ? stage.barColor : Colors.textSecondary },
                    ]}>{level.letter}</Text>
                    <Text style={[
                      styles.levelPinyin,
                      { color: isDone ? stage.barColor : Colors.borderDefault },
                    ]}>{level.pinyin}</Text>
                    {isDone && (
                      <View style={styles.levelStars}>
                        {[1, 2, 3].map((s) => (
                          <Text key={s} style={[styles.starIcon, { color: s <= stars ? Colors.stageGold : Colors.borderDefault }]}>
                            {s <= stars ? '★' : '☆'}
                          </Text>
                        ))}
                      </View>
                    )}
                    {!isDone && <Text style={styles.levelLock}>🔒</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}

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
    marginBottom: Spacing.gapMD,
  },
  progressWrap: { gap: Spacing.gapSM },
  progressBarBg: {
    height: 10, borderRadius: 5, backgroundColor: Colors.borderSubtle,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%', borderRadius: 5, backgroundColor: Colors.magicPurple,
  },
  progressText: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.footnote,
    color: Colors.magicPurple, fontWeight: FontWeights.medium,
  },
  // Stage section
  stageSection: {
    marginHorizontal: Spacing.pagePadding,
    marginBottom: Spacing.gapLG,
    backgroundColor: Colors.pureWhite,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.cardPadding,
    gap: Spacing.elementGap,
  },
  stageHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.gapSM,
  },
  stageDot: { width: 10, height: 10, borderRadius: 5 },
  stageName: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout,
    fontWeight: FontWeights.medium, color: Colors.textPrimary, flex: 1,
  },
  stageSub: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.footnote,
    color: Colors.textSecondary,
  },
  stageCount: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.footnote,
    fontWeight: FontWeights.medium,
  },
  stageProgressBar: {
    height: 4, borderRadius: 2, backgroundColor: Colors.borderSubtle,
    overflow: 'hidden',
  },
  stageProgressFill: {
    height: '100%', borderRadius: 2,
  },
  // Level grid
  levelGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.gapSM,
  },
  levelCard: {
    width: 50, height: 66,
    borderRadius: 12, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    gap: 0,
  },
  levelLetter: {
    fontFamily: FontFamily.primary, fontSize: 22, fontWeight: FontWeights.light,
  },
  levelPinyin: {
    fontFamily: FontFamily.primary, fontSize: 9, fontWeight: FontWeights.medium,
  },
  levelStars: {
    flexDirection: 'row', gap: 0,
  },
  starIcon: { fontSize: 7 },
  levelLock: {
    fontSize: 12, position: 'absolute', top: 2, right: 2,
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
