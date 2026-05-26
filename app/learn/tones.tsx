// 06-声调手势操 - 四声对比动画 + 跟我做交互
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { PrimaryButton, LearnTopBar } from '@/components';
import { getLevelById } from '@/data/curriculum';
import { useResponsive } from '@/hooks/useResponsive';
import { playPinyin } from '@/services/audio';
import type { ToneNumber } from '@/data/types';

// ---- 声调动画配置 ----
const TONE_CONFIG: Record<number, {
  label: string;
  hint: string;
  rhyme: string;
  rhymeSub: string;
  path: Array<{ x: number; y: number }>;
  color: string;
}> = {
  1: {
    label: '一声',
    hint: '右手平伸，从胸前平稳滑向右侧',
    rhyme: '一声高高平又平',
    rhymeSub: '像飞机在天空平稳飞行',
    path: [{ x: 20, y: 50 }, { x: 160, y: 50 }],
    color: '#0FBA82',
  },
  2: {
    label: '二声',
    hint: '右手从左下向右上扬起',
    rhyme: '二声就像上山坡',
    rhymeSub: '像爬楼梯一步一步往上',
    path: [{ x: 20, y: 65 }, { x: 160, y: 25 }],
    color: '#388ADE',
  },
  3: {
    label: '三声',
    hint: '右手先向下再向上，画一个对勾',
    rhyme: '三声下坡又上坡',
    rhymeSub: '像打勾勾先下后上',
    path: [{ x: 20, y: 30 }, { x: 80, y: 70 }, { x: 160, y: 30 }],
    color: '#F59E0A',
  },
  4: {
    label: '四声',
    hint: '右手从左上向右下快速下降',
    rhyme: '四声快快往下降',
    rhymeSub: '像坐滑梯嗖的滑下来',
    path: [{ x: 20, y: 25 }, { x: 160, y: 70 }],
    color: '#ED4799',
  },
};

// 四声拼音生成：根据拼音字母生成4个声调
const TONE_MARKS: Record<string, [string, string, string, string]> = {
  a: ['ā', 'á', 'ǎ', 'à'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
};

function getTonePinyins(letter: string): [string, string, string, string] {
  if (TONE_MARKS[letter]) return TONE_MARKS[letter];
  // 复韵母/鼻韵母：在第一个元音上标调
  // 简化处理：根据第一个元音标调
  const firstVowel = letter.match(/[aeiouü]/)?.[0];
  if (firstVowel && TONE_MARKS[firstVowel]) {
    const marks = TONE_MARKS[firstVowel];
    return marks.map((mark, i) => {
      const toneChar = mark;
      return letter.replace(firstVowel, toneChar);
    }) as [string, string, string, string];
  }
  return [letter, letter, letter, letter];
}

// ---- 声调动画组件 ----
function ToneAnimation({
  tone,
  playing,
  size = 'small',
}: {
  tone: ToneNumber;
  playing: boolean;
  size?: 'small' | 'large';
}) {
  const dotAnim = useRef(new Animated.Value(0)).current;
  const config = TONE_CONFIG[tone] || TONE_CONFIG[1];
  const isLarge = size === 'large';
  const scale = isLarge ? 1.6 : 1;
  const canvasW = isLarge ? 220 : 140;
  const canvasH = isLarge ? 100 : 80;

  useEffect(() => {
    if (playing) {
      dotAnim.setValue(0);
      Animated.timing(dotAnim, {
        toValue: 1,
        duration: isLarge ? 1500 : 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        // 动画结束
      });
    } else {
      dotAnim.setValue(0);
    }
  }, [playing, tone]);

  const points = config.path.map(p => ({
    x: (p.x / 180) * canvasW,
    y: (p.y / 90) * canvasH,
  }));

  const dotX = dotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [points[0].x, points[points.length - 1].x],
  });
  const dotY = dotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [points[0].y, points[points.length - 1].y],
  });

  // 路径线条样式
  const getLineStyle = (): any => {
    if (tone === 1) return {
      position: 'absolute' as const, left: points[0].x, top: points[0].y - 2,
      width: points[1].x - points[0].x, height: 4,
      backgroundColor: config.color, borderRadius: 2,
    };
    if (tone === 2) return {
      position: 'absolute' as const, left: points[0].x, top: points[1].y,
      width: points[1].x - points[0].x, height: points[0].y - points[1].y,
      backgroundColor: config.color, opacity: 0.5,
    };
    if (tone === 4) return {
      position: 'absolute' as const, left: points[0].x, top: points[0].y,
      width: points[1].x - points[0].x, height: points[1].y - points[0].y,
      backgroundColor: config.color, opacity: 0.5,
    };
    // tone 3: V shape (use two rotated views)
    return null;
  };

  return (
    <View style={[animStyles.canvas, { width: canvasW, height: canvasH }]}>
      {/* 路径线条 */}
      {tone !== 3 && getLineStyle() && <View style={getLineStyle()} />}
      {tone === 3 && (
        <>
          {/* V shape - 用两个斜线 */}
          <View style={{
            position: 'absolute', left: points[0].x, top: points[0].y,
            width: points[1].x - points[0].x, height: points[1].y - points[0].y,
            backgroundColor: config.color, opacity: 0.5,
            transform: [{ rotate: `${Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x) * 180 / Math.PI}deg` }],
          }} />
          <View style={{
            position: 'absolute', left: points[1].x, top: points[1].y,
            width: points[2].x - points[1].x, height: points[1].y - points[2].y,
            backgroundColor: config.color, opacity: 0.5,
            transform: [{ rotate: `${Math.atan2(points[2].y - points[1].y, points[2].x - points[1].x) * 180 / Math.PI}deg` }],
          }} />
        </>
      )}
      {/* 动画圆点 */}
      {playing && (
        <Animated.View style={[
          animStyles.dot,
          {
            transform: [
              { translateX: Animated.subtract(dotX, 10 * scale) },
              { translateY: Animated.subtract(dotY, 10 * scale) },
            ],
          },
        ]}>
          <Text style={{ fontSize: isLarge ? 22 : 16 }}>👆</Text>
        </Animated.View>
      )}
      {/* 起/终标记 */}
      {!isLarge && (
        <>
          <View style={[animStyles.marker, { left: points[0].x - 5, top: points[0].y - 5, backgroundColor: config.color }]}>
            <Text style={animStyles.markerText}>起</Text>
          </View>
          <View style={[animStyles.marker, {
            left: points[points.length - 1].x - 5,
            top: points[points.length - 1].y - 5,
            backgroundColor: config.color,
          }]}>
            <Text style={animStyles.markerText}>终</Text>
          </View>
        </>
      )}
    </View>
  );
}

const animStyles = StyleSheet.create({
  canvas: {
    backgroundColor: '#F5F0FF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.glowPurple,
    borderStyle: 'dashed',
    position: 'relative',
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    width: 24, height: 24,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  marker: {
    position: 'absolute',
    width: 16, height: 16,
    borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 5,
  },
  markerText: {
    fontSize: 7,
    fontWeight: "800",
    color: Colors.pureWhite,
  },
});

// ---- 单个声调卡片 ----
function ToneCard({
  tone,
  pinyin,
  playing,
  onPlay,
  fontSizeMultiplier,
}: {
  tone: ToneNumber;
  pinyin: string;
  playing: boolean;
  onPlay: () => void;
  fontSizeMultiplier: number;
}) {
  const config = TONE_CONFIG[tone];

  return (
    <TouchableOpacity
      style={[
        toneCardStyles.card,
        { borderColor: config.color },
        playing && { backgroundColor: config.color + '10' },
      ]}
      activeOpacity={0.8}
      onPress={onPlay}
      disabled={playing}
    >
      {/* 声调标签 */}
      <View style={[toneCardStyles.badge, { backgroundColor: config.color }]}>
        <Text style={toneCardStyles.badgeText}>{config.label}</Text>
      </View>

      {/* 拼音 */}
      <Text style={[toneCardStyles.pinyin, { fontSize: 32 * fontSizeMultiplier, color: playing ? config.color : Colors.textPrimary }]}>
        {pinyin}
      </Text>

      {/* 动画区域 */}
      <ToneAnimation tone={tone} playing={playing} size="small" />

      {/* 手势提示 */}
      <Text style={[toneCardStyles.hint, { fontSize: 12 * fontSizeMultiplier }]}>
        {config.hint}
      </Text>

      {/* 播放状态 */}
      <Text style={toneCardStyles.status}>
        {playing ? '🔊 演示中...' : '👆 点击演示'}
      </Text>
    </TouchableOpacity>
  );
}

const toneCardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.pureWhite,
    borderRadius: 20,
    borderWidth: 2,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2,
  },
  badge: {
    paddingHorizontal: 12, paddingVertical: 3, borderRadius: 10,
  },
  badgeText: {
    fontFamily: FontFamily.primary, fontSize: 12, fontWeight: "700",
    color: Colors.pureWhite,
  },
  pinyin: {
    fontFamily: FontFamily.primary, fontWeight: "800",
  },
  hint: {
    fontFamily: FontFamily.primary, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 18,
  },
  status: {
    fontFamily: FontFamily.primary, fontSize: 11, fontWeight: "600",
    color: Colors.magicPurple,
  },
});

// ---- Main Component ----
export default function TonesPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const level = getLevelById(id ?? 'b');
  const { cardWidth, fontSizeMultiplier } = useResponsive();
  const [activeTone, setActiveTone] = useState<number | null>(null);

  if (!level) return null;

  // 获取4个声调的拼音
  const tonePinyins = getTonePinyins(level.letter);

  // 高亮当前关卡对应的声调
  const currentTone = level.tone;

  const handlePlayTone = async (toneNum: number) => {
    if (activeTone !== null) return;
    setActiveTone(toneNum);
    try {
      await playPinyin(tonePinyins[toneNum - 1], { rate: 0.4 });
    } catch {}
    setTimeout(() => setActiveTone(null), 2000);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <LearnTopBar step={3} />

      <Text style={[styles.title, { fontSize: 22 * fontSizeMultiplier }]}>
        声调手势魔法操
      </Text>

      {/* 当前拼音展示 */}
      <View style={styles.headerCard}>
        <Text style={[styles.headerPinyin, { fontSize: 48 * fontSizeMultiplier }]}>
          {level.letter}
        </Text>
        <Text style={[styles.headerLabel, { fontSize: 16 * fontSizeMultiplier }]}>
          {level.pinyin} —— 第{currentTone}声（本关重点）
        </Text>
        <View style={[styles.focusBadge, { backgroundColor: (TONE_CONFIG[currentTone] || TONE_CONFIG[1]).color }]}>
          <Text style={styles.focusText}>
            {(TONE_CONFIG[currentTone] || TONE_CONFIG[1]).rhyme}
          </Text>
        </View>
      </View>

      {/* 四声对比区 */}
      <Text style={[styles.sectionTitle, { fontSize: 16 * fontSizeMultiplier }]}>
        四声对比 · 点击每个声调听发音和看手势
      </Text>

      <View style={styles.toneGrid}>
        {[1, 2, 3, 4].map((toneNum) => (
          <View
            key={toneNum}
            style={[
              styles.toneSlot,
              toneNum === currentTone && styles.toneSlotHighlight,
            ]}
          >
            {/* 当前关卡的声调标记 */}
            {toneNum === currentTone && (
              <View style={styles.starBadge}>
                <Text style={styles.starText}>本关</Text>
              </View>
            )}
            <ToneCard
              tone={toneNum as ToneNumber}
              pinyin={tonePinyins[toneNum - 1]}
              playing={activeTone === toneNum}
              onPlay={() => handlePlayTone(toneNum)}
              fontSizeMultiplier={fontSizeMultiplier}
            />
          </View>
        ))}
      </View>

      {/* 手势指导提示 */}
      <View style={styles.tipBox}>
        <Text style={[styles.tipTitle, { fontSize: 15 * fontSizeMultiplier }]}>
          🤚 跟着手指一起做手势！
        </Text>
        <Text style={[styles.tipText, { fontSize: 13 * fontSizeMultiplier }]}>
          每个声调都有不同的手势方向。一边听发音，一边用手比划，能让声调记得更牢哦！建议每个声调练习 3 次以上。
        </Text>
      </View>

      {/* CTA */}
      <PrimaryButton
        title="我学会了"
        onPress={() => router.push(`/learn/practice?id=${level.id}`)}
        style={styles.cta}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBackground },
  content: {
    padding: Spacing.pagePadding,
    paddingBottom: 100,
    alignItems: 'center',
    gap: Spacing.elementGap,
  },
  title: {
    fontFamily: FontFamily.primary,
    fontWeight: "800",
    color: Colors.magicPurple,
    textAlign: 'center',
    marginTop: 4,
  },
  headerCard: {
    backgroundColor: Colors.pureWhite,
    borderRadius: 24,
    alignItems: 'center',
    gap: 8,
    padding: 20,
    width: '100%',
    shadowColor: 'rgba(140, 92, 245, 0.15)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16, elevation: 3,
  },
  headerPinyin: {
    fontFamily: FontFamily.primary,
    fontWeight: "800",
    color: Colors.magicPurple,
  },
  headerLabel: {
    fontFamily: FontFamily.primary,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  focusBadge: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12,
  },
  focusText: {
    fontFamily: FontFamily.primary, fontSize: 14, fontWeight: "700",
    color: Colors.pureWhite,
  },
  sectionTitle: {
    fontFamily: FontFamily.primary, fontWeight: "700",
    color: Colors.textPrimary, textAlign: 'center',
  },
  toneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  toneSlot: {
    width: '48%',
    position: 'relative',
  },
  toneSlotHighlight: {
    // 当前关卡的声调稍微突出
  },
  starBadge: {
    position: 'absolute', top: -4, right: 8, zIndex: 10,
    backgroundColor: '#F59E0A',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
    shadowColor: 'rgba(245, 158, 10, 0.3)',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4, elevation: 2,
  },
  starText: {
    fontFamily: FontFamily.primary, fontSize: 10, fontWeight: "700",
    color: Colors.pureWhite,
  },
  tipBox: {
    backgroundColor: Colors.glowPurple,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    gap: 6,
  },
  tipTitle: {
    fontFamily: FontFamily.primary, fontWeight: "700",
    color: Colors.magicPurple,
  },
  tipText: {
    fontFamily: FontFamily.primary, color: Colors.textPrimary,
    lineHeight: 20,
  },
  cta: { width: '100%', marginTop: 8 },
});
