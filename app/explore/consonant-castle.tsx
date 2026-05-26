// 声母城堡 - 23个声母互动探索区
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { getStageLevelsWithIndex } from '@/data/curriculum';
import { useProgress } from '@/services/progress';
import type { LevelData } from '@/data/types';

// 声母按发音部位分组
const CONSONANT_GROUPS = [
  { name: '唇音', range: [0, 3], color: '#FF6B8A' },     // b p m f
  { name: '舌尖音', range: [4, 7], color: '#FF9F43' },    // d t n l
  { name: '舌根音', range: [8, 10], color: '#7C5CFC' },   // g k h
  { name: '舌面音', range: [11, 13], color: '#38ADE0' },  // j q x
  { name: '翘舌音', range: [14, 17], color: '#0FBA82' },  // zh ch sh r
  { name: '平舌音', range: [18, 20], color: '#ED4799' },  // z c s
  { name: '特殊音', range: [21, 22], color: '#F59E0A' },  // y w
];

export default function ConsonantCastlePage() {
  const levels = getStageLevelsWithIndex('consonant-castle');
  const { progress } = useProgress();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 顶部关闭按钮 */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.navigate('/(tabs)')}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.stageBlue }]}>
        <Text style={styles.headerEmoji}>🏰</Text>
        <Text style={styles.headerTitle}>声母魔法城堡</Text>
        <Text style={styles.headerSub}>23 个声母守卫，每个都有自己的秘密！</Text>
      </View>

      {/* 分组显示 */}
      {CONSONANT_GROUPS.map((group) => (
        <View key={group.name} style={styles.groupSection}>
          <View style={styles.groupHeader}>
            <View style={[styles.groupDot, { backgroundColor: group.color }]} />
            <Text style={[styles.groupName, { color: group.color }]}>{group.name}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupScroll}>
            {levels.slice(group.range[0], group.range[1] + 1).map((level) => {
              const isDone = progress.completedLevels.includes(level.id);
              const stars = progress.starRatings[level.id] || 0;

              return (
                <TouchableOpacity
                  key={level.id}
                  style={[styles.consCard, { borderColor: group.color + '40' }, isDone && styles.consCardDone]}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/learn/new-sound?id=${level.id}` as any)}
                >
                  <Text style={[styles.consLetter, isDone && { color: Colors.stageBlue }]}>
                    {level.letter}
                  </Text>
                  <Text style={styles.consPinyin}>{level.pinyin}</Text>
                  <Text style={styles.consExample}>{level.example}</Text>

                  {isDone && (
                    <Text style={styles.doneBadge}>
                      {'★'.repeat(stars)}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ))}

      <Text style={styles.hint}>💡 点击卡片进入学习关卡，听字母发音和连读</Text>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.navigate('/(tabs)')}>
        <Text style={styles.backText}>← 返回首页</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBackground },
  content: { paddingBottom: 80 },
  // Close button
  closeBtn: {
    position: 'absolute', top: 16, right: 16, zIndex: 100,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: {
    color: Colors.pureWhite, fontSize: 16, fontWeight: "700",
  },
  // Header
  header: {
    paddingVertical: 32, paddingHorizontal: Spacing.pagePadding,
    alignItems: 'center', gap: 6,
  },
  headerEmoji: { fontSize: 40 },
  headerTitle: {
    fontFamily: FontFamily.primary, fontSize: 24, fontWeight: "800",
    color: Colors.pureWhite,
  },
  headerSub: {
    fontFamily: FontFamily.primary, fontSize: 14, color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  // Groups
  groupSection: { marginTop: 20 },
  groupHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.pagePadding, marginBottom: 10,
  },
  groupDot: { width: 10, height: 10, borderRadius: 5 },
  groupName: {
    fontFamily: FontFamily.primary, fontSize: 16, fontWeight: "700",
  },
  groupScroll: { paddingLeft: Spacing.pagePadding },
  consCard: {
    width: 100, height: 130,
    backgroundColor: Colors.pureWhite, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', gap: 2,
    marginRight: 10,
    borderWidth: 2,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2,
  },
  consCardDone: {
    backgroundColor: '#F0F5FF',
  },
  consLetter: {
    fontFamily: FontFamily.primary, fontSize: 36, fontWeight: "800",
    color: Colors.textPrimary,
  },
  consPinyin: {
    fontFamily: FontFamily.primary, fontSize: 14, fontWeight: "600",
    color: Colors.stageBlue,
  },
  consExample: {
    fontFamily: FontFamily.chinese, fontSize: 18, fontWeight: "600",
    color: Colors.textSecondary,
  },
  playingBadge: {
    position: 'absolute', top: 6, right: 6, fontSize: 14,
  },
  doneBadge: {
    position: 'absolute', bottom: 6, fontSize: 8, color: '#F59E0A',
  },
  // Hint
  hint: {
    fontFamily: FontFamily.primary, fontSize: 12, color: Colors.textSecondary,
    textAlign: 'center', marginTop: 20,
    paddingHorizontal: Spacing.pagePadding,
  },
  backBtn: {
    marginTop: 16, marginHorizontal: Spacing.pagePadding,
    paddingVertical: 12, alignItems: 'center',
    backgroundColor: Colors.pureWhite, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.borderSubtle,
  },
  backText: {
    fontFamily: FontFamily.primary, fontSize: 14, fontWeight: "500",
    color: Colors.textSecondary,
  },
});
