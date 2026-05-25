// 20-听音配图 - TTS + 选择正确选项
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { playPinyin } from '@/services/audio';

// 题目：读音 + 4个选项（1正确+3错误）
interface RoundData {
  sound: string;
  correct: string;
  options: string[];
}

const LISTEN_ROUNDS: RoundData[] = [
  { sound: 'bā', correct: '八', options: ['八', '趴', '妈', '发'] },
  { sound: 'mā', correct: '妈', options: ['爸', '妈', '发', '大'] },
  { sound: 'dà', correct: '大', options: ['大', '他', '那', '拉'] },
  { sound: 'gē', correct: '歌', options: ['歌', '科', '喝', '车'] },
  { sound: 'jī', correct: '鸡', options: ['鸡', '七', '西', '机'] },
  { sound: 'zhī', correct: '知', options: ['知', '吃', '诗', '资'] },
  { sound: 'hē', correct: '喝', options: ['喝', '歌', '科', '车'] },
  { sound: 'yī', correct: '一', options: ['衣', '一', '鱼', '屋'] },
  { sound: 'wū', correct: '屋', options: ['屋', '一', '鱼', '乌'] },
  { sound: 'yǔ', correct: '雨', options: ['雨', '鱼', '衣', '一'] },
];

export default function ListenMatchPage() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const roundAnim = useRef(new Animated.Value(0)).current;

  const totalRounds = LISTEN_ROUNDS.length;
  const currentRound = LISTEN_ROUNDS[round];

  useEffect(() => {
    roundAnim.setValue(0);
    Animated.timing(roundAnim, {
      toValue: 1, duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [round]);

  // 自动播放第一轮
  useEffect(() => {
    if (round === 0 && !gameOver) {
      handlePlay();
    }
  }, [round]);

  const handlePlay = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await playPinyin(currentRound.sound, { rate: 0.5 });
    } catch (e) {
      // silent
    } finally {
      setIsPlaying(false);
    }
  };

  const handleSelect = (option: string) => {
    if (showResult || gameOver) return;
    setSelected(option);
    setShowResult(true);

    const correct = option === currentRound.correct;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
    }

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

  // 结果页
  if (gameOver) {
    const stars = correctCount >= 8 ? 3 : correctCount >= 5 ? 2 : 1;
    return (
      <View style={styles.container}>
        <View style={styles.resultContent}>
          <Text style={styles.resultEmoji}>{stars === 3 ? '🎉' : stars === 2 ? '👍' : '💪'}</Text>
          <Text style={styles.resultTitle}>听力大闯关完成！</Text>
          <Text style={styles.resultStars}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</Text>
          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>得分</Text>
              <Text style={styles.resultValue}>{score} 分</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>正确</Text>
              <Text style={[styles.resultValue, { color: Colors.successGreen }]}>{correctCount}/{totalRounds}</Text>
            </View>
          </View>
          <View style={styles.resultBtns}>
            <TouchableOpacity style={styles.replayBtn} onPress={() => {
              setRound(0); setScore(0); setCorrectCount(0);
              setSelected(null); setShowResult(false);
              setGameOver(false);
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
        <Text style={styles.headerTitle}>听音配图</Text>
        <Text style={styles.roundLabel}>{round + 1}/{totalRounds}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        {LISTEN_ROUNDS.map((_, i) => (
          <View key={i} style={[styles.pDot, i < round && styles.pDotDone, i === round && styles.pDotCurrent]} />
        ))}
      </View>

      <Animated.View style={[styles.gameArea, {
        opacity: roundAnim,
        transform: [{ scale: roundAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
      }]}>
        {/* 播放按钮 */}
        <TouchableOpacity
          style={[styles.playBtn, isPlaying && styles.playBtnActive]}
          activeOpacity={0.8}
          onPress={handlePlay}
          disabled={isPlaying}
        >
          <Text style={styles.playIcon}>{isPlaying ? '🔊' : '🔈'}</Text>
        </TouchableOpacity>
        <Text style={styles.playHint}>
          {isPlaying ? '正在播放...' : '点击播放，听发音选答案'}
        </Text>

        {/* 选项网格 */}
        <View style={styles.optionsGrid}>
          {currentRound.options.map((opt) => {
            const isSelected = selected === opt;
            const showCorrect = showResult && opt === currentRound.correct;
            const showWrong = showResult && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.optionCard,
                  showCorrect && styles.optionCorrect,
                  showWrong && styles.optionWrong,
                  isSelected && !showResult && styles.optionSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelect(opt)}
                disabled={showResult}
              >
                <Text style={[
                  styles.optionChar,
                  showCorrect && styles.optionCharCorrect,
                  showWrong && styles.optionCharWrong,
                ]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {showResult && (
          <View style={[styles.feedbackBox, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={styles.feedbackEmoji}>{isCorrect ? '✅' : '❌'}</Text>
            <Text style={styles.feedbackText}>
              {isCorrect
                ? `回答正确！「${currentRound.correct}」读作 "${currentRound.sound}"`
                : `正确答案是「${currentRound.correct}」，读作 "${currentRound.sound}"`
              }
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
  roundLabel: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout,
    color: Colors.textSecondary,
  },
  progressRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 6,
    paddingVertical: 12,
  },
  pDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.borderDefault },
  pDotDone: { backgroundColor: Colors.successGreen },
  pDotCurrent: { backgroundColor: Colors.magicPurple, width: 10, height: 10, borderRadius: 5 },
  // Game
  gameArea: {
    flex: 1, padding: Spacing.pagePadding,
    alignItems: 'center', gap: 20,
  },
  playBtn: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.magicPurple,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: 'rgba(140,92,245,0.3)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16, elevation: 5,
  },
  playBtnActive: { backgroundColor: Colors.stagePink },
  playIcon: { fontSize: 32 },
  playHint: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout,
    color: Colors.textSecondary,
  },
  optionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 14,
    justifyContent: 'center', width: '100%',
  },
  optionCard: {
    width: '44%', aspectRatio: 1.2,
    backgroundColor: Colors.pureWhite, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: Colors.borderDefault,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2,
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
  optionChar: {
    fontFamily: FontFamily.chinese, fontSize: 36, fontWeight: "800",
    color: Colors.textPrimary,
  },
  optionCharCorrect: { color: Colors.successGreen },
  optionCharWrong: { color: Colors.errorRed },
  // Feedback
  feedbackBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16,
    width: '100%',
  },
  feedbackCorrect: { backgroundColor: Colors.successGreen + '15' },
  feedbackWrong: { backgroundColor: Colors.errorRed + '15' },
  feedbackEmoji: { fontSize: 24 },
  feedbackText: {
    fontFamily: FontFamily.primary, fontSize: 15, fontWeight: "600",
    color: Colors.textPrimary, flex: 1,
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
