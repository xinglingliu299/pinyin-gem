// 03-拼音魔法王国(学习) - 真实进度驱动版本
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { STAGES, getStageLevels, TOTAL_LEVELS } from '@/data/curriculum';
import type { LevelData } from '@/data/types';
import { useProgress } from '@/services/progress';

// 节点类型
type NodeStatus = 'done' | 'current' | 'locked';

// 根据进度计算节点状态
function getNodeStatus(globalIndex: number, completed: number): NodeStatus {
  if (globalIndex < completed) return 'done';
  if (globalIndex === completed) return 'current';
  return 'locked';
}

function LevelCircle({
  level, status, onPress,
}: {
  level: LevelData; status: NodeStatus; onPress: () => void;
}) {
  const isDone = status === 'done';
  const isCurrent = status === 'current';
  const bgColor = isDone ? Colors.successGreen : isCurrent ? Colors.magicPurple : '#D9D9D9';

  return (
    <TouchableOpacity onPress={onPress} disabled={status === 'locked'}>
      <View style={styles.nodeWrap}>
        <View style={[styles.circle, { backgroundColor: bgColor }]}>
          {status === 'locked' ? (
            <Text style={styles.lockIcon}>🔒</Text>
          ) : (
            <Text style={[styles.circleLetter, { color: Colors.pureWhite }]}>
              {level.letter}
            </Text>
          )}
        </View>
        {isDone && (
          <Text style={styles.starIcon}>★</Text>
        )}
        <Text style={styles.letterLabel}>{level.letter}</Text>
      </View>
    </TouchableOpacity>
  );
}

// 阶段分区
function StageSection({
  stage, levels, completedCount, startIndex,
}: {
  stage: typeof STAGES[0];
  levels: LevelData[];
  completedCount: number;
  startIndex: number;
}) {
  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={[styles.sectionHeader, { backgroundColor: stage.barColor }]}>
        <View style={[styles.sectionIconWrap, { backgroundColor: stage.iconBg }]}>
          <Text style={styles.sectionIcon}>{stage.icon}</Text>
        </View>
        <Text style={styles.sectionHeaderTitle}>{stage.name}</Text>
      </View>

      {/* Nodes */}
      <View style={styles.nodesRow}>
        {levels.map((level, i) => {
          const globalIndex = startIndex + i;
          const status = getNodeStatus(globalIndex, completedCount);
          return (
            <LevelCircle
              key={level.id}
              level={level}
              status={status}
              onPress={() => router.push(`/learn/new-sound?id=${level.id}`)}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function MapPage() {
  const { progress, isLoading } = useProgress();

  // 加载中不渲染
  if (isLoading) return null;

  // 真实进度
  const completedCount = progress.completedLevels.length;
  const progressPercent = completedCount > 0
    ? Math.round((completedCount / TOTAL_LEVELS) * 100)
    : 0;

  // 为每个阶段计算全局起始索引
  let runningIndex = 0;
  const stageData = STAGES.map((stage) => {
    const levels = getStageLevels(stage.id);
    const startIndex = runningIndex;
    runningIndex += levels.length;
    return { stage, levels, startIndex };
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>拼音魔法王国</Text>
        <Text style={styles.headerProgress}>{completedCount}/{TOTAL_LEVELS}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Stage Sections */}
      {stageData.map(({ stage, levels, startIndex }) => (
        <StageSection
          key={stage.id}
          stage={stage}
          levels={levels}
          completedCount={completedCount}
          startIndex={startIndex}
        />
      ))}
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
    paddingBottom: 120,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.gapSM,
  },
  headerTitle: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.title1,
    fontWeight: FontWeights.medium,
    color: Colors.magicPurple,
    letterSpacing: -0.5,
  },
  headerProgress: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.title3,
    fontWeight: FontWeights.medium,
    color: Colors.magicPurple,
  },

  // Progress Bar
  progressTrack: {
    height: 8,
    backgroundColor: '#E5E0EB',
    borderRadius: 4,
    marginBottom: Spacing.sectionGap,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.magicPurple,
    borderRadius: 4,
  },

  // Section
  section: {
    marginBottom: Spacing.sectionGap,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gapSM,
    paddingHorizontal: Spacing.paddingMD,
    paddingVertical: 10,
    borderRadius: 24,
    marginBottom: Spacing.elementGap,
  },
  sectionIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIcon: {
    fontSize: 12,
    color: Colors.pureWhite,
  },
  sectionHeaderTitle: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.callout,
    fontWeight: FontWeights.medium,
    color: Colors.pureWhite,
  },

  // Nodes
  nodesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 12,
    paddingHorizontal: Spacing.gapMD,
  },
  nodeWrap: {
    alignItems: 'center',
    gap: 2,
    width: 56,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleLetter: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.headline,
    fontWeight: FontWeights.medium,
    color: Colors.pureWhite,
  },
  lockIcon: {
    fontSize: 14,
  },
  starIcon: {
    fontSize: 12,
    color: Colors.magicGold,
  },
  letterLabel: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.footnote,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
