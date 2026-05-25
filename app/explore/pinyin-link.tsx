// 21-拼音连连看 - 配对拼音和对应汉字
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { playPinyin } from '@/services/audio';

// 连连看配对数据
interface PairItem {
  id: string;
  pinyin: string;
  char: string;
  sound: string;
}

const PAIR_DATA: PairItem[] = [
  { id: '1', pinyin: 'bā', char: '八', sound: 'bā' },
  { id: '2', pinyin: 'mā', char: '妈', sound: 'mā' },
  { id: '3', pinyin: 'dà', char: '大', sound: 'dà' },
  { id: '4', pinyin: 'gē', char: '歌', sound: 'gē' },
  { id: '5', pinyin: 'hé', char: '河', sound: 'hé' },
  { id: '6', pinyin: 'jī', char: '鸡', sound: 'jī' },
  { id: '7', pinyin: 'yuè', char: '月', sound: 'yuè' },
  { id: '8', pinyin: 'huā', char: '花', sound: 'huā' },
  { id: '9', pinyin: 'yǔ', char: '雨', sound: 'yǔ' },
  { id: '10', pinyin: 'niǎo', char: '鸟', sound: 'niǎo' },
  { id: '11', pinyin: 'māo', char: '猫', sound: 'māo' },
  { id: '12', pinyin: 'yú', char: '鱼', sound: 'yú' },
];

type CardType = {
  id: string;
  pairId: string;
  text: string;
  type: 'pinyin' | 'char';
  matched: boolean;
};

function generateCards(count: number): CardType[] {
  const selected = PAIR_DATA.slice(0, count);
  const cards: CardType[] = [];

  selected.forEach((item) => {
    cards.push({ id: `p-${item.id}`, pairId: item.id, text: item.pinyin, type: 'pinyin', matched: false });
    cards.push({ id: `c-${item.id}`, pairId: item.id, text: item.char, type: 'char', matched: false });
  });

  // 洗牌
  return cards.sort(() => Math.random() - 0.5);
}

export default function PinyinLinkPage() {
  const [cards, setCards] = useState<CardType[]>(() => generateCards(6));
  const [selected1, setSelected1] = useState<string | null>(null);
  const [selected2, setSelected2] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [checking, setChecking] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const totalPairs = cards.length / 2;

  const handleCardPress = async (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.matched || checking) return;

    // 不能选两个同类型
    if (selected1) {
      const firstCard = cards.find((c) => c.id === selected1);
      if (firstCard && firstCard.type === card.type) return;
    }

    if (!selected1) {
      setSelected1(cardId);
      // 播放拼音声音
      if (card.type === 'pinyin') {
        try { await playPinyin(card.text, { rate: 0.5 }); } catch {}
      }
    } else {
      setSelected2(cardId);
      setChecking(true);
      setMoves((m) => m + 1);

      const firstCard = cards.find((c) => c.id === selected1)!;
      const secondCard = card;

      if (firstCard.pairId === secondCard.pairId) {
        // 匹配成功
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === firstCard.pairId ? { ...c, matched: true } : c,
            ),
          );
          setMatchedPairs((p) => p + 1);
          setSelected1(null);
          setSelected2(null);
          setChecking(false);

          if (matchedPairs + 1 >= totalPairs) {
            setGameOver(true);
          }
        }, 400);
      } else {
        // 匹配失败 - 抖动
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 4, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();

        setTimeout(() => {
          setSelected1(null);
          setSelected2(null);
          setChecking(false);
        }, 800);
      }
    }
  };

  const resetGame = () => {
    setCards(generateCards(6));
    setSelected1(null);
    setSelected2(null);
    setMatchedPairs(0);
    setMoves(0);
    setGameOver(false);
    setChecking(false);
  };

  if (gameOver) {
    const stars = moves <= totalPairs + 2 ? 3 : moves <= totalPairs + 5 ? 2 : 1;
    return (
      <View style={styles.container}>
        <View style={styles.resultContent}>
          <Text style={styles.resultEmoji}>{stars === 3 ? '🎉' : stars === 2 ? '👍' : '💪'}</Text>
          <Text style={styles.resultTitle}>全部配对成功！</Text>
          <Text style={styles.resultStars}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</Text>
          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>配对</Text>
              <Text style={[styles.resultValue, { color: Colors.successGreen }]}>{totalPairs}/{totalPairs}</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>步数</Text>
              <Text style={styles.resultValue}>{moves} 步</Text>
            </View>
          </View>
          <View style={styles.resultBtns}>
            <TouchableOpacity style={styles.replayBtn} onPress={resetGame}>
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← 退出</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>拼音连连看</Text>
        <Text style={styles.statsText}>{matchedPairs}/{totalPairs}</Text>
      </View>

      {/* Info */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>🎯 配对拼音和对应的汉字</Text>
        <Text style={styles.infoText}>步数: {moves}</Text>
      </View>

      {/* Game Grid */}
      <Animated.View style={[styles.grid, { transform: [{ translateX: shakeAnim }] }]}>
        {cards.map((card) => {
          const isSelected = selected1 === card.id || selected2 === card.id;
          const isPinyin = card.type === 'pinyin';

          return (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card,
                isPinyin ? styles.cardPinyin : styles.cardChar,
                isSelected && styles.cardSelected,
                card.matched && styles.cardMatched,
              ]}
              activeOpacity={0.8}
              onPress={() => handleCardPress(card.id)}
              disabled={card.matched}
            >
              {card.matched ? (
                <Text style={styles.cardCheck}>✅</Text>
              ) : (
                <Text style={[
                  styles.cardText,
                  isPinyin ? styles.cardTextPinyin : styles.cardTextChar,
                  isSelected && styles.cardTextSelected,
                ]}>
                  {card.text}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* Hint */}
      <View style={styles.hintBox}>
        <Text style={styles.hintText}>💡 先点拼音，再点对应的汉字</Text>
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
  statsText: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout,
    color: Colors.magicPurple, fontWeight: FontWeights.medium,
  },
  infoBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: Spacing.pagePadding, paddingVertical: 10,
  },
  infoText: {
    fontFamily: FontFamily.primary, fontSize: 13, color: Colors.textSecondary,
  },
  // Grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    padding: Spacing.pagePadding,
    justifyContent: 'center',
  },
  card: {
    width: '29%', aspectRatio: 1,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2,
    borderWidth: 2.5, borderColor: Colors.borderDefault,
  },
  cardPinyin: { backgroundColor: '#F0EBFF' },
  cardChar: { backgroundColor: '#FFF8E1' },
  cardSelected: {
    borderColor: Colors.magicPurple,
    transform: [{ scale: 1.05 }],
  },
  cardMatched: {
    backgroundColor: Colors.successGreen + '20',
    borderColor: Colors.successGreen,
    opacity: 0.7,
  },
  cardText: {
    fontFamily: FontFamily.primary, fontWeight: "800",
  },
  cardTextPinyin: { fontSize: 24, color: Colors.magicPurple },
  cardTextChar: { fontFamily: FontFamily.chinese, fontSize: 28, color: Colors.stageGold },
  cardTextSelected: { color: Colors.magicPurple },
  cardCheck: { fontSize: 24 },
  // Hint
  hintBox: {
    padding: Spacing.pagePadding, alignItems: 'center',
  },
  hintText: {
    fontFamily: FontFamily.primary, fontSize: 13, color: Colors.textSecondary,
  },
  // Result
  resultContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: Spacing.pagePadding, gap: 16,
  },
  resultEmoji: { fontSize: 64 },
  resultTitle: {
    fontFamily: FontFamily.primary, fontSize: 24, fontWeight: "800",
    color: Colors.magicPurple,
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
    fontWeight: FontWeights.medium, color: Colors.magicPurple,
  },
  resultDivider: { height: 1, backgroundColor: Colors.borderSubtle },
  resultBtns: { width: '100%', gap: 12, marginTop: 16 },
  replayBtn: {
    backgroundColor: Colors.magicPurple,
    borderRadius: 16, paddingVertical: 14, alignItems: 'center',
  },
  replayText: {
    fontFamily: FontFamily.primary, fontSize: 16, fontWeight: "600",
    color: Colors.pureWhite,
  },
  homeBtn: {
    paddingVertical: 14, alignItems: 'center',
    backgroundColor: Colors.pureWhite, borderRadius: 16,
    borderWidth: 1.5, borderColor: Colors.glowPurple,
  },
  homeText: {
    fontFamily: FontFamily.primary, fontSize: 15, fontWeight: "600",
    color: Colors.magicPurple,
  },
});
