// 认读圣殿 - 整体认读音节互动探索区
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { getStageLevelsWithIndex } from '@/data/curriculum';
import { useProgress } from '@/services/progress';
import { playPinyin } from '@/services/audio';
import type { LevelData } from '@/data/types';

// 整体认读音节分组
const SYLLABLE_GROUPS = [
  {
    name: '翘舌音组',
    desc: '舌尖翘起，一口气读完',
    range: [0, 3],
    color: '#FF6B6B',
    emoji: '👅',
  },
  {
    name: '平舌音组',
    desc: '舌尖放平，直接认读',
    range: [4, 6],
    color: '#4ECDC4',
    emoji: '😛',
  },
  {
    name: '特殊音节组',
    desc: 'y/w 开头的整体认读',
    range: [7, 10],
    color: '#A78BFA',
    emoji: '✨',
  },
];

const TEMPLE_COLOR = '#F59E0A';

export default function ReadingTemplePage() {
  const levels = getStageLevelsWithIndex('reading-temple');
  const { progress } = useProgress();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePlay = async (level: LevelData) => {
    setPlayingId(level.id);
    try { await playPinyin(level.pinyin, { rate: 0.4 }); } catch {}
    setTimeout(() => setPlayingId(null), 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 顶部关闭按钮 */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.navigate('/(tabs)')}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🏛️</Text>
        <Text style={styles.headerTitle}>认读魔法圣殿</Text>
        <Text style={styles.headerSub}>整体认读音节 · 不用拼，一口读出</Text>
      </View>

      {/* 圣殿核心口诀 */}
      <View style={styles.mantraBox}>
        <Text style={styles.mantraTitle}>🎯 核心口诀</Text>
        <Text style={styles.mantraText}>整体认读音节不用拼，看到就会读，一口读出来！</Text>
        <Text style={styles.mantraHint}>zh ch sh r · z c s · y w ye yu</Text>
      </View>

      {/* 分组卡片 */}
      {SYLLABLE_GROUPS.map((group) => (
        <View key={group.name} style={styles.groupSection}>
          <View style={[styles.groupHeader, { borderLeftColor: group.color }]}>
            <Text style={styles.groupEmoji}>{group.emoji}</Text>
            <View>
              <Text style={[styles.groupName, { color: group.color }]}>{group.name}</Text>
              <Text style={styles.groupDesc}>{group.desc}</Text>
            </View>
          </View>
          <View style={styles.grid}>
            {levels.slice(group.range[0], group.range[1] + 1).map((level) => {
              const isDone = progress.completedLevels.includes(level.id);
              const isPlaying = playingId === level.id;
              const stars = progress.starRatings[level.id] || 0;

              return (
                <TouchableOpacity
                  key={level.id}
                  style={[styles.card, isDone && styles.cardDone]}
                  activeOpacity={0.8}
                  onPress={() => handlePlay(level)}
                  onLongPress={() => router.push(`/learn/new-sound?id=${level.id}` as any)}
                >
                  {/* 魔法光晕背景 */}
                  <View style={[styles.cardGlow, { backgroundColor: group.color + '12' }]} />

                  {/* 拼音大字 */}
                  <View style={[styles.cardBadge, { backgroundColor: group.color + '18' }]}>
                    <Text style={[styles.cardLetter, { color: group.color }]}>{level.letter}</Text>
                  </View>

                  {/* 发音 + 例字 */}
                  <Text style={[styles.cardPinyin, { color: TEMPLE_COLOR }]}>{level.pinyin}</Text>
                  <Text style={styles.cardWord}>{level.example} · {level.word}</Text>

                  {/* 声调标记 */}
                  <View style={[styles.toneDot, { backgroundColor: group.color }]}>
                    <Text style={styles.toneDotText}>{level.tone}声</Text>
                  </View>

                  {isPlaying && <Text style={styles.playingBadge}>🔊</Text>}
                  {isDone && (
                    <View style={styles.starRow}>
                      <Text style={styles.starBadge}>{'★'.repeat(stars)}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      {/* 学习提示 */}
      <View style={styles.tipsBox}>
        <Text style={styles.tipsTitle}>📖 学习小贴士</Text>
        <Text style={styles.tipsText}>💡 翘舌音：舌尖翘起来，像小花猫舔上嘴唇</Text>
        <Text style={styles.tipsText}>💡 平舌音：舌尖放平，轻轻碰到上牙背后</Text>
        <Text style={styles.tipsText}>💡 整体认读：声母+韵母已经"长在一起"，不要拆开拼</Text>
        <Text style={styles.tipsText}>💡 长按卡片可以进入详细学习关卡</Text>
      </View>

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
    backgroundColor: TEMPLE_COLOR,
    paddingVertical: 32,
    paddingHorizontal: Spacing.pagePadding,
    alignItems: 'center',
    gap: 6,
  },
  headerEmoji: { fontSize: 40 },
  headerTitle: {
    fontFamily: FontFamily.primary, fontSize: 24, fontWeight: "800",
    color: Colors.pureWhite,
  },
  headerSub: {
    fontFamily: FontFamily.primary, fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },

  // 口诀区
  mantraBox: {
    marginHorizontal: Spacing.pagePadding, marginTop: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 16, padding: 16,
    borderLeftWidth: 4, borderLeftColor: TEMPLE_COLOR,
    alignItems: 'center', gap: 4,
  },
  mantraTitle: {
    fontFamily: FontFamily.primary, fontSize: 15, fontWeight: "700",
    color: TEMPLE_COLOR,
  },
  mantraText: {
    fontFamily: FontFamily.primary, fontSize: 14, fontWeight: "600",
    color: '#8D6E00', textAlign: 'center',
  },
  mantraHint: {
    fontFamily: FontFamily.primary, fontSize: 12,
    color: '#B8860B', opacity: 0.7,
    letterSpacing: 2,
  },

  // Groups
  groupSection: { marginTop: 20, paddingHorizontal: Spacing.pagePadding },
  groupHeader: {
    borderLeftWidth: 4, paddingLeft: 12,
    marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  groupEmoji: { fontSize: 22 },
  groupName: {
    fontFamily: FontFamily.primary, fontSize: 18, fontWeight: "700",
  },
  groupDesc: {
    fontFamily: FontFamily.primary, fontSize: 13, color: Colors.textSecondary,
    marginTop: 1,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    justifyContent: 'center',
  },
  card: {
    width: '47%', aspectRatio: 1.3,
    backgroundColor: Colors.pureWhite, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', gap: 2,
    borderWidth: 1.5, borderColor: '#FDE68A',
    shadowColor: 'rgba(245,158,10,0.1)',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  cardDone: {
    borderColor: TEMPLE_COLOR,
    backgroundColor: '#FFFDF5',
  },
  cardGlow: {
    position: 'absolute', top: -20, right: -20,
    width: 80, height: 80, borderRadius: 40,
  },
  cardBadge: {
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4,
  },
  cardLetter: {
    fontFamily: FontFamily.primary, fontSize: 28, fontWeight: "800",
  },
  cardPinyin: {
    fontFamily: FontFamily.primary, fontSize: 16, fontWeight: "600",
  },
  cardWord: {
    fontFamily: FontFamily.chinese, fontSize: 13,
    color: Colors.textSecondary,
  },
  toneDot: {
    position: 'absolute', top: 8, left: 8,
    borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2,
    opacity: 0.7,
  },
  toneDotText: {
    fontFamily: FontFamily.primary, fontSize: 9, fontWeight: "700",
    color: Colors.pureWhite,
  },
  playingBadge: {
    position: 'absolute', top: 8, right: 8, fontSize: 16,
  },
  starRow: {
    position: 'absolute', bottom: 6,
  },
  starBadge: {
    fontSize: 10, color: '#F59E0A',
  },

  // 学习提示
  tipsBox: {
    marginHorizontal: Spacing.pagePadding, marginTop: 24,
    backgroundColor: Colors.pureWhite, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#FDE68A',
    gap: 6,
  },
  tipsTitle: {
    fontFamily: FontFamily.primary, fontSize: 15, fontWeight: "700",
    color: TEMPLE_COLOR, marginBottom: 4,
  },
  tipsText: {
    fontFamily: FontFamily.primary, fontSize: 13,
    color: Colors.textSecondary, lineHeight: 20,
  },

  // 返回按钮
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
