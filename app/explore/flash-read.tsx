// 22-快闪认读 - 拼音字母快速闪现，孩子抢答
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { playLetter } from '@/services/audio';

// 快闪字母库
const FLASH_LETTERS = [
  'b', 'p', 'm', 'f', 'd', 't', 'n', 'l',
  'g', 'k', 'h', 'j', 'q', 'x',
  'zh', 'ch', 'sh', 'r', 'z', 'c', 's',
  'a', 'o', 'e', 'i', 'u', 'ü',
  'ai', 'ei', 'ui', 'ao', 'ou', 'iu',
  'an', 'en', 'in', 'ang', 'eng',
  'yi', 'wu', 'yu', 'ye', 'yue', 'yun',
];

function generateFlashRound(count: number): string[] {
  const shuffled = [...FLASH_LETTERS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function FlashReadPage() {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'result'>('ready');
  const [letters, setLetters] = useState<string[]>(() => generateFlashRound(10));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const flashAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameActive = useRef(false);

  const totalRounds = letters.length;

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const showLetter = () => {
    setVisible(true);
    flashAnim.setValue(0);
    Animated.spring(flashAnim, {
      toValue: 1,
      friction: 4,
      tension: 80,
      useNativeDriver: true,
    }).start();

    // 播放发音（用 playLetter 确保中文发音，不回退到英文TTS）
    const letter = letters[currentIndex];
    try { playLetter(letter, { rate: 0.5 }); } catch {}

    // 1.5秒后自动隐藏
    setTimeout(() => {
      Animated.timing(flashAnim, {
        toValue: 0, duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        setCurrentIndex((i) => i + 1);
      });
    }, 1500);
  };

  const startGame = () => {
    const newLetters = generateFlashRound(10);
    setLetters(newLetters);
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setTotalCount(0);
    setVisible(false);
    gameActive.current = true;
    setPhase('playing');

    // 延迟一下开始第一轮
    setTimeout(() => showLetter(), 500);
  };

  // 监听轮次变化
  useEffect(() => {
    if (phase === 'playing' && currentIndex > 0 && currentIndex < totalRounds && gameActive.current) {
      const timer = setTimeout(() => showLetter(), 600);
      return () => clearTimeout(timer);
    }
    if (currentIndex >= totalRounds && gameActive.current) {
      gameActive.current = false;
      setPhase('result');
    }
  }, [currentIndex, phase]);

  const handleAnswer = (correct: boolean) => {
    if (!visible || !gameActive.current) return;
    setTotalCount((t) => t + 1);
    if (correct) {
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
    }
  };

  // 准备阶段
  if (phase === 'ready') {
    return (
      <View style={styles.container}>
        <View style={styles.readyContent}>
          <Text style={styles.readyEmoji}>⚡</Text>
          <Text style={styles.readyTitle}>快闪认读</Text>
          <Text style={styles.readyDesc}>拼音字母会快速闪过，你能认出它吗？</Text>
          <View style={styles.readyRules}>
            <Text style={styles.ruleItem}>🔤 字母会闪现 1.5 秒</Text>
            <Text style={styles.ruleItem}>👀 仔细看，大声读出来</Text>
            <Text style={styles.ruleItem}>✅ 读对了就点正确</Text>
            <Text style={styles.ruleItem}>📊 共 10 个字母，看你能认对几个</Text>
          </View>
          <TouchableOpacity style={styles.startBtn} onPress={startGame}>
            <Text style={styles.startText}>开始挑战</Text>
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
    const stars = correctCount >= 8 ? 3 : correctCount >= 5 ? 2 : 1;
    return (
      <View style={styles.container}>
        <View style={styles.resultContent}>
          <Text style={styles.resultEmoji}>{stars === 3 ? '🎉' : stars === 2 ? '👍' : '💪'}</Text>
          <Text style={styles.resultTitle}>挑战完成！</Text>
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
        <TouchableOpacity onPress={() => { gameActive.current = false; setPhase('result'); }}>
          <Text style={styles.backBtn}>← 退出</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>快闪认读</Text>
        <Text style={styles.roundLabel}>{currentIndex}/{totalRounds}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        {letters.map((_, i) => (
          <View key={i} style={[
            styles.pDot,
            i < currentIndex && styles.pDotDone,
            i === currentIndex && visible && styles.pDotCurrent,
          ]} />
        ))}
      </View>

      {/* Flash Area */}
      <View style={styles.flashArea}>
        {visible ? (
          <Animated.View style={[
            styles.flashCard,
            {
              transform: [
                { scale: flashAnim },
                { rotate: flashAnim.interpolate({
                  inputRange: [0, 1], outputRange: ['-5deg', '0deg'],
                })},
              ],
              opacity: flashAnim,
            },
          ]}>
            <Text style={styles.flashLetter}>{letters[currentIndex]}</Text>
          </Animated.View>
        ) : (
          <View style={styles.waitArea}>
            {currentIndex < totalRounds ? (
              <Text style={styles.waitText}>
                {currentIndex === 0 ? '准备...' : `第 ${currentIndex} 个完成，下一个即将出现...`}
              </Text>
            ) : (
              <Text style={styles.waitText}>正在统计结果...</Text>
            )}
          </View>
        )}
      </View>

      {/* Answer Buttons */}
      {visible && (
        <View style={styles.answerRow}>
          <TouchableOpacity
            style={styles.yesBtn}
            activeOpacity={0.8}
            onPress={() => handleAnswer(true)}
          >
            <Text style={styles.yesText}>✅ 我认对了</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.noBtn}
            activeOpacity={0.8}
            onPress={() => handleAnswer(false)}
          >
            <Text style={styles.noText}>❌ 没认出</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 实时分数 */}
      <View style={styles.liveScore}>
        <Text style={styles.liveScoreText}>得分: {score} | 正确: {correctCount}/{totalCount}</Text>
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
  roundLabel: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout, color: Colors.textSecondary,
  },
  // Progress
  progressRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 5,
    paddingVertical: 12, flexWrap: 'wrap',
  },
  pDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.borderDefault },
  pDotDone: { backgroundColor: Colors.successGreen },
  pDotCurrent: { backgroundColor: Colors.magicPurple, width: 9, height: 9, borderRadius: 4.5 },
  // Flash Area
  flashArea: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  flashCard: {
    width: 200, height: 200,
    backgroundColor: Colors.pureWhite,
    borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: 'rgba(140,92,245,0.30)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 3,
    borderColor: Colors.glowPurple,
  },
  flashLetter: {
    fontFamily: FontFamily.primary,
    fontSize: 80, fontWeight: "800",
    color: Colors.magicPurple,
  },
  waitArea: {
    padding: 40, alignItems: 'center',
  },
  waitText: {
    fontFamily: FontFamily.primary, fontSize: 18,
    color: Colors.textSecondary, textAlign: 'center',
  },
  // Answer
  answerRow: {
    flexDirection: 'row', gap: 16,
    paddingHorizontal: Spacing.pagePadding, paddingBottom: 20,
    justifyContent: 'center',
  },
  yesBtn: {
    flex: 1, maxWidth: 180,
    backgroundColor: Colors.successGreen,
    borderRadius: 20, paddingVertical: 16, alignItems: 'center',
    shadowColor: 'rgba(15,186,130,0.25)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4,
  },
  yesText: {
    fontFamily: FontFamily.primary, fontSize: 18, fontWeight: "700",
    color: Colors.pureWhite,
  },
  noBtn: {
    flex: 1, maxWidth: 180,
    backgroundColor: Colors.pureWhite,
    borderRadius: 20, paddingVertical: 16, alignItems: 'center',
    borderWidth: 2, borderColor: Colors.borderDefault,
  },
  noText: {
    fontFamily: FontFamily.primary, fontSize: 18, fontWeight: "600",
    color: Colors.textSecondary,
  },
  liveScore: {
    paddingBottom: 40, alignItems: 'center',
  },
  liveScoreText: {
    fontFamily: FontFamily.primary, fontSize: 15, fontWeight: FontWeights.medium,
    color: Colors.magicPurple,
  },
  // Ready
  readyContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: Spacing.pagePadding, gap: 16,
  },
  readyEmoji: { fontSize: 64 },
  readyTitle: {
    fontFamily: FontFamily.primary, fontSize: 28, fontWeight: "800",
    color: Colors.magicPurple,
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
    backgroundColor: Colors.magicPurple,
    borderRadius: 20, paddingVertical: 16, paddingHorizontal: 48,
    shadowColor: 'rgba(140,92,245,0.30)',
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
