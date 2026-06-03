// 12-游戏：找不同大挑战 - 比较相似拼音字母
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { playLetter } from '@/services/audio';
import { useProgress } from '@/services/progress';
import { getLevelById } from '@/data/curriculum';

// 找不同题目：每组2个相似字母，目标是正确的一个
const DIFF_ROUNDS = [
  { pair: ['b', 'd'], target: 'b', hint: 'b 像大拇指，d 像小屁股' },
  { pair: ['p', 'q'], target: 'p', hint: 'p 像气球向下飘，q 像气球向上飞' },
  { pair: ['n', 'u'], target: 'n', hint: 'n 像一扇门，u 像一个小碗' },
  { pair: ['f', 't'], target: 'f', hint: 'f 像拐杖，t 像小伞' },
  { pair: ['zh', 'ch'], target: 'zh', hint: 'zh 发音短，ch 送气多' },
  { pair: ['z', 'c'], target: 'z', hint: 'z 不送气，c 用力吐气' },
  { pair: ['sh', 'r'], target: 'sh', hint: 'sh 像"嘘"，r 像卷舌' },
  { pair: ['m', 'w'], target: 'm', hint: 'm 嘴巴紧闭，w 嘴巴圆圆的' },
  { pair: ['g', 'k'], target: 'g', hint: 'g 不送气，k 用力吐气' },
  { pair: ['j', 'q'], target: 'j', hint: 'j 不送气，q 用力吹气' },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateAdaptiveRounds(completedLevels: string[]): typeof DIFF_ROUNDS {
  const learnedLetters = new Set(
    completedLevels.map(id => getLevelById(id)?.letter).filter(Boolean) as string[]
  );

  // 优先选择与已学字母相关的题目
  const relevant = DIFF_ROUNDS.filter(r =>
    learnedLetters.has(r.pair[0]) || learnedLetters.has(r.pair[1])
  );

  if (relevant.length >= 5) {
    return shuffle(relevant);
  }

  // 不足时混合默认题库
  const usedPairs = new Set(relevant.map(r => r.pair.join('-')));
  const remaining = DIFF_ROUNDS.filter(r => !usedPairs.has(r.pair.join('-')));
  const needed = Math.max(0, 10 - relevant.length);
  return shuffle([...relevant, ...remaining.slice(0, needed)]);
}

export default function FindDiffPage() {
  const { progress } = useProgress();
  const [rounds, setRounds] = useState(() => generateAdaptiveRounds(progress.completedLevels));
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [found, setFound] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const roundAnim = useRef(new Animated.Value(0)).current;

  const totalRounds = rounds.length;
  const currentRound = rounds[round];

  // 计时器
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setGameOver(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  // 轮次切换动画
  useEffect(() => {
    roundAnim.setValue(0);
    Animated.timing(roundAnim, {
      toValue: 1, duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [round]);

  const handleSelect = async (letter: string) => {
    if (showResult || gameOver) return;

    // 播放字母发音
    try { await playLetter(letter, { rate: 0.5 }); } catch {}

    setSelected(letter);
    setShowResult(true);

    const correct = letter === currentRound.target;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 10);
      setFound((f) => f + 1);
    } else {
      // 抖动动画
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }

    // 延迟进入下一轮
    setTimeout(() => {
      if (round < totalRounds - 1) {
        setRound((r) => r + 1);
        setSelected(null);
        setShowResult(false);
      } else {
        setGameOver(true);
      }
    }, correct ? 800 : 1500);
  };

  // 游戏结束
  if (gameOver) {
    const stars = found >= 8 ? 3 : found >= 5 ? 2 : 1;
    return (
      <View style={styles.container}>
        <View style={styles.resultContent}>
          <Text style={styles.resultEmoji}>{stars === 3 ? '🎉' : stars === 2 ? '👍' : '💪'}</Text>
          <Text style={styles.resultTitle}>游戏结束！</Text>
          <Text style={styles.resultStars}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</Text>
          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>得分</Text>
              <Text style={styles.resultValue}>{score} 分</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>找到</Text>
              <Text style={[styles.resultValue, { color: Colors.successGreen }]}>{found}/{totalRounds}</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>用时</Text>
              <Text style={styles.resultValue}>{60 - timeLeft} 秒</Text>
            </View>
          </View>
          <View style={styles.resultBtns}>
            <TouchableOpacity style={styles.replayBtn} onPress={() => {
              const newRounds = generateAdaptiveRounds(progress.completedLevels);
              setRounds(newRounds);
              setRound(0); setScore(0); setFound(0);
              setSelected(null); setShowResult(false);
              setGameOver(false); setTimeLeft(60);
            }}>
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
        <Text style={styles.headerTitle}>找不同大挑战</Text>
        <Text style={styles.timer}>{timeLeft}s</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={styles.progressLabel}>
          <Text style={styles.progressText}>第 {round + 1}/{totalRounds} 关</Text>
          <Text style={styles.scoreText}>得分: {score}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((round) / totalRounds) * 100}%` }]} />
        </View>
        <View style={styles.progressDots}>
          {rounds.map((_, i) => (
            <View key={i} style={[styles.dot, i < round && styles.dotDone, i === round && styles.dotCurrent]} />
          ))}
        </View>
      </View>

      {/* Game Area */}
      <Animated.View style={[styles.gameArea, {
        opacity: roundAnim,
        transform: [{ scale: roundAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
      }]}>
        {/* Question */}
        <View style={styles.questionBox}>
          <Text style={styles.questionIcon}>🔍</Text>
          <Text style={styles.questionText}>找出字母 <Text style={styles.questionTarget}>{currentRound.target}</Text></Text>
          <Text style={styles.questionHint}>{currentRound.hint}</Text>
        </View>

        {/* Options */}
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeAnim }] }]}>
          {currentRound.pair.map((letter) => {
            const isSelected = selected === letter;
            const showCorrect = showResult && letter === currentRound.target;
            const showWrong = showResult && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={letter}
                style={[
                  styles.optionCard,
                  showCorrect && styles.optionCorrect,
                  showWrong && styles.optionWrong,
                  isSelected && !showResult && styles.optionSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelect(letter)}
                disabled={showResult}
              >
                <Text style={[
                  styles.optionLetter,
                  showCorrect && styles.optionLetterCorrect,
                  showWrong && styles.optionLetterWrong,
                ]}>
                  {letter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Feedback */}
        {showResult && (
          <View style={[styles.feedbackBox, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={styles.feedbackEmoji}>{isCorrect ? '✅' : '❌'}</Text>
            <Text style={styles.feedbackText}>
              {isCorrect ? '找对了！真棒！' : `不对哦，正确答案是「${currentRound.target}」`}
            </Text>
          </View>
        )}
      </Animated.View>
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
  timer: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.title3,
    fontWeight: FontWeights.medium, color: Colors.stagePink,
  },
  // Progress
  progressBar: { padding: Spacing.pagePadding, gap: 8 },
  progressLabel: {
    flexDirection: 'row', justifyContent: 'space-between',
  },
  progressText: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout,
    color: Colors.textSecondary,
  },
  scoreText: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout,
    fontWeight: FontWeights.medium, color: Colors.magicPurple,
  },
  progressTrack: {
    height: 6, backgroundColor: Colors.borderSubtle, borderRadius: 3,
  },
  progressFill: {
    height: 6, backgroundColor: Colors.magicPurple, borderRadius: 3,
  },
  progressDots: {
    flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 4,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.borderDefault,
  },
  dotDone: { backgroundColor: Colors.successGreen },
  dotCurrent: { backgroundColor: Colors.magicPurple, width: 10, height: 10, borderRadius: 5 },
  // Game
  gameArea: {
    flex: 1, padding: Spacing.pagePadding,
    alignItems: 'center', justifyContent: 'center', gap: 24,
  },
  questionBox: {
    backgroundColor: Colors.pureWhite, borderRadius: 20,
    padding: 24, alignItems: 'center', gap: 8,
    width: '100%', maxWidth: 340,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2,
  },
  questionIcon: { fontSize: 40 },
  questionText: {
    fontFamily: FontFamily.primary, fontSize: 20, fontWeight: "600",
    color: Colors.textPrimary, textAlign: 'center',
  },
  questionTarget: {
    color: Colors.magicPurple, fontWeight: "800", fontSize: 28,
  },
  questionHint: {
    fontFamily: FontFamily.primary, fontSize: 14,
    color: Colors.textSecondary, textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row', gap: 20, justifyContent: 'center',
  },
  optionCard: {
    width: 140, height: 160,
    backgroundColor: Colors.pureWhite, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.borderDefault,
    shadowColor: 'rgba(140,92,245,0.10)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 3,
  },
  optionSelected: { borderColor: Colors.magicPurple },
  optionCorrect: {
    borderColor: Colors.successGreen,
    backgroundColor: Colors.successGreen + '10',
  },
  optionWrong: {
    borderColor: Colors.errorRed,
    backgroundColor: Colors.errorRed + '10',
  },
  optionLetter: {
    fontFamily: FontFamily.primary, fontSize: 56, fontWeight: "800",
    color: Colors.textPrimary,
  },
  optionLetterCorrect: { color: Colors.successGreen },
  optionLetterWrong: { color: Colors.errorRed },
  // Feedback
  feedbackBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16,
  },
  feedbackCorrect: { backgroundColor: Colors.successGreen + '15' },
  feedbackWrong: { backgroundColor: Colors.errorRed + '15' },
  feedbackEmoji: { fontSize: 24 },
  feedbackText: {
    fontFamily: FontFamily.primary, fontSize: 16, fontWeight: "600",
    color: Colors.textPrimary,
  },
  // Result
  resultContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: Spacing.pagePadding, gap: 16,
  },
  resultEmoji: { fontSize: 64 },
  resultTitle: {
    fontFamily: FontFamily.primary, fontSize: 28, fontWeight: "800",
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
  resultBtns: {
    width: '100%', gap: 12, marginTop: 16,
  },
  replayBtn: {
    backgroundColor: Colors.magicPurple,
    borderRadius: 16, paddingVertical: 14, alignItems: 'center',
    shadowColor: 'rgba(140,92,245,0.25)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4,
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
