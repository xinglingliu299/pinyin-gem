// 08-魔法小测 - 含 TTS 朗读 & 响应式布局
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { PrimaryButton, LearnTopBar } from '@/components';
import { getLevelById } from '@/data/curriculum';
import { playPinyin } from '@/services/audio';
import { useResponsive } from '@/hooks/useResponsive';

export default function QuizPage() {
  const { id, stars: starsParam } = useLocalSearchParams<{ id: string; stars?: string }>();
  const level = getLevelById(id ?? 'b');
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { cardWidth, fontSizeMultiplier, gridColumns } = useResponsive();

  // 从课程数据生成选项并随机排列
  const options = useMemo(() => {
    if (!level) return [];
    const all = [level.quizCorrect, ...level.quizWrong];
    return all
      .map((text) => ({ text, key: text }))
      .sort(() => Math.random() - 0.5);
  }, [level]);

  if (!level) return null;

  const handleSelect = (text: string) => {
    if (showResult) return;
    setSelected(text);
    setShowResult(true);
  };

  const isCorrect = selected === level.quizCorrect;
  const earnedStars = parseInt(starsParam ?? '0', 10);

  const handlePlay = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      // 朗读例字，方便孩子听音选图
      await playPinyin(level.example, { rate: 0.5 });
    } catch (e) {
      // silent fail
    } finally {
      setIsPlaying(false);
    }
  };

  // 选项卡片宽度：2列或3列
  const optionCardWidth = gridColumns === 3 ? 180 : 161;
  const optionCardScaled = optionCardWidth * fontSizeMultiplier;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar */}
      <LearnTopBar step={5} />

      {/* Title */}
      <Text style={[styles.title, { fontSize: 20 * fontSizeMultiplier }]}>
        听音选图：这是什么？
      </Text>

      {/* Audio Play Button */}
      <TouchableOpacity
        style={[styles.audioBtn, isPlaying && styles.audioBtnActive]}
        activeOpacity={0.8}
        onPress={handlePlay}
        disabled={isPlaying}
      >
        <Text style={styles.audioIcon}>{isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
      <Text style={styles.audioHint}>
        {isPlaying ? '正在朗读...' : '点击听发音'}
      </Text>

      {/* Options Grid */}
      <View style={[styles.optionsGrid, { width: cardWidth }]}>
        {options.map((opt) => {
          const isSelected = selected === opt.text;
          const showCorrect = showResult && opt.text === level.quizCorrect;
          const showWrong = showResult && isSelected && opt.text !== level.quizCorrect;

          return (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.optionCard,
                { width: optionCardScaled, height: 120 * fontSizeMultiplier },
                showCorrect && styles.optionCorrect,
                showWrong && styles.optionWrong,
                isSelected && !showResult && styles.optionSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => handleSelect(opt.text)}
            >
              <Text
                style={[
                  styles.optionText,
                  { fontSize: 32 * fontSizeMultiplier },
                  showCorrect && styles.optionTextCorrect,
                  showWrong && styles.optionTextWrong,
                ]}
              >
                {opt.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Result Feedback */}
      {showResult && (
        <View style={styles.feedbackRow}>
          <View style={[styles.feedbackBadge, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={[styles.feedbackText, isCorrect ? styles.feedbackTextCorrect : styles.feedbackTextWrong]}>
              {isCorrect ? '选对啦 ✓' : '选错啦 ✗'}
            </Text>
          </View>
        </View>
      )}

      {/* Princess Hint */}
      <View style={styles.princessHint}>
        <View style={styles.princessCircle}>
          <Text style={styles.princessEmoji}>👸</Text>
        </View>
      </View>

      {/* CTA */}
      {showResult && (
        <PrimaryButton
          title="下一关"
          onPress={() => router.push(`/learn/result?id=${level.id}&stars=${earnedStars}`)}
          style={styles.cta}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pageBackground,
  },
  content: {
    padding: Spacing.pagePadding,
    paddingBottom: 100,
    alignItems: 'center',
    gap: Spacing.elementGap,
  },
  title: {
    fontFamily: FontFamily.primary,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 4,
  },
  audioBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.magicPurple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(140, 92, 245, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  audioBtnActive: {
    backgroundColor: Colors.stagePink,
    opacity: 0.85,
  },
  audioIcon: {
    fontSize: 28,
    color: Colors.pureWhite,
    marginLeft: 4,
  },
  audioHint: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.footnote,
    color: Colors.textSecondary,
    marginTop: -12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  optionCard: {
    backgroundColor: Colors.pureWhite,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: Colors.magicPurple,
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
    fontFamily: FontFamily.chinese,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  optionTextCorrect: {
    color: Colors.successGreen,
  },
  optionTextWrong: {
    color: Colors.errorRed,
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  feedbackBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.pureWhite,
    borderWidth: 1.5,
  },
  feedbackCorrect: {
    borderColor: Colors.successGreen,
  },
  feedbackWrong: {
    borderColor: Colors.errorRed,
  },
  feedbackText: {
    fontFamily: FontFamily.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  feedbackTextCorrect: {
    color: Colors.successGreen,
  },
  feedbackTextWrong: {
    color: Colors.errorRed,
  },
  princessHint: {
    alignItems: 'center',
    marginTop: 4,
  },
  princessCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.glowPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  princessEmoji: {
    fontSize: 24,
  },
  cta: {
    width: '100%',
    marginTop: 8,
  },
});
