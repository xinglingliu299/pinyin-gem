// 07-跟读练习 - 含录音、评分 & 响应式布局
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
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

  const [recording, setRecording] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [hasResult, setHasResult] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const playbackRef = useRef<Audio.Sound | null>(null);
  const { cardWidth, fontSizeMultiplier } = useResponsive();

  // 组件卸载时清理播放实例
  useEffect(() => {
    return () => {
      playbackRef.current?.unloadAsync();
    };
  }, []);

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
          setRecordedUri(result.uri);
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

  const earnedStars = confidence !== null ? getStars(confidence) : 1;
  const message = hasResult ? getMessage(earnedStars) : '';

  const handleRecord = useCallback(async () => {
    if (recording) {
      // 手动停止录音
      try {
        const result = await stopRecording();
        setConfidence(result.confidence);
        setHasResult(true);
        setRecording(false);
        setRecordedUri(result.uri);
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
    setRecordedUri(null);
    setIsPlayingBack(false);
    try {
      await startRecording();
      setRecording(true);
    } catch (e: any) {
      // 权限拒绝等错误已在 audio.ts 中弹窗提示
      setErrorMsg(e?.message || '录音启动失败');
    }
  }, [recording]);

  const handlePlayRecording = useCallback(async () => {
    if (!recordedUri || isPlayingBack) return;
    setIsPlayingBack(true);
    try {
      // 先卸载旧的
      await playbackRef.current?.unloadAsync();
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordedUri },
        { shouldPlay: true },
        (status) => {
          if (status.didJustFinish || status.didJustFinish === false && !status.isPlaying) {
            setIsPlayingBack(false);
          }
        }
      );
      playbackRef.current = sound;
    } catch {
      setIsPlayingBack(false);
    }
  }, [recordedUri, isPlayingBack]);

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
        <TouchableOpacity
          style={[styles.recordBtn, recording && styles.recordBtnActive]}
          activeOpacity={0.8}
          onPress={handleRecord}
        >
          <Text style={styles.recordIcon}>🎤</Text>
        </TouchableOpacity>
        <Text style={styles.recordHint}>
          {recording ? '正在录音...点击停止' : '点击开始录音'}
        </Text>

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
          {recordedUri && (
            <TouchableOpacity
              style={[styles.playBackBtn, isPlayingBack && styles.playBackBtnActive]}
              activeOpacity={0.8}
              onPress={handlePlayRecording}
              disabled={isPlayingBack}
            >
              <Text style={styles.playBackText}>
                {isPlayingBack ? '▶️ 正在播放...' : '🔊 重听我的录音'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Button Row */}
      <View style={styles.btnRow}>
        <SecondaryButton
          title="再试一次"
          onPress={async () => {
            await playbackRef.current?.unloadAsync();
            setHasResult(false);
            setConfidence(null);
            setErrorMsg(null);
            setRecording(false);
            setRecordedUri(null);
            setIsPlayingBack(false);
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
  playBackBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.pureWhite,
    borderWidth: 1.5,
    borderColor: Colors.magicPurple,
    shadowColor: 'rgba(140, 92, 245, 0.12)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  playBackBtnActive: {
    backgroundColor: 'rgba(140, 92, 245, 0.08)',
    borderColor: '#F59E0B',
  },
  playBackText: {
    fontFamily: FontFamily.primary,
    fontSize: 15,
    fontWeight: FontWeights.semibold,
    color: Colors.magicPurple,
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
