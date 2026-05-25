// Step 2 - 口型模仿 - 简洁清晰的口型展示
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { PrimaryButton, LearnTopBar } from '@/components';
import { getLevelById } from '@/data/curriculum';
import { useResponsive } from '@/hooks/useResponsive';
import { playPinyin } from '@/services/audio';

// 口型数据映射：根据 mouthGuide 文字返回具体形状参数
type MouthConfig = {
  label: string;
  width: number;     // 口型宽度比例
  height: number;    // 口型高度比例
  roundness: number; // 圆角程度
  desc: string;      // 一句话描述
};

const MOUTH_SHAPES: Record<string, MouthConfig> = {
  a:  { label: '嘴巴张大', width: 55, height: 42, roundness: 12, desc: '像医生检查喉咙说"啊"' },
  o:  { label: '嘴巴圆圆', width: 40, height: 40, roundness: 20, desc: '像吹泡泡一样圆圆的' },
  e:  { label: '嘴巴扁扁', width: 50, height: 20, roundness: 10, desc: '像微笑时嘴角往两边咧' },
  i:  { label: '牙齿对齐', width: 36, height: 16, roundness: 8, desc: '牙齿对齐，像说"一"' },
  u:  { label: '嘴巴凸起', width: 28, height: 28, roundness: 14, desc: '像吹蜡烛，嘴巴向前' },
  ü:  { label: '嘴巴翘起', width: 26, height: 26, roundness: 13, desc: '像吹口哨，嘴巴噘起来' },
};

function detectMouthConfig(letter: string, mouthGuide: string): MouthConfig {
  // 先拿 letter 的首字母匹配
  const firstChar = letter.charAt(0).toLowerCase();
  if (MOUTH_SHAPES[firstChar]) return MOUTH_SHAPES[firstChar];
  // 再根据 guide 文字判断
  if (mouthGuide.includes('张大')) return MOUTH_SHAPES['a'];
  if (mouthGuide.includes('圆圆') || mouthGuide.includes('收圆')) return MOUTH_SHAPES['o'];
  if (mouthGuide.includes('扁扁') || mouthGuide.includes('咧开')) return MOUTH_SHAPES['e'];
  if (mouthGuide.includes('对齐') || mouthGuide.includes('牙齿')) return MOUTH_SHAPES['i'];
  if (mouthGuide.includes('凸起') || mouthGuide.includes('向前') || mouthGuide.includes('吹蜡烛')) return MOUTH_SHAPES['u'];
  if (mouthGuide.includes('翘起') || mouthGuide.includes('吹口哨')) return MOUTH_SHAPES['ü'];
  // 默认圆唇
  return { label: '嘴巴圆圆的', width: 42, height: 42, roundness: 20, desc: '嘴唇收圆' };
}

// ---- 口型演示组件 ----
function MouthDemo({ config, playing }: { config: MouthConfig; playing: boolean }) {
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const openAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (playing) {
      // 张嘴动画
      const open = Animated.loop(
        Animated.sequence([
          Animated.timing(openAnim, {
            toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: false,
          }),
          Animated.timing(openAnim, {
            toValue: 0, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: false,
          }),
        ]),
      );
      open.start();
      return () => open.stop();
    }
    // 不播放时轻微呼吸
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, { toValue: 1.06, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breatheAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    breathe.start();
    return () => breathe.stop();
  }, [playing]);

  const mouthHeight = openAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [config.height, config.height * 1.8],
  });
  const mouthWidth = openAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [config.width, config.width * 0.75],
  });

  return (
    <Animated.View style={[demoStyles.faceCircle, { transform: [{ scale: breatheAnim }] }]}>
      {/* 眼睛 */}
      <View style={[demoStyles.eye, { left: 38, top: 38 }]} />
      <View style={[demoStyles.eye, { right: 38, top: 38 }]} />
      {/* 鼻子 */}
      <View style={demoStyles.nose} />
      {/* 口型 */}
      <Animated.View style={[
        demoStyles.mouth,
        playing
          ? { width: mouthWidth, height: mouthHeight, borderRadius: config.roundness * 0.8 }
          : { width: config.width, height: config.height, borderRadius: config.roundness },
      ]} />
      {/* 标签 */}
      <Text style={demoStyles.label}>{config.label}</Text>
    </Animated.View>
  );
}

const demoStyles = StyleSheet.create({
  faceCircle: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#FFF5EE',
    alignItems: 'center',
    borderWidth: 3, borderColor: '#F0D8C0',
    position: 'relative',
  },
  eye: {
    position: 'absolute',
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#333',
  },
  nose: {
    position: 'absolute', top: 70,
    width: 10, height: 7, borderRadius: 5,
    backgroundColor: '#E8C8A0',
  },
  mouth: {
    backgroundColor: '#E86868',
    position: 'absolute', top: 105,
  },
  label: {
    position: 'absolute', bottom: 22,
    fontFamily: FontFamily.primary, fontSize: 13,
    fontWeight: "600", color: Colors.magicPurple,
  },
});

// ---- 小镜子弹窗 ----
function MirrorModal({ config, onClose }: { config: MouthConfig; onClose: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 300, useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[mirrorStyles.overlay, { opacity: fadeAnim }]}>
      <TouchableOpacity style={mirrorStyles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={mirrorStyles.panel}>
        <View style={mirrorStyles.mirrorFrame}>
          <View style={mirrorStyles.mirrorGlass}>
            {/* 镜面反射的脸 */}
            <View style={mirrorStyles.mirrorFace}>
              <View style={[mirrorStyles.mEye, { left: 38, top: 36 }]} />
              <View style={[mirrorStyles.mEye, { right: 38, top: 36 }]} />
              <View style={mirrorStyles.mNose} />
              <View style={[mirrorStyles.mMouth, {
                width: config.width * 0.85,
                height: config.height * 0.85,
                borderRadius: config.roundness * 0.85,
              }]} />
            </View>
            {/* 高光 */}
            <View style={mirrorStyles.glare} />
          </View>
        </View>
        <Text style={mirrorStyles.title}>🪞 魔法小镜子</Text>
        <Text style={mirrorStyles.hint}>看看镜子里，{config.desc}</Text>
        <View style={mirrorStyles.steps}>
          <Text style={mirrorStyles.step}>① 看口型 → ② 记住它 → ③ 自己试</Text>
        </View>
        <TouchableOpacity style={mirrorStyles.closeBtn} onPress={onClose}>
          <Text style={mirrorStyles.closeText}>收起小镜子</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const mirrorStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, zIndex: 100,
    justifyContent: 'center', alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)',
  },
  panel: {
    backgroundColor: Colors.pureWhite, borderRadius: 28,
    padding: 24, alignItems: 'center', gap: 16,
    width: '85%', maxWidth: 360,
    shadowColor: 'rgba(140,92,245,0.20)',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 24, elevation: 10,
  },
  mirrorFrame: {
    borderRadius: 24, padding: 6,
    backgroundColor: '#C8B8E8',
  },
  mirrorGlass: {
    width: 180, height: 180, borderRadius: 20,
    backgroundColor: '#D0E0F5', position: 'relative',
    overflow: 'hidden',
  },
  mirrorFace: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: '#FFF5EE',
    alignSelf: 'center', marginTop: 10,
    alignItems: 'center',
  },
  mEye: {
    position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: '#4477AA',
  },
  mNose: {
    position: 'absolute', top: 60, width: 8, height: 6, borderRadius: 4, backgroundColor: '#A0B8D8',
  },
  mMouth: {
    backgroundColor: '#C87A7A',
    position: 'absolute', top: 88, opacity: 0.7,
  },
  glare: {
    position: 'absolute', top: 6, right: 6,
    width: 60, height: 40, backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 30, transform: [{ rotate: '-25deg' }],
  },
  title: {
    fontFamily: FontFamily.primary, fontSize: 20, fontWeight: "800",
    color: Colors.magicPurple,
  },
  hint: {
    fontFamily: FontFamily.primary, fontSize: 15, color: Colors.textPrimary,
    textAlign: 'center',
  },
  steps: {
    backgroundColor: Colors.glowPurple, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  step: {
    fontFamily: FontFamily.primary, fontSize: 14, fontWeight: "600",
    color: Colors.magicPurple,
  },
  closeBtn: {
    backgroundColor: Colors.magicPurple, borderRadius: 20,
    paddingVertical: 12, paddingHorizontal: 32,
    shadowColor: 'rgba(140,92,245,0.25)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4,
  },
  closeText: {
    fontFamily: FontFamily.primary, fontSize: 15, fontWeight: "600",
    color: Colors.pureWhite,
  },
});

// ========================
// Main Page
// ========================
export default function MouthPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const level = getLevelById(id ?? 'a');
  const { cardWidth, fontSizeMultiplier } = useResponsive();
  const [showMirror, setShowMirror] = useState(false);
  const [playing, setPlaying] = useState(false);

  if (!level) return null;

  const mouthConfig = detectMouthConfig(level.letter, level.mouthGuide);

  const handlePlay = async () => {
    setPlaying(true);
    try { await playPinyin(level.pinyin, { rate: 0.4 }); } catch {}
    setTimeout(() => setPlaying(false), 3000);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LearnTopBar step={2} />

        <Text style={[styles.title, { fontSize: 24 * fontSizeMultiplier }]}>
          像公主一样做口型
        </Text>

        {/* 口型演示 */}
        <View style={[styles.demoCard, { width: cardWidth }]}>
          <MouthDemo config={mouthConfig} playing={playing} />

          <Text style={[styles.pinyinBig, { fontSize: 44 * fontSizeMultiplier }]}>
            {level.letter}
          </Text>
          <Text style={[styles.pinyinSub, { fontSize: 18 * fontSizeMultiplier }]}>
            {level.pinyin}
          </Text>

          <TouchableOpacity
            style={[styles.listenBtn, playing && styles.listenBtnActive]}
            activeOpacity={0.8}
            onPress={handlePlay}
          >
            <Text style={styles.listenIcon}>{playing ? '🔊' : '🔈'}</Text>
            <Text style={styles.listenText}>
              {playing ? '正在发音...' : '点击听发音'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 口型指导 */}
        <View style={styles.guideBox}>
          <Text style={styles.guideIcon}>👄</Text>
          <View style={styles.guideTextWrap}>
            <Text style={[styles.guideTitle, { fontSize: 16 * fontSizeMultiplier }]}>
              {mouthConfig.label}
            </Text>
            <Text style={[styles.guideDesc, { fontSize: 14 * fontSizeMultiplier }]}>
              {level.mouthGuide}
            </Text>
          </View>
        </View>

        {/* 打开小镜子 */}
        <TouchableOpacity
          style={[styles.mirrorBtn, { width: cardWidth }]}
          activeOpacity={0.8}
          onPress={() => setShowMirror(true)}
        >
          <Text style={styles.mirrorEmoji}>🪞</Text>
          <Text style={[styles.mirrorText, { fontSize: 16 * fontSizeMultiplier }]}>
            打开小镜子，跟我做口型
          </Text>
        </TouchableOpacity>

        <Text style={styles.encourage}>
          💪 多练习几次，你的嘴巴会越来越听话！
        </Text>

        <PrimaryButton
          title="我做到了！"
          onPress={() => router.push(`/learn/tones?id=${level.id}`)}
          style={styles.cta}
        />
      </ScrollView>

      {showMirror && (
        <MirrorModal config={mouthConfig} onClose={() => setShowMirror(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBackground },
  scroll: { flex: 1 },
  content: {
    padding: Spacing.pagePadding, paddingBottom: 100,
    alignItems: 'center', gap: Spacing.elementGap,
  },
  title: {
    fontFamily: FontFamily.primary, fontWeight: "800",
    color: Colors.magicPurple, textAlign: 'center',
  },
  demoCard: {
    backgroundColor: Colors.pureWhite, borderRadius: 24,
    padding: 24, alignItems: 'center', gap: 12,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16, elevation: 3,
  },
  pinyinBig: {
    fontFamily: FontFamily.primary, fontWeight: "800",
    color: Colors.textPrimary,
  },
  pinyinSub: {
    fontFamily: FontFamily.primary, fontWeight: "600",
    color: Colors.textSecondary,
  },
  listenBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.glowPurple,
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
  },
  listenBtnActive: { backgroundColor: Colors.stagePink },
  listenIcon: { fontSize: 18 },
  listenText: {
    fontFamily: FontFamily.primary, fontSize: 14, fontWeight: "600",
    color: Colors.magicPurple,
  },
  guideBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.pureWhite, borderRadius: 16,
    padding: 16, width: '100%',
    shadowColor: 'rgba(0,0,0,0.03)',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 1,
  },
  guideIcon: { fontSize: 28, marginTop: 2 },
  guideTextWrap: { flex: 1, gap: 4 },
  guideTitle: {
    fontFamily: FontFamily.primary, fontWeight: "700",
    color: Colors.magicPurple,
  },
  guideDesc: {
    fontFamily: FontFamily.primary, color: Colors.textPrimary,
    lineHeight: 22,
  },
  mirrorBtn: {
    height: 56, backgroundColor: Colors.magicPurple, borderRadius: 28,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: 'rgba(140,92,245,0.30)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4,
  },
  mirrorEmoji: { fontSize: 22 },
  mirrorText: {
    fontFamily: FontFamily.primary, fontWeight: "600",
    color: Colors.pureWhite,
  },
  encourage: {
    fontFamily: FontFamily.primary, fontSize: 14, fontWeight: "500",
    color: Colors.stagePink, textAlign: 'center',
  },
  cta: { width: '100%', marginTop: 8 },
});
