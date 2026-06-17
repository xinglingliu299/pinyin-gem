// 韵母花园 - 复韵母+鼻韵母互动探索区
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { getStageLevelsWithIndex } from '@/data/curriculum';
import { useProgress } from '@/services/progress';
import type { LevelData } from '@/data/types';

// 韵母分组
const VOWEL_GROUPS = [
  { name: '复韵母', desc: '两个元音组合在一起', range: [0, 7], color: '#ED4799' },
  { name: '鼻韵母', desc: '带鼻音的韵母', range: [8, 17], color: '#F59E0A' },
];

export default function VowelGardenPage() {
  const levels = getStageLevelsWithIndex('vowel-garden');
  const { progress } = useProgress();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 顶部关闭按钮 */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.navigate('/(tabs)')}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.stagePink }]}>
        <Text style={styles.headerEmoji}>🌸</Text>
        <Text style={styles.headerTitle}>韵母魔法花园</Text>
        <Text style={styles.headerSub}>复韵母与鼻韵母的美丽花园</Text>
      </View>

      {VOWEL_GROUPS.map((group) => (
        <View key={group.name} style={styles.groupSection}>
          <View style={[styles.groupHeader, { borderLeftColor: group.color }]}>
            <Text style={[styles.groupName, { color: group.color }]}>{group.name}</Text>
            <Text style={styles.groupDesc}>{group.desc}</Text>
          </View>
          <View style={styles.grid}>
            {levels.slice(group.range[0], group.range[1] + 1).map((level) => {
              const isDone = progress.completedLevels.includes(level.id);
              const stars = progress.starRatings[level.id] || 0;

              return (
                <TouchableOpacity
                  key={level.id}
                  style={[styles.card, isDone && styles.cardDone]}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/learn/new-sound?id=${level.id}` as any)}
                >
                  <View style={[styles.cardBadge, { backgroundColor: group.color + '20' }]}>
                    <Text style={[styles.cardLetter, { color: group.color }]}>{level.letter}</Text>
                  </View>
                  <Text style={styles.cardPinyin}>{level.pinyin}</Text>
                  <Text style={styles.cardWord}>{level.word}</Text>

                  {isDone && (
                    <Text style={styles.starBadge}>{'★'.repeat(stars)}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      <Text style={styles.hint}>💡 复韵母是"滑过去的"——从一个元音滑到另一个</Text>
      <Text style={styles.hint2}>💡 鼻韵母要"走鼻子"——声音从鼻子出来</Text>

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
  },
  // Groups
  groupSection: { marginTop: 20, paddingHorizontal: Spacing.pagePadding },
  groupHeader: {
    borderLeftWidth: 4, paddingLeft: 12,
    marginBottom: 12, gap: 2,
  },
  groupName: {
    fontFamily: FontFamily.primary, fontSize: 18, fontWeight: "700",
  },
  groupDesc: {
    fontFamily: FontFamily.primary, fontSize: 13, color: Colors.textSecondary,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    justifyContent: 'center',
  },
  card: {
    width: '47%', aspectRatio: 1.5,
    backgroundColor: Colors.pureWhite, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', gap: 2,
    borderWidth: 1.5, borderColor: '#FDD0E0',
    shadowColor: 'rgba(237,71,153,0.08)',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8,
  },
  cardDone: {
    borderColor: Colors.stagePink,
    backgroundColor: '#FFF0F5',
  },
  cardBadge: {
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
  },
  cardLetter: {
    fontFamily: FontFamily.primary, fontSize: 28, fontWeight: "800",
  },
  cardPinyin: {
    fontFamily: FontFamily.primary, fontSize: 16, fontWeight: "600",
    color: Colors.stagePink,
  },
  cardWord: {
    fontFamily: FontFamily.chinese, fontSize: 14,
    color: Colors.textSecondary,
  },
  playingBadge: {
    position: 'absolute', top: 6, right: 6, fontSize: 16,
  },
  starBadge: {
    position: 'absolute', bottom: 6, fontSize: 10, color: '#F59E0A',
  },
  hint: {
    fontFamily: FontFamily.primary, fontSize: 13, color: Colors.stagePink,
    paddingHorizontal: Spacing.pagePadding, marginTop: 20, textAlign: 'center',
  },
  hint2: {
    fontFamily: FontFamily.primary, fontSize: 13, color: '#F59E0A',
    paddingHorizontal: Spacing.pagePadding, marginTop: 4, textAlign: 'center',
  },
  backBtn: {
    marginTop: 20, marginHorizontal: Spacing.pagePadding,
    paddingVertical: 12, alignItems: 'center',
    backgroundColor: Colors.pureWhite, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.borderSubtle,
  },
  backText: {
    fontFamily: FontFamily.primary, fontSize: 14, fontWeight: "500",
    color: Colors.textSecondary,
  },
});
