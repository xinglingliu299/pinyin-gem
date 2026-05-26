// 声调森林 - 单韵母四声互动探索区
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { getStageLevelsWithIndex } from '@/data/curriculum';
import { useProgress } from '@/services/progress';
import { playPinyin } from '@/services/audio';
import type { LevelData } from '@/data/types';

// 6个单韵母的四声拼音映射
const TONE_PINYIN: Record<string, [string, string, string, string]> = {
  a: ['ā', 'á', 'ǎ', 'à'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
};

const TONE_COLORS = ['#0FBA82', '#388ADE', '#F59E0A', '#ED4799'];
const TONE_SYMBOLS = ['—', '╱', '∨', '╲'];
const TONE_LABELS = ['一声', '二声', '三声', '四声'];

export default function TonesForestPage() {
  const levels = getStageLevelsWithIndex('tones-forest');
  const { progress } = useProgress();
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  // 播放某个声调的拼音
  const handleTonePlay = async (letter: string, toneIdx: number) => {
    const pinyin = TONE_PINYIN[letter]?.[toneIdx];
    if (!pinyin) return;

    const key = `${letter}-${toneIdx}`;
    setPlayingKey(key);
    try { await playPinyin(pinyin, { rate: 0.4 }); } catch {}
    setTimeout(() => setPlayingKey(null), 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 顶部关闭按钮 */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.navigate('/(tabs)')}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.stageGreen }]}>
        <Text style={styles.headerEmoji}>🌳</Text>
        <Text style={styles.headerTitle}>声调魔法森林</Text>
        <Text style={styles.headerSub}>一声平 · 二声扬 · 三声拐弯 · 四声降</Text>
        <Text style={styles.headerCount}>{levels.length} 个单韵母，每个都有 4 种声调</Text>
      </View>

      {/* 四声口诀 */}
      <View style={styles.rhymeRow}>
        {TONE_SYMBOLS.map((sym, i) => (
          <View key={i} style={styles.rhymeItem}>
            <View style={[styles.rhymeSym, { backgroundColor: TONE_COLORS[i] }]}>
              <Text style={styles.rhymeSymText}>{sym}</Text>
            </View>
            <Text style={[styles.rhymeLabel, { color: TONE_COLORS[i] }]}>{TONE_LABELS[i]}</Text>
          </View>
        ))}
      </View>

      {/* 学习关卡 */}
      <Text style={styles.sectionTitle}>🔤 点击声调听发音</Text>

      {levels.map((level) => {
        const isDone = progress.completedLevels.includes(level.id);
        const stars = progress.starRatings[level.id] || 0;

        return (
          <View key={level.id} style={styles.cardWrap}>
            <TouchableOpacity
              style={[styles.card, isDone && styles.cardDone]}
              activeOpacity={0.95}
              onLongPress={() => router.push(`/learn/new-sound?id=${level.id}` as any)}
            >
              {/* 字母大字 */}
              <View style={styles.letterRow}>
                <Text style={[styles.cardLetter, isDone && styles.cardLetterDone]}>
                  {level.letter}
                </Text>
                <View style={styles.wordTag}>
                  <Text style={styles.wordText}>{level.word}</Text>
                </View>
              </View>

              {/* 四声按钮行 */}
              <View style={styles.toneRow}>
                {TONE_SYMBOLS.map((sym, i) => {
                  const toneKey = `${level.letter}-${i}`;
                  const isPlaying = playingKey === toneKey;
                  const pinyin = TONE_PINYIN[level.letter]?.[i] || '';

                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.toneBtn,
                        { borderColor: TONE_COLORS[i] },
                        isPlaying && { backgroundColor: TONE_COLORS[i], borderColor: TONE_COLORS[i] },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => handleTonePlay(level.letter, i)}
                    >
                      {/* 声调符号圆圈 */}
                      <View style={[
                        styles.toneCircle,
                        { backgroundColor: isPlaying ? 'rgba(255,255,255,0.25)' : TONE_COLORS[i] + '15' },
                      ]}>
                        <Text style={[
                          styles.toneSym,
                          { color: isPlaying ? Colors.pureWhite : TONE_COLORS[i] },
                        ]}>{sym}</Text>
                      </View>
                      {/* 拼音文字 */}
                      <Text style={[
                        styles.tonePinyin,
                        { color: isPlaying ? Colors.pureWhite : TONE_COLORS[i] },
                      ]}>{pinyin}</Text>
                      {/* 播放中标识 */}
                      {isPlaying && <Text style={styles.playingBadge}>🔊</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 已完成星级 */}
              {isDone && (
                <View style={styles.starRow}>
                  {[1, 2, 3].map((s) => (
                    <Text key={s} style={styles.star}>{s <= stars ? '★' : '☆'}</Text>
                  ))}
                </View>
              )}
            </TouchableOpacity>

            {/* 操作提示 */}
            <Text style={styles.cardHint}>
              {isDone ? '点击重学' : '点击声调听发音 · 点击字母进入学习'}
            </Text>
          </View>
        );
      })}

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
  closeBtnText: { color: Colors.pureWhite, fontSize: 16, fontWeight: "700" },

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
  headerCount: {
    fontFamily: FontFamily.primary, fontSize: 13, color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },

  // Rhyme row
  rhymeRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 28,
    paddingVertical: 18, backgroundColor: Colors.pureWhite,
    marginHorizontal: Spacing.pagePadding, marginTop: -12,
    borderRadius: 16,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2,
  },
  rhymeItem: { alignItems: 'center', gap: 4 },
  rhymeSym: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  rhymeSymText: { fontSize: 22, fontWeight: "800", color: Colors.pureWhite },
  rhymeLabel: {
    fontFamily: FontFamily.primary, fontSize: 12, fontWeight: "600",
  },

  // Section title
  sectionTitle: {
    fontFamily: FontFamily.primary, fontSize: 18, fontWeight: "700",
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.pagePadding, paddingTop: 24, paddingBottom: 14,
  },

  // Card
  cardWrap: {
    paddingHorizontal: Spacing.pagePadding,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.pureWhite,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 2, borderColor: '#C8F0D8',
    gap: 14,
    shadowColor: 'rgba(15,186,130,0.06)',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2,
  },
  cardDone: {
    borderColor: Colors.stageGreen,
    backgroundColor: '#FBFFFD',
  },

  // Letter row
  letterRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  cardLetter: {
    fontFamily: FontFamily.primary, fontSize: 42, fontWeight: "800",
    color: Colors.textPrimary,
    lineHeight: 50,
  },
  cardLetterDone: { color: Colors.stageGreen },
  wordTag: {
    backgroundColor: '#E8F8F0',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
  },
  wordText: {
    fontFamily: FontFamily.chinese, fontSize: 18, fontWeight: "600",
    color: Colors.stageGreen,
  },

  // Tone buttons row
  toneRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    gap: 8,
  },
  toneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    position: 'relative',
    minHeight: 80,
  },
  toneCircle: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  toneSym: {
    fontSize: 20, fontWeight: "800",
  },
  tonePinyin: {
    fontFamily: FontFamily.primary, fontSize: 16, fontWeight: "700",
  },
  playingBadge: {
    position: 'absolute', top: 4, right: 6,
    fontSize: 14,
  },

  // Star row
  starRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 3,
  },
  star: { fontSize: 14, color: '#F59E0A' },

  // Hint
  cardHint: {
    fontFamily: FontFamily.primary, fontSize: 11, color: Colors.borderDefault,
    textAlign: 'center', marginTop: 6,
  },

  // Back button
  backBtn: {
    marginTop: 8, marginHorizontal: Spacing.pagePadding,
    paddingVertical: 14, alignItems: 'center',
    backgroundColor: Colors.pureWhite, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.borderSubtle,
  },
  backText: {
    fontFamily: FontFamily.primary, fontSize: 14, fontWeight: "500",
    color: Colors.textSecondary,
  },
});
