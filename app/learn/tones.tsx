// 06-声调手势操 - 声调动画 + 跟我做交互
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { PrimaryButton, LearnTopBar } from '@/components';
import { getLevelById } from '@/data/curriculum';
import { useResponsive } from '@/hooks/useResponsive';
import type { ToneNumber } from '@/data/types';

// ---- 声调动画组件 ----
const TONE_CONFIG: Record<number, {
  hint: string;
  path: Array<{ x: number; y: number }>;
  rhymeColor: string;
}> = {
  1: {
    hint: '右手平伸，从胸前平稳滑向右侧',
    path: [{ x: 30, y: 60 }, { x: 200, y: 60 }],
    rhymeColor: Colors.stageGreen,
  },
  2: {
    hint: '右手从左下向右上扬起',
    path: [{ x: 30, y: 80 }, { x: 200, y: 30 }],
    rhymeColor: Colors.stageBlue,
  },
  3: {
    hint: '右手先向下再向上，画一个对勾',
    path: [{ x: 30, y: 40 }, { x: 100, y: 85 }, { x: 200, y: 35 }],
    rhymeColor: Colors.stageGold,
  },
  4: {
    hint: '右手从左上向右下快速下降',
    path: [{ x: 30, y: 30 }, { x: 200, y: 85 }],
    rhymeColor: Colors.stagePink,
  },
};

// 声调口诀映射
const TONE_RHYMES: Record<number, string[]> = {
  1: ['一声高高平又平', '像飞机在天空平稳飞行'],
  2: ['二声就像上山坡', '像爬楼梯一步一步往上'],
  3: ['三声下坡又上坡', '像打勾勾先下后上'],
  4: ['四声快快往下降', '像坐滑梯嗖的滑下来'],
};

function ToneAnimation({ tone, playing }: { tone: ToneNumber; playing: boolean }) {
  const dotAnim = useRef(new Animated.Value(0)).current;
  const pathAnim = useRef(new Animated.Value(0)).current;
  const config = TONE_CONFIG[tone] || TONE_CONFIG[1];

  useEffect(() => {
    if (playing) {
      dotAnim.setValue(0);
      pathAnim.setValue(0);
      Animated.parallel([
        Animated.timing(dotAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pathAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [playing, tone]);

  const points = config.path;
  const svgPath = points.map((p, i) =>
    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
  ).join(' ');

  // 计算圆点位置（沿路径插值）
  const dotX = dotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [points[0].x, points[points.length - 1].x],
  });
  const dotY = dotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [points[0].y, points[points.length - 1].y],
  });

  return (
    <View style={animStyles.container}>
      {/* 手势区域 */}
      <View style={animStyles.canvas}>
        {/* 背景路径（虚线风格） */}
        <View style={animStyles.pathBg}>
          {tone === 1 && <View style={[animStyles.pathLine, animStyles.tone1Line]} />}
          {tone === 2 && <View style={[animStyles.pathLine, animStyles.tone2Line]} />}
          {tone === 3 && <View style={[animStyles.pathLine, animStyles.tone3Line]} />}
          {tone === 4 && <View style={[animStyles.pathLine, animStyles.tone4Line]} />}
        </View>
        {/* 动画圆点 */}
        {playing && (
          <Animated.View style={[
            animStyles.dot,
            {
              transform: [
                { translateX: Animated.subtract(dotX, 12) },
                { translateY: Animated.subtract(dotY, 12) },
              ],
            },
          ]}>
            <Text style={animStyles.dotEmoji}>👆</Text>
          </Animated.View>
        )}
        {/* 起始和结束标记 */}
        <View style={[animStyles.marker, { left: points[0].x - 6, top: points[0].y - 6 }]}>
          <Text style={animStyles.markerText}>起</Text>
        </View>
        <View style={[animStyles.marker, {
          left: points[points.length - 1].x - 6,
          top: points[points.length - 1].y - 6,
        }]}>
          <Text style={animStyles.markerText}>终</Text>
        </View>
      </View>
    </View>
  );
}

const animStyles = StyleSheet.create({
  container: { alignItems: 'center' },
  canvas: {
    width: 240, height: 130,
    backgroundColor: '#F5F0FF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.glowPurple,
    borderStyle: 'dashed',
    position: 'relative',
    overflow: 'hidden',
  },
  pathBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  pathLine: { position: 'absolute' },
  tone1Line: {
    left: 30, top: 58,
    width: 170, height: 4,
    backgroundColor: Colors.stageGreen,
    borderRadius: 2,
  },
  tone2Line: {
    left: 30, top: 82,
    width: 0, height: 0,
    borderLeftWidth: 85,
    borderRightWidth: 85,
    borderBottomWidth: 52,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.stageBlue,
    opacity: 0.7,
    transform: [{ rotate: '180deg' }, { scaleY: 0.5 }],
  },
  tone3Line: {
    left: 30, top: 32,
    width: 170, height: 55,
    borderBottomWidth: 3,
    borderColor: Colors.stageGold,
    borderRadius: 0,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    transform: [{ scaleY: 1.2 }],
  },
  tone4Line: {
    left: 28, top: 28,
    width: 0, height: 0,
    borderLeftWidth: 86,
    borderRightWidth: 86,
    borderTopWidth: 58,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.stagePink,
    opacity: 0.7,
  },
  dot: {
    position: 'absolute',
    width: 24, height: 24,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  dotEmoji: { fontSize: 20 },
  marker: {
    position: 'absolute',
    width: 20, height: 20,
    borderRadius: 10,
    backgroundColor: Colors.magicPurple,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 5,
  },
  markerText: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.pureWhite,
  },
});

// ---- 手势指导组件 ----
function GestureGuide({ tone, hint }: { tone: ToneNumber; hint: string }) {
  return (
    <View style={guideStyles.container}>
      <View style={guideStyles.iconWrap}>
        <Text style={guideStyles.icon}>
          {tone === 1 ? '➡️' : tone === 2 ? '↗️' : tone === 3 ? '↘️↗️' : '↘️'}
        </Text>
      </View>
      <Text style={guideStyles.text}>{hint}</Text>
    </View>
  );
}

const guideStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.pureWhite,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: Colors.glowPurple,
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 20 },
  text: {
    fontFamily: FontFamily.primary,
    fontSize: 14,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
});

// ---- Main Component ----
export default function TonesPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const level = getLevelById(id ?? 'b');
  const { cardWidth, fontSizeMultiplier } = useResponsive();
  const [playing, setPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  if (!level) return null;

  const tone = level.tone;
  const config = TONE_CONFIG[tone] || TONE_CONFIG[1];
  const rhymes = TONE_RHYMES[tone] || TONE_RHYMES[1];

  const handleFollow = () => {
    setPlaying(true);
    setPlayCount((c) => c + 1);
    // 动画结束后自动重置
    setTimeout(() => setPlaying(false), 1600);
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

      {/* 声调动画卡片 */}
      <View style={[styles.gestureCard, { width: cardWidth }]}>
        <Text style={[styles.levelPinyin, { fontSize: 48 * fontSizeMultiplier }]}>
          {level.pinyin}
        </Text>
        <Text style={[styles.levelLetter, { fontSize: 20 * fontSizeMultiplier }]}>
          {level.letter} —— 第{tone}声
        </Text>

        {/* 声调动画 */}
        <ToneAnimation tone={tone} playing={playing} />

        {/* 状态提示 */}
        <Text style={styles.statusText}>
          {playing ? '跟着手指移动...' : playCount > 0 ? `已完成 ${playCount} 次练习` : '点击下方按钮查看手势'}
        </Text>
      </View>

      {/* 口诀 */}
      <View style={styles.rhymeBox}>
        {rhymes.map((line, i) => (
          <Text key={i} style={[styles.rhymeText, {
            fontSize: (i === 0 ? 20 : 14) * fontSizeMultiplier,
            color: i === 0 ? Colors.magicPurple : Colors.textSecondary,
          }]}>
            {line}
          </Text>
        ))}
      </View>

      {/* 手势指导 */}
      <GestureGuide tone={tone} hint={level.toneGesture || config.hint} />

      {/* 跟我做按钮 */}
      <TouchableOpacity
        style={[styles.followBtn, { width: cardWidth }, playing && styles.followBtnActive]}
        activeOpacity={0.8}
        onPress={handleFollow}
        disabled={playing}
      >
        <Text style={styles.followIcon}>{playing ? '⏸' : '▶'}</Text>
        <Text style={[styles.followText, { fontSize: 16 * fontSizeMultiplier }]}>
          {playing ? '正在演示...' : '看手势，跟我做！'}
        </Text>
      </TouchableOpacity>

      {/* 练习计数 */}
      {playCount > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            🎯 已练习 {playCount} 次 {playCount >= 3 ? '✓ 真棒！' : '(建议练习3次以上)'}
          </Text>
        </View>
      )}

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
  gestureCard: {
    backgroundColor: Colors.pureWhite,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
    padding: Spacing.cardPadding,
  },
  levelPinyin: {
    fontFamily: FontFamily.primary,
    fontWeight: "800",
    color: Colors.magicPurple,
  },
  levelLetter: {
    fontFamily: FontFamily.primary,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  statusText: {
    fontFamily: FontFamily.primary,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  rhymeBox: {
    alignItems: 'center',
    backgroundColor: Colors.glowPurple,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  rhymeText: {
    fontFamily: FontFamily.primary,
    fontWeight: "800",
    textAlign: 'center',
    lineHeight: 24,
  },
  followBtn: {
    height: 56,
    backgroundColor: Colors.magicPurple,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: 'rgba(140, 92, 245, 0.30)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  followBtnActive: {
    backgroundColor: Colors.stagePink,
  },
  followIcon: {
    fontSize: 18,
    color: Colors.pureWhite,
  },
  followText: {
    fontFamily: FontFamily.primary,
    fontWeight: "600",
    color: Colors.pureWhite,
  },
  countBadge: {
    backgroundColor: Colors.pureWhite,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  countText: {
    fontFamily: FontFamily.primary,
    fontSize: 14,
    fontWeight: FontWeights.medium,
    color: Colors.stageGreen,
  },
  cta: { width: '100%', marginTop: 8 },
});
