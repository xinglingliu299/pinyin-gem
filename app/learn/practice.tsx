// 07-跟读练习 - 含录音、评分 & 响应式布局
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { PrimaryButton, SecondaryButton, LearnTopBar } from '@/components';
import { getLevelById } from '@/data/curriculum';
import { startRecording, stopRecording, cleanupRecording } from '@/services/audio';
import { useResponsive } from '@/hooks/useResponsive';

// ---- 评分工具 ----

function getStars(confidence: number): number {
  if (confidence >= 85) return 3;
  if (confidence >= 65) return 2;
  return 1;
}

function getMessage(stars: number): string {
  switch (stars) {
    case 3: return '完美发音！你是魔法公主！👑';
    case 2: return '很棒！再接再厉！✨';
    case 1: return '加油！多练几次会更好！💪';
    default: return '';
  }
}

// ---- Component ----

export default function PracticePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const level = getLevelById(id ?? 'b');
  const webUnsupported = Platform.OS === 'web';

  const [recording, setRecording] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [hasResult, setHasResult] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { cardWidth, fontSizeMultiplier } = useResponsive();

  // 录音超时定时器
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (recording) {
      timer = setTimeout(async () => {
        try {
          const result = await stopRecording();
          setConfidence(result.confidence);
          setHasResult(true);
          setRecording(false);
        } catch (e) {
          setErrorMsg('录音自动停止');
          setRecording(false);
        }
      }, 4000); // 4 秒超时
    }
    return () => clearTimeout(timer);
  }, [recording]);

  // 组件卸载时清理
  useEffect(() => {
    return () => { cleanupRecording(); };
  }, []);

  const earnedStars = confidence !== null ? getStars(confidence) : 0;
  const message = hasResult ? getMessage(earnedStars) : '';

  const handleRecord = useCallback(async () => {
    if (webUnsupported) return;

    if (recording) {
      // 手动停止录音
      try {
        const result = await stopRecording();
        setConfidence(result.confidence);
        setHasResult(true);
        setRecording(false);
      } catch (e: any) {
        setErrorMsg(e?.message || '录音停止失败');
        setRecording(false);
      }
      return;
    }

    // 开始录音
    setErrorMsg(null);
    setHasResult(false);
    setConfidence(null);
    try {
      await startRecording();
      setRecording(true);
    } catch (e: any) {
      // 权限拒绝等错误已在 audio.ts 中弹窗提示
      setErrorMsg(e?.message || '录音启动失败');
    }
  }, [recording, webUnsupported]);

  if (!level) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar */}
      <LearnTopBar step={4} />

      {/* Small Pinyin Card */}
      <View style={[styles.smallCard, { width: 100 * fontSizeMultiplier, height: 100 * fontSizeMultiplier }]}>
        <Text style={[styles.smallChar, { fontSize: 48 * fontSizeMultiplier }]}>
          {level.pinyin}
        </Text>
      </View>

      {/* Record Area */}
      <View style={[styles.recordArea, { width: cardWidth }]}>
        {webUnsupported ? (
          <View style={styles.webNotice}>
            <Text style={styles.webNoticeIcon}>🎤</Text>
            <Text style={styles.webNoticeText}>
              网页版暂不支持录音功能
            </Text>
            <Text style={styles.webNoticeSubtext}>
              请在手机或平板上体验哦~
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.recordBtn, recording && styles.recordBtnActive]}
              activeOpacity={0.8}
              onPress={handleRecord}
            >
              <Text style={styles.recordIcon}>🎤</Text>
            </TouchableOpacity>
            <Text style={styles.recordHint}>
              {recording ? '正在录音...松开停止' : '按住说话'}
            </Text>
          </>
        )}

        {/* 错误提示 */}
        {errorMsg && (
          <Text style={styles.errorText}>{errorMsg}</Text>
        )}

        {/* Waveform */}
        <View style={styles.waveform}>
          {[0.3, 0.5, 0.8, 0.4, 0.9, 0.6, 0.7, 0.3, 0.5, 0.8].map((h, i) => (
            <View
              key={i}
              style={[
                styles.waveBar,
                {
                  height: recording ? h * 32 : 4,
                  opacity: recording ? 1 : 0.3,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Result Area */}
      {hasResult && confidence !== null && (
        <View style={styles.resultArea}>
          <View style={styles.starRow}>
            {[1, 2, 3].map((s) => (
              <Text key={s} style={[styles.star, { fontSize: 28 * fontSizeMultiplier }]}>
                {s <= earnedStars ? '⭐' : '☆'}
              </Text>
            ))}
          </View>
          <Text style={[styles.resultText, { fontSize: 20 * fontSizeMultiplier }]}>
            {message}
          </Text>
          <Text style={styles.scoreText}>
            发音评分：{confidence} 分
          </Text>
        </View>
      )}

      {/* Button Row */}
      <View style={styles.btnRow}>
        <SecondaryButton
          title="再试一次"
          onPress={() => {
            setHasResult(false);
            setConfidence(null);
            setErrorMsg(null);
            setRecording(false);
          }}
          style={styles.halfBtn}
        />
        <PrimaryButton
          title="下一个"
          onPress={() => router.push(`/learn/quiz?id=${level.id}&stars=${earnedStars}`)}
          style={styles.halfBtn}
        />
      </View>
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
  smallCard: {
    backgroundColor: Colors.pureWhite,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  smallChar: {
    fontFamily: FontFamily.primary,
    fontWeight: "800",
    color: Colors.magicPurple,
  },
  recordArea: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  recordBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.magicPurple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(140, 92, 245, 0.30)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 5,
  },
  recordBtnActive: {
    backgroundColor: Colors.stagePink,
    transform: [{ scale: 1.05 }],
  },
  recordIcon: {
    fontSize: 40,
    color: Colors.pureWhite,
  },
  recordHint: {
    fontFamily: FontFamily.primary,
    fontSize: 16,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
  },
  errorText: {
    fontFamily: FontFamily.primary,
    fontSize: 14,
    color: Colors.errorRed,
    textAlign: 'center',
  },
  webNotice: {
    alignItems: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: Colors.pureWhite,
    borderRadius: 20,
    width: '100%',
  },
  webNoticeIcon: {
    fontSize: 48,
  },
  webNoticeText: {
    fontFamily: FontFamily.primary,
    fontSize: 16,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  webNoticeSubtext: {
    fontFamily: FontFamily.primary,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  waveform: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    height: 40,
  },
  waveBar: {
    width: 4,
    backgroundColor: Colors.magicPurple,
    borderRadius: 2,
  },
  resultArea: {
    alignItems: 'center',
    gap: 12,
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    // fontSize set dynamically
  },
  resultText: {
    fontFamily: FontFamily.primary,
    fontWeight: "800",
    color: Colors.successGreen,
  },
  scoreText: {
    fontFamily: FontFamily.primary,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  halfBtn: {
    flex: 1,
  },
});
