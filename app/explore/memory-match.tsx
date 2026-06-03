// 拼音消消乐 - 记忆翻牌配对游戏
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { playPinyin, playLetter } from '@/services/audio';
import { useProgress } from '@/services/progress';
import { getLevelById, getAllLevels } from '@/data/curriculum';
import type { LevelData } from '@/data/types';

interface MatchCard {
  id: string;
  pairId: string;       // 配对ID，两个相同pairId的卡牌是一对
  type: 'pinyin' | 'char';  // 拼音卡 / 汉字卡
  display: string;       // 显示内容
  letter?: string;       // 对应字母（用于发音）
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateCards(completedLevels: string[], pairCount: number): MatchCard[] {
  const allLevels = getAllLevels();
  const learned = completedLevels.length > 0
    ? allLevels.filter(l => completedLevels.includes(l.id))
    : allLevels.slice(0, 20);

  const pool = shuffle(learned);
  const cards: MatchCard[] = [];

  for (const level of pool) {
    if (cards.length >= pairCount * 2) break;
    if (!level.pinyin || !level.example) continue;

    cards.push({
      id: `pinyin-${level.id}`,
      pairId: level.id,
      type: 'pinyin',
      display: level.pinyin,
      letter: level.letter,
    });
    cards.push({
      id: `char-${level.id}`,
      pairId: level.id,
      type: 'char',
      display: level.example,
      letter: level.letter,
    });
  }

  return shuffle(cards);
}

export default function MemoryMatchPage() {
  const { progress } = useProgress();
  const [phase, setPhase] = useState<'ready' | 'playing' | 'result'>('ready');
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [firstPick, setFirstPick] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [mismatchShake, setMismatchShake] = useState(false);
  const matchAnim = useRef(new Animated.Value(0)).current;

  const pairCount = 6; // 6对 = 12张卡
  const totalPairs = pairCount;

  const startGame = () => {
    const newCards = generateCards(progress.completedLevels, pairCount);
    setCards(newCards);
    setFlipped(new Set());
    setMatched(new Set());
    setFirstPick(null);
    setScore(0);
    setMoves(0);
    setCombo(0);
    setMaxCombo(0);
    setIsChecking(false);
    setPhase('playing');
  };

  const handleCardPress = (card: MatchCard) => {
    // 忽略已翻开、已配对、或正在检查中的卡牌
    if (flipped.has(card.id) || matched.has(card.pairId) || isChecking) return;

    // 播放发音
    try {
      if (card.type === 'char') {
        playPinyin(card.display, { rate: 0.5 });
      } else if (card.letter) {
        playLetter(card.letter, { rate: 0.5 });
      }
    } catch {}

    const newFlipped = new Set(flipped);
    newFlipped.add(card.id);
    setFlipped(newFlipped);

    if (!firstPick) {
      // 第一张牌
      setFirstPick(card.id);
    } else {
      // 第二张牌 - 检查配对
      setMoves(m => m + 1);
      setIsChecking(true);

      const firstCard = cards.find(c => c.id === firstPick);
      const isMatch = firstCard && firstCard.pairId === card.pairId;

      if (isMatch) {
        // 配对成功
        const newCombo = combo + 1;
        const newMaxCombo = Math.max(maxCombo, newCombo);
        const comboBonus = Math.min(newCombo - 1, 3) * 5; // 连击奖励
        setScore(s => s + 10 + comboBonus);
        setCombo(newCombo);
        setMaxCombo(newMaxCombo);

        // 配对成功动画
        matchAnim.setValue(0);
        Animated.sequence([
          Animated.timing(matchAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
          Animated.timing(matchAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]).start();

        setTimeout(() => {
          const newMatched = new Set(matched);
          newMatched.add(card.pairId);
          setMatched(newMatched);
          setFlipped(new Set()); // 清除所有翻开状态
          setFirstPick(null);
          setIsChecking(false);

          // 检查是否全部完成
          if (newMatched.size === totalPairs) {
            setTimeout(() => setPhase('result'), 500);
          }
        }, 600);
      } else {
        // 配对失败
        setCombo(0);
        setMismatchShake(true);
        setTimeout(() => setMismatchShake(false), 500);

        setTimeout(() => {
          setFlipped(new Set()); // 翻回所有牌
          setFirstPick(null);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  // 准备阶段
  if (phase === 'ready') {
    return (
      <View style={styles.container}>
        <View style={styles.readyContent}>
          <Text style={styles.readyEmoji}>🃏</Text>
          <Text style={styles.readyTitle}>拼音消消乐</Text>
          <Text style={styles.readyDesc}>翻开卡牌，找出拼音和汉字的正确配对！</Text>
          <View style={styles.readyRules}>
            <Text style={styles.ruleItem}>🃏 共 12 张卡牌（6 对）</Text>
            <Text style={styles.ruleItem}>👆 每次翻两张，配对成功保留</Text>
            <Text style={styles.ruleItem}>🔥 连续配对有连击奖励</Text>
            <Text style={styles.ruleItem}>🧠 考记忆力和拼音认知</Text>
          </View>
          <TouchableOpacity style={styles.startBtn} onPress={startGame}>
            <Text style={styles.startText}>开始游戏</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backText}>← 返回</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 结果阶段
  if (phase === 'result') {
    const stars = moves <= 8 ? 3 : moves <= 12 ? 2 : 1;
    return (
      <View style={styles.container}>
        <View style={styles.resultContent}>
          <Text style={styles.resultEmoji}>{stars === 3 ? '🏆' : stars === 2 ? '🎉' : '💪'}</Text>
          <Text style={styles.resultTitle}>全部配对成功！</Text>
          <Text style={styles.resultStars}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</Text>
          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>得分</Text>
              <Text style={styles.resultValue}>{score} 分</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>翻牌次数</Text>
              <Text style={[styles.resultValue, { color: moves <= 8 ? Colors.successGreen : Colors.stageGold }]}>{moves} 次</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>最大连击</Text>
              <Text style={[styles.resultValue, { color: Colors.stagePink }]}>{maxCombo} 连击</Text>
            </View>
          </View>
          <View style={styles.resultBtns}>
            <TouchableOpacity style={styles.replayBtn} onPress={startGame}>
              <Text style={styles.replayText}>再玩一次</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.homeBtn} onPress={() => router.navigate('/(tabs)' as any)}>
              <Text style={styles.homeText}>🏠 回到首页</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // 游戏阶段
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setPhase('result')}>
          <Text style={styles.backBtn}>← 退出</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>拼音消消乐</Text>
        <Text style={styles.headerScore}>{score}分</Text>
      </View>

      {/* 状态栏 */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>配对</Text>
          <Text style={styles.statusValue}>{matched.size}/{totalPairs}</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>翻牌</Text>
          <Text style={styles.statusValue}>{moves}次</Text>
        </View>
        {combo >= 2 && (
          <View style={styles.comboBadge}>
            <Text style={styles.comboText}>🔥 {combo}连击!</Text>
          </View>
        )}
      </View>

      {/* 配对进度条 */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(matched.size / totalPairs) * 100}%` }]} />
      </View>

      {/* 卡牌网格 */}
      <View style={styles.grid}>
        {cards.map((card, idx) => {
          const isFlipped = flipped.has(card.id) || matched.has(card.pairId);
          const isMatched = matched.has(card.pairId);
          const showMismatch = mismatchShake && flipped.has(card.id) && !matched.has(card.pairId) && firstPick !== card.id;

          return (
            <Animated.View
              key={card.id}
              style={[
                styles.cardWrapper,
                isMatched && styles.cardMatched,
                showMismatch && styles.cardShake,
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleCardPress(card)}
                disabled={isMatched}
              >
                <View style={[styles.card, isFlipped ? styles.cardFlipped : styles.cardHidden, isMatched && styles.cardMatchedBg]}>
                  {isFlipped ? (
                    <View style={styles.cardFront}>
                      <Text style={[
                        styles.cardDisplay,
                        card.type === 'pinyin' ? styles.cardPinyin : styles.cardChar,
                      ]}>
                        {card.display}
                      </Text>
                      <Text style={styles.cardTag}>
                        {card.type === 'pinyin' ? '拼音' : '汉字'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.cardBack}>
                      <Text style={styles.cardBackEmoji}>✨</Text>
                      <Text style={styles.cardBackText}>{idx + 1}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBackground },
  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.pagePadding, paddingTop: 56, paddingBottom: 12,
    backgroundColor: Colors.pureWhite,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
  },
  backBtn: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout,
    color: Colors.magicPurple, fontWeight: FontWeights.medium,
  },
  headerTitle: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.title3,
    fontWeight: FontWeights.medium, color: Colors.textPrimary,
  },
  headerScore: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.title3,
    fontWeight: FontWeights.medium, color: Colors.stagePink,
  },
  // 状态栏
  statusBar: {
    flexDirection: 'row', justifyContent: 'center', gap: 24,
    paddingVertical: 12, paddingHorizontal: Spacing.pagePadding,
    alignItems: 'center',
  },
  statusItem: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  statusLabel: {
    fontFamily: FontFamily.primary, fontSize: 13,
    color: Colors.textSecondary,
  },
  statusValue: {
    fontFamily: FontFamily.primary, fontSize: 15,
    fontWeight: FontWeights.medium, color: Colors.textPrimary,
  },
  comboBadge: {
    backgroundColor: 'rgba(237,71,153,0.1)',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
  },
  comboText: {
    fontFamily: FontFamily.primary, fontSize: 14,
    fontWeight: "700", color: Colors.stagePink,
  },
  // 进度条
  progressTrack: {
    height: 6, backgroundColor: Colors.borderSubtle, borderRadius: 3,
    marginHorizontal: Spacing.pagePadding,
  },
  progressFill: {
    height: 6, backgroundColor: Colors.successGreen, borderRadius: 3,
  },
  // 卡牌网格
  grid: {
    flex: 1, flexDirection: 'row', flexWrap: 'wrap',
    padding: Spacing.pagePadding, gap: 10,
    justifyContent: 'center', alignContent: 'center',
  },
  cardWrapper: {
    width: '30%',
    maxWidth: 120,
    aspectRatio: 0.8,
  },
  cardMatched: {
    opacity: 0.6,
  },
  cardShake: {
    // 抖动效果通过 mismatchShake state 触发
  },
  card: {
    width: '100%', height: '100%',
    borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  cardHidden: {
    backgroundColor: Colors.magicPurple,
    borderWidth: 2, borderColor: Colors.glowPurple,
    shadowColor: 'rgba(140,92,245,0.25)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 3,
  },
  cardFlipped: {
    backgroundColor: Colors.pureWhite,
    borderWidth: 2, borderColor: Colors.successGreen,
    shadowColor: 'rgba(15,186,130,0.15)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 3,
  },
  cardMatchedBg: {
    backgroundColor: Colors.successGreen + '08',
    borderColor: Colors.successGreen,
  },
  // 卡背
  cardBack: {
    alignItems: 'center', gap: 4,
  },
  cardBackEmoji: { fontSize: 28 },
  cardBackText: {
    fontFamily: FontFamily.primary, fontSize: 14,
    color: 'rgba(255,255,255,0.5)', fontWeight: "600",
  },
  // 卡正面
  cardFront: {
    alignItems: 'center', gap: 4,
  },
  cardDisplay: {
    fontFamily: FontFamily.primary, fontWeight: "800",
  },
  cardPinyin: {
    fontSize: 26, color: Colors.magicPurple,
  },
  cardChar: {
    fontSize: 32, color: Colors.textPrimary,
    fontFamily: FontFamily.chinese,
  },
  cardTag: {
    fontFamily: FontFamily.primary, fontSize: 10,
    color: Colors.textSecondary,
    backgroundColor: Colors.pageBackground,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6,
  },
  // Ready
  readyContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: Spacing.pagePadding, gap: 16,
  },
  readyEmoji: { fontSize: 64 },
  readyTitle: {
    fontFamily: FontFamily.primary, fontSize: 28, fontWeight: "800",
    color: Colors.stagePink,
  },
  readyDesc: {
    fontFamily: FontFamily.primary, fontSize: 16,
    color: Colors.textSecondary, textAlign: 'center',
  },
  readyRules: {
    backgroundColor: Colors.pureWhite,
    borderRadius: 16, padding: 20, width: '100%',
    gap: 10,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2,
  },
  ruleItem: {
    fontFamily: FontFamily.primary, fontSize: 15,
    color: Colors.textPrimary, lineHeight: 22,
  },
  startBtn: {
    backgroundColor: Colors.stagePink,
    borderRadius: 20, paddingVertical: 16, paddingHorizontal: 48,
    shadowColor: 'rgba(237,71,153,0.30)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16, elevation: 5,
  },
  startText: {
    fontFamily: FontFamily.primary, fontSize: 18, fontWeight: "700",
    color: Colors.pureWhite,
  },
  backLink: { marginTop: 8 },
  backText: {
    fontFamily: FontFamily.primary, fontSize: 15, color: Colors.textSecondary,
  },
  // Result
  resultContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: Spacing.pagePadding, gap: 16,
  },
  resultEmoji: { fontSize: 64 },
  resultTitle: {
    fontFamily: FontFamily.primary, fontSize: 24, fontWeight: "800",
    color: Colors.stagePink,
  },
  resultStars: { fontSize: 36, letterSpacing: 8 },
  resultCard: {
    width: '100%', backgroundColor: Colors.pureWhite,
    borderRadius: 16, padding: Spacing.cardPadding,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2,
  },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing.gapSM,
  },
  resultLabel: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout,
    color: Colors.textSecondary,
  },
  resultValue: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.title3,
    fontWeight: FontWeights.medium, color: Colors.stagePink,
  },
  resultDivider: { height: 1, backgroundColor: Colors.borderSubtle },
  resultBtns: { width: '100%', gap: 12, marginTop: 16 },
  replayBtn: {
    backgroundColor: Colors.stagePink,
    borderRadius: 16, paddingVertical: 14, alignItems: 'center',
    shadowColor: 'rgba(237,71,153,0.25)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4,
  },
  replayText: {
    fontFamily: FontFamily.primary, fontSize: 16, fontWeight: "600",
    color: Colors.pureWhite,
  },
  homeBtn: {
    paddingVertical: 14, alignItems: 'center',
    backgroundColor: Colors.pureWhite, borderRadius: 16,
    borderWidth: 1.5, borderColor: Colors.stagePink,
  },
  homeText: {
    fontFamily: FontFamily.primary, fontSize: 15, fontWeight: "600",
    color: Colors.stagePink,
  },
});
