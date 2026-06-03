// 声调拼拼乐 - 听汉字发音，选出正确的声调拼音
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { playPinyin } from '@/services/audio';
import { useProgress } from '@/services/progress';
import { getAllLevels } from '@/data/curriculum';
import type { LevelData } from '@/data/types';

interface ToneQuestion {
  id: string;
  example: string;       // 汉字，如"波"
  word: string;           // 组词，如"波浪"
  letter: string;          // 无调号，如"bo"
  correctPinyin: string;   // 带调号，如"bō"
  tone: number;            // 声调 1-4
  options: string[];       // 四个选项（含正确答案）
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// 生成同一字母的四声选项
function generateToneOptions(letter: string, correctTone: number, correctPinyin: string): string[] {
  const toneMarks: Record<number, string> = {
    1: '\u0304', // macron
    2: '\u0301', // acute
    3: '\u030C', // caron
    4: '\u0304', // grave (use as placeholder)
  };

  // 常见带调号映射
  const toneMap: Record<string, string[]> = {
    a: ['ā', 'á', 'ǎ', 'à'],
    o: ['ō', 'ó', 'ǒ', 'ò'],
    e: ['ē', 'é', 'ě', 'è'],
    i: ['ī', 'í', 'ǐ', 'ì'],
    u: ['ū', 'ú', 'ǔ', 'ù'],
    ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
  };

  // 从字母最后几个字符提取韵母来找声调
  const vowels = 'aeiouüv';
  let lastVowel = '';
  for (let c = letter.length - 1; c >= 0; c--) {
    if (vowels.includes(letter[c])) { lastVowel = letter[c]; break; }
  }

  const base = toneMap[lastVowel] || ['ā', 'á', 'ǎ', 'à'];
  const options = base.map((mark, i) => {
    if (i + 1 === correctTone) return correctPinyin;
    // 生成错误声调版本（简化处理：用正确声调位标记）
    return letter.replace(lastVowel, mark.replace(lastVowel, '') ? mark : base[i]);
  });

  // 简化：直接用声调组合生成
  const allOptions = [
    correctPinyin,
    `${letter}（一声）`,
    `${letter}（二声）`,
    `${letter}（四声）`,
  ];

  // 用实际的声调拼音
  const realOptions = generateRealToneOptions(letter, correctTone, correctPinyin);
  return realOptions;
}

function generateRealToneOptions(letter: string, correctTone: number, correctPinyin: string): string[] {
  const toneMap: Record<string, string[]> = {
    a: ['ā', 'á', 'ǎ', 'à'],
    o: ['ō', 'ó', 'ǒ', 'ò'],
    e: ['ē', 'é', 'ě', 'è'],
    i: ['ī', 'í', 'ǐ', 'ì'],
    u: ['ū', 'ú', 'ǔ', 'ù'],
    ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
  };

  // 找到需要加声调的韵母位置
  const vowels = 'aeiouü';
  let vowelIdx = -1;
  let vowelChar = '';
  for (let c = letter.length - 1; c >= 0; c--) {
    if (vowels.includes(letter[c])) {
      vowelIdx = c;
      vowelChar = letter[c];
      break;
    }
  }

  if (vowelIdx === -1) {
    return shuffle([correctPinyin, letter, letter, letter]);
  }

  const tones = toneMap[vowelChar] || toneMap['a'];
  const options: string[] = [];
  for (let t = 0; t < 4; t++) {
    if (t + 1 === correctTone) {
      options.push(correctPinyin);
    } else {
      const newLetter = letter.slice(0, vowelIdx) + tones[t] + letter.slice(vowelIdx + 1);
      options.push(newLetter);
    }
  }

  return shuffle(options);
}

function generateQuestions(completedLevels: string[], count: number): ToneQuestion[] {
  const allLevels = getAllLevels();
  const learned = completedLevels.length > 0
    ? allLevels.filter(l => completedLevels.includes(l.id))
    : allLevels.slice(0, 23); // 默认用声母

  const pool = shuffle(learned);
  const questions: ToneQuestion[] = [];

  for (const level of pool) {
    if (questions.length >= count) break;
    if (!level.letter || level.letter.length < 2) continue; // 跳过单字母声母（无声调变化意义）

    const options = generateRealToneOptions(level.letter, level.tone, level.pinyin);
    questions.push({
      id: level.id,
      example: level.example,
      word: level.word,
      letter: level.letter,
      correctPinyin: level.pinyin,
      tone: level.tone,
      options,
    });
  }

  // 不足时用整体认读音节补充
  if (questions.length < count) {
    const wholeSyllables = allLevels.filter(l => l.type === 'whole-syllable');
    for (const level of shuffle(wholeSyllables)) {
      if (questions.length >= count) break;
      if (questions.some(q => q.id === level.id)) continue;

      const options = generateRealToneOptions(level.letter, level.tone, level.pinyin);
      questions.push({
        id: level.id,
        example: level.example,
        word: level.word,
        letter: level.letter,
        correctPinyin: level.pinyin,
        tone: level.tone,
        options,
      });
    }
  }

  return questions;
}

export default function ToneSpellPage() {
  const { progress } = useProgress();
  const [phase, setPhase] = useState<'ready' | 'playing' | 'result'>('ready');
  const [questions, setQuestions] = useState<ToneQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [playHint, setPlayHint] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const startGame = () => {
    const qs = generateQuestions(progress.completedLevels, 8);
    setQuestions(qs);
    setCurrent(0);
    setScore(0);
    setCorrectCount(0);
    setSelected(null);
    setShowFeedback(false);
    setPhase('playing');

    // 自动播放第一题发音
    if (qs.length > 0) {
      setTimeout(() => {
        try { playPinyin(qs[0].word, { rate: 0.5 }); } catch {}
      }, 500);
    }
  };

  const handlePlaySound = () => {
    if (questions.length === 0) return;
    setPlayHint(true);
    try { playPinyin(questions[current].word, { rate: 0.5 }); } catch {}
    setTimeout(() => setPlayHint(false), 1000);
  };

  const handleSelect = (option: string) => {
    if (showFeedback) return;
    const q = questions[current];
    setSelected(option);
    setShowFeedback(true);

    const correct = option === q.correctPinyin;
    setIsCorrect(correct);

    if (correct) {
      setScore(s => s + 10);
      setCorrectCount(c => c + 1);
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }

    setTimeout(() => {
      if (current < questions.length - 1) {
        const next = current + 1;
        setCurrent(next);
        setSelected(null);
        setShowFeedback(false);
        // 自动播放下一题发音
        try { playPinyin(questions[next].word, { rate: 0.5 }); } catch {}
      } else {
        setPhase('result');
      }
    }, correct ? 800 : 1500);
  };

  // 准备阶段
  if (phase === 'ready') {
    return (
      <View style={styles.container}>
        <View style={styles.readyContent}>
          <Text style={styles.readyEmoji}>🎭</Text>
          <Text style={styles.readyTitle}>声调拼拼乐</Text>
          <Text style={styles.readyDesc}>听汉字发音，选出正确的声调拼音！</Text>
          <View style={styles.readyRules}>
            <Text style={styles.ruleItem}>🔊 听发音，看汉字</Text>
            <Text style={styles.ruleItem}>🎯 从四个声调中选出正确的</Text>
            <Text style={styles.ruleItem}>⭐ 答对得 10 分</Text>
            <Text style={styles.ruleItem}>📊 共 8 题，加油哦</Text>
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
    const total = questions.length;
    const stars = correctCount >= 7 ? 3 : correctCount >= 4 ? 2 : 1;
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
              <Text style={[styles.resultValue, { color: Colors.successGreen }]}>{correctCount}/{total}</Text>
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
  const q = questions[current];
  if (!q) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setPhase('result')}>
          <Text style={styles.backBtn}>← 退出</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>声调拼拼乐</Text>
        <Text style={styles.roundLabel}>{current + 1}/{questions.length}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        {questions.map((_, i) => (
          <View key={i} style={[
            styles.pDot,
            i < current && styles.pDotDone,
            i === current && styles.pDotCurrent,
          ]} />
        ))}
      </View>

      {/* 汉字展示区 */}
      <View style={styles.charArea}>
        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <TouchableOpacity onPress={handlePlaySound} activeOpacity={0.7}>
            <View style={[styles.charCard, playHint && styles.charCardPulse]}>
              <Text style={styles.charEmoji}>🔊</Text>
              <Text style={styles.charMain}>{q.example}</Text>
              <Text style={styles.charWord}>{q.word}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={styles.playAgainBtn} onPress={handlePlaySound}>
          <Text style={styles.playAgainText}>{playHint ? '🔊 播放中...' : '🔊 再听一次'}</Text>
        </TouchableOpacity>
      </View>

      {/* 四声选项 */}
      <Animated.View style={[styles.optionsArea, { transform: [{ translateX: shakeAnim }] }]}>
        <Text style={styles.optionsHint}>这个字的正确拼音是？</Text>
        <View style={styles.optionsGrid}>
          {q.options.map((option, idx) => {
            const isSelected = selected === option;
            const showCorrectOpt = showFeedback && option === q.correctPinyin;
            const showWrongOpt = showFeedback && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={`${option}-${idx}`}
                style={[
                  styles.optionBtn,
                  showCorrectOpt && styles.optionCorrect,
                  showWrongOpt && styles.optionWrong,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelect(option)}
                disabled={showFeedback}
              >
                <Text style={[
                  styles.optionText,
                  showCorrectOpt && styles.optionTextCorrect,
                  showWrongOpt && styles.optionTextWrong,
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      {/* 反馈 */}
      {showFeedback && (
        <View style={[styles.feedbackBox, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
          <Text style={styles.feedbackEmoji}>{isCorrect ? '✅' : '❌'}</Text>
          <Text style={styles.feedbackText}>
            {isCorrect ? '声调选对了！' : `正确答案是「${q.correctPinyin}」`}
          </Text>
        </View>
      )}

      {/* 底部分数 */}
      <View style={styles.liveScore}>
        <Text style={styles.liveScoreText}>得分: {score} | 正确: {correctCount}/{current}</Text>
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
  // 汉字展示区
  charArea: {
    alignItems: 'center', paddingVertical: 20, gap: 12,
  },
  charCard: {
    backgroundColor: Colors.pureWhite,
    borderRadius: 24, padding: 24, alignItems: 'center', gap: 8,
    shadowColor: 'rgba(245,158,10,0.20)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1, shadowRadius: 24, elevation: 6,
    borderWidth: 3, borderColor: '#F59E0A',
    minWidth: 160,
  },
  charCardPulse: {
    borderColor: '#F59E0A',
    shadowColor: 'rgba(245,158,10,0.40)',
  },
  charEmoji: { fontSize: 24 },
  charMain: {
    fontFamily: FontFamily.chinese, fontSize: 56, fontWeight: "800",
    color: Colors.textPrimary,
  },
  charWord: {
    fontFamily: FontFamily.chinese, fontSize: 16,
    color: Colors.textSecondary,
  },
  playAgainBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: 'rgba(245,158,10,0.1)',
    borderRadius: 12,
  },
  playAgainText: {
    fontFamily: FontFamily.primary, fontSize: 14,
    color: '#F59E0A', fontWeight: FontWeights.medium,
  },
  // 选项区
  optionsArea: {
    flex: 1, padding: Spacing.pagePadding, gap: 16,
  },
  optionsHint: {
    fontFamily: FontFamily.primary, fontSize: 16,
    color: Colors.textSecondary, textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center',
  },
  optionBtn: {
    width: '45%', paddingVertical: 18,
    backgroundColor: Colors.pureWhite,
    borderRadius: 16, alignItems: 'center',
    borderWidth: 2, borderColor: Colors.borderDefault,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2,
  },
  optionCorrect: {
    borderColor: Colors.successGreen,
    backgroundColor: Colors.successGreen + '10',
  },
  optionWrong: {
    borderColor: Colors.errorRed,
    backgroundColor: Colors.errorRed + '10',
  },
  optionText: {
    fontFamily: FontFamily.primary, fontSize: 24, fontWeight: "700",
    color: Colors.textPrimary,
  },
  optionTextCorrect: { color: Colors.successGreen },
  optionTextWrong: { color: Colors.errorRed },
  // 反馈
  feedbackBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: Spacing.pagePadding,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16,
  },
  feedbackCorrect: { backgroundColor: Colors.successGreen + '15' },
  feedbackWrong: { backgroundColor: Colors.errorRed + '15' },
  feedbackEmoji: { fontSize: 24 },
  feedbackText: {
    fontFamily: FontFamily.primary, fontSize: 16, fontWeight: "600",
    color: Colors.textPrimary,
  },
  // 底部分数
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
    color: '#F59E0A',
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
    backgroundColor: '#F59E0A',
    borderRadius: 20, paddingVertical: 16, paddingHorizontal: 48,
    shadowColor: 'rgba(245,158,10,0.30)',
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
    color: '#F59E0A',
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
    fontWeight: FontWeights.medium, color: '#F59E0A',
  },
  resultDivider: { height: 1, backgroundColor: Colors.borderSubtle },
  resultBtns: { width: '100%', gap: 12, marginTop: 16 },
  replayBtn: {
    backgroundColor: '#F59E0A',
    borderRadius: 16, paddingVertical: 14, alignItems: 'center',
    shadowColor: 'rgba(245,158,10,0.25)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4,
  },
  replayText: {
    fontFamily: FontFamily.primary, fontSize: 16, fontWeight: "600",
    color: Colors.pureWhite,
  },
  homeBtn: {
    paddingVertical: 14, alignItems: 'center',
    backgroundColor: Colors.pureWhite, borderRadius: 16,
    borderWidth: 1.5, borderColor: '#F59E0A',
  },
  homeText: {
    fontFamily: FontFamily.primary, fontSize: 15, fontWeight: "600",
    color: '#F59E0A',
  },
});
