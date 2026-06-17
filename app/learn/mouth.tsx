// Step 2 - 口型模仿 - 含前置摄像头镜像 + 口型动画演示
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { PrimaryButton, LearnTopBar } from '@/components';
import { getLevelById } from '@/data/curriculum';
import { useResponsive } from '@/hooks/useResponsive';
import { playPinyin, getMouthVideoUrl } from '@/services/audio';

// 口型数据映射
type MouthConfig = {
  label: string;
  width: number;
  height: number;
  roundness: number;
  desc: string;
  cameraHint: string;
};

const MOUTH_SHAPES: Record<string, MouthConfig> = {
  a:  { label: '嘴巴张大', width: 55, height: 42, roundness: 12, desc: '像医生检查喉咙说"啊"', cameraHint: '张开嘴巴，露出牙齿，舌头放平' },
  o:  { label: '嘴巴圆圆', width: 40, height: 40, roundness: 20, desc: '像吹泡泡一样圆圆的', cameraHint: '嘴唇收圆，像含着一颗糖果' },
  e:  { label: '嘴巴扁扁', width: 50, height: 20, roundness: 10, desc: '像微笑时嘴角往两边咧', cameraHint: '嘴角向两边咧开，嘴巴扁扁的' },
  i:  { label: '牙齿对齐', width: 36, height: 16, roundness: 8, desc: '牙齿对齐，像说"一"', cameraHint: '上下牙齿轻轻对齐，嘴角咧开' },
  u:  { label: '嘴巴凸起', width: 28, height: 28, roundness: 14, desc: '像吹蜡烛，嘴巴向前', cameraHint: '嘴唇向前凸起，像要吹灭蜡烛' },
  ü: { label: '嘴巴翘起', width: 26, height: 26, roundness: 13, desc: '像吹口哨，嘴巴噘起来', cameraHint: '嘴巴噘起，像吹口哨的样子' },
};

function detectMouthConfig(letter: string, mouthGuide: string): MouthConfig {
  const firstChar = letter.charAt(0).toLowerCase();
  if (MOUTH_SHAPES[firstChar]) return MOUTH_SHAPES[firstChar];
  if (mouthGuide.includes('张大')) return MOUTH_SHAPES['a'];
  if (mouthGuide.includes('圆圆') || mouthGuide.includes('收圆')) return MOUTH_SHAPES['o'];
  if (mouthGuide.includes('扁扁') || mouthGuide.includes('咧开')) return MOUTH_SHAPES['e'];
  if (mouthGuide.includes('对齐') || mouthGuide.includes('牙齿')) return MOUTH_SHAPES['i'];
  if (mouthGuide.includes('凸起') || mouthGuide.includes('向前') || mouthGuide.includes('吹蜡烛')) return MOUTH_SHAPES['u'];
  if (mouthGuide.includes('翘起') || mouthGuide.includes('吹口哨')) return MOUTH_SHAPES['ü'];
  return { label: '嘴巴圆圆的', width: 42, height: 42, roundness: 20, desc: '嘴唇收圆', cameraHint: '嘴唇收圆' };
}

// ---- 嵌入式口型视频（直接嵌入卡片，无弹窗） ----
function EmbeddedMouthVideo({ videoUrl }: { videoUrl: string }) {
  const containerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 清理视频元素
  const cleanupVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
      videoRef.current.remove();
      videoRef.current = null;
    }
  }, []);

  // ref callback：在 DOM 节点挂载时立即注入 video 元素
  const setContainerRef = useCallback((node: any) => {
    if (!node) return;
    containerRef.current = node;

    if (Platform.OS !== 'web') return;

    // 用 setTimeout 确保 RN Web 完成 DOM 提交
    setTimeout(() => {
      // 获取真实 DOM 元素（RN Web 的 View ref 直接就是 HTMLElement）
      const domNode: HTMLElement | null =
        typeof node.getDOMNode === 'function'
          ? node.getDOMNode()
          : (node as unknown as HTMLElement);
      if (!domNode) return;

      // 移除旧的视频
      const old = domNode.querySelector('[data-mouth-inline]');
      if (old) old.remove();

      const video = document.createElement('video');
      video.src = videoUrl;
      video.autoplay = false;
      video.muted = false;
      video.loop = true;
      video.playsInline = true;
      video.controls = true;
      video.setAttribute('playsinline', '');
      video.style.cssText = 'width:100%;height:280px;object-fit:contain;border-radius:16px;background:#1a1a2e;display:block;';
      video.setAttribute('data-mouth-inline', 'true');
      domNode.appendChild(video);
      videoRef.current = video;
    }, 50);
  }, [videoUrl]);

  // videoUrl 变化时重建视频
  useEffect(() => {
    if (!containerRef.current || Platform.OS !== 'web') return;
    const domNode: HTMLElement | null =
      typeof containerRef.current.getDOMNode === 'function'
        ? containerRef.current.getDOMNode()
        : (containerRef.current as unknown as HTMLElement);
    if (!domNode) return;

    const old = domNode.querySelector('[data-mouth-inline]');
    if (old) old.remove();
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current = null;
    }

    const video = document.createElement('video');
    video.src = videoUrl;
    video.autoplay = false;
    video.muted = false;
    video.loop = true;
    video.playsInline = true;
    video.controls = true;
    video.setAttribute('playsinline', '');
    video.style.cssText = 'width:100%;height:280px;object-fit:contain;border-radius:16px;background:#1a1a2e;display:block;';
    video.setAttribute('data-mouth-inline', 'true');
    domNode.appendChild(video);
    videoRef.current = video;
  }, [videoUrl]);

  // 卸载时清理
  useEffect(() => {
    return () => {
      cleanupVideo();
    };
  }, [cleanupVideo]);

  // @ts-ignore
  return <View ref={setContainerRef} style={inlineVideoStyles.wrapper} />;
}

const inlineVideoStyles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },
});

// ---- 口型演示组件（视频优先，无视频时回退动画） ----
function MouthDemo({ config, playing, videoUrl }: { config: MouthConfig; playing: boolean; videoUrl: string | null }) {
  // 有视频时，直接显示嵌入式视频播放器
  if (videoUrl) {
    return <EmbeddedMouthVideo videoUrl={videoUrl} />;
  }

  // 无视频时，显示原有的动画小人
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const openAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (playing) {
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
      <View style={[demoStyles.eye, { left: 38, top: 38 }]} />
      <View style={[demoStyles.eye, { right: 38, top: 38 }]} />
      <View style={demoStyles.nose} />
      <Animated.View style={[
        demoStyles.mouth,
        playing
          ? { width: mouthWidth, height: mouthHeight, borderRadius: config.roundness * 0.8 }
          : { width: config.width, height: config.height, borderRadius: config.roundness },
      ]} />
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

// ---- 前置摄像头组件 ----
function CameraMirror({ config, onClose }: { config: MouthConfig; onClose: () => void }) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const streamRef = useRef<MediaStream | null>(null);
  // 用 ref 保存 DOM 元素引用，避免 React 协调冲突
  const videoContainerRef = useCallback((node: any) => {
    if (!node) return;
    // React Native Web 的 View ref 拿到的是 DOM 元素
    const domNode = node?._nativeTag !== undefined ? node : (node as unknown as HTMLElement);
    // 直接操作 DOM 元素即可（React 不会干预 ref callback 内的操作）
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 300, useNativeDriver: true,
    }).start();

    if (Platform.OS !== 'web') {
      setCameraError('请使用手机/平板App体验摄像头功能');
      return;
    }

    let cancelled = false;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;

        // 等待 DOM 就绪后添加 video 元素
        requestAnimationFrame(() => {
          if (cancelled) return;
          const container = document.getElementById('camera-video-container');
          if (container && stream) {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.playsInline = true;
            video.muted = true;
            video.setAttribute('playsinline', '');
            video.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:20px;transform:scaleX(-1);';
            // 标记为非 React 管理的 DOM 节点
            video.setAttribute('data-mirror-video', 'true');
            container.appendChild(video);
            setCameraReady(true);
          }
        });
      } catch (err: any) {
        if (cancelled) return;
        if (err.name === 'NotAllowedError') {
          setCameraError('需要摄像头权限才能使用小镜子功能，请在浏览器设置中允许访问摄像头');
        } else if (err.name === 'NotFoundError') {
          setCameraError('未检测到摄像头设备');
        } else {
          setCameraError('无法启动摄像头：' + (err.message || '未知错误'));
        }
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // 清理函数：组件卸载时移除 video 元素
  useEffect(() => {
    return () => {
      const container = document.getElementById('camera-video-container');
      if (container) {
        const video = container.querySelector('[data-mirror-video]');
        if (video) video.remove();
      }
    };
  }, []);

  return (
    <Animated.View style={[mirrorStyles.overlay, { opacity: fadeAnim }]}>
      <TouchableOpacity style={mirrorStyles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={mirrorStyles.panel}>
        {/* 标题栏 */}
        <View style={mirrorStyles.titleRow}>
          <Text style={mirrorStyles.title}>🪞 魔法小镜子</Text>
          <TouchableOpacity style={mirrorStyles.closeX} onPress={onClose}>
            <Text style={mirrorStyles.closeXText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* 摄像头区域 - 用一个空的 div 作为 video 容器 */}
        <View style={mirrorStyles.cameraFrame}>
          {/* @ts-ignore - React Native Web 支持原生 props */}
          <View
            // @ts-ignore
            nativeID="camera-video-container"
            style={mirrorStyles.cameraArea}
          >
            {!cameraReady && !cameraError && (
              <View style={mirrorStyles.loadingWrap}>
                <Text style={mirrorStyles.loadingText}>正在打开摄像头...</Text>
              </View>
            )}
            {cameraError && (
              <View style={mirrorStyles.errorWrap}>
                <Text style={mirrorStyles.errorEmoji}>📷</Text>
                <Text style={mirrorStyles.errorText}>{cameraError}</Text>
              </View>
            )}
          </View>

          {/* 当前口型小图参考（叠加在摄像头右上角） */}
          <View style={mirrorStyles.refBadge}>
            <Text style={mirrorStyles.refText}>{config.label}</Text>
          </View>
        </View>

        {/* 提示文字 */}
        <View style={mirrorStyles.hintBox}>
          <Text style={mirrorStyles.hintEmoji}>{'👄'}</Text>
          <View style={mirrorStyles.hintContent}>
            <Text style={mirrorStyles.hintTitle}>
              跟着做口型：{config.label}
            </Text>
            <Text style={mirrorStyles.hintDesc}>
              {config.cameraHint}
            </Text>
          </View>
        </View>

        {/* 三步引导 */}
        <View style={mirrorStyles.stepsRow}>
          {['看口型示范', '对着镜子练', '检查嘴巴对不对'].map((step, i) => (
            <View key={i} style={mirrorStyles.stepItem}>
              <View style={mirrorStyles.stepNum}>
                <Text style={mirrorStyles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={mirrorStyles.stepLabel}>{step}</Text>
            </View>
          ))}
        </View>

        {/* 关闭按钮 */}
        <TouchableOpacity style={mirrorStyles.closeBtn} onPress={onClose}>
          <Text style={mirrorStyles.closeBtnText}>收起小镜子</Text>
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
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)',
  },
  panel: {
    backgroundColor: Colors.pureWhite, borderRadius: 28,
    padding: 20, alignItems: 'center', gap: 14,
    width: '92%', maxWidth: 400,
    shadowColor: 'rgba(140,92,245,0.20)',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 24, elevation: 10,
  },
  titleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%',
  },
  title: {
    fontFamily: FontFamily.primary, fontSize: 20, fontWeight: "800",
    color: Colors.magicPurple,
  },
  closeX: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.glowPurple,
    alignItems: 'center', justifyContent: 'center',
  },
  closeXText: {
    fontSize: 14, fontWeight: "700", color: Colors.magicPurple,
  },
  cameraFrame: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  cameraArea: {
    width: '100%',
    height: 260,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingWrap: {
    alignItems: 'center', gap: 8,
  },
  loadingText: {
    fontFamily: FontFamily.primary, fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  errorWrap: {
    alignItems: 'center', gap: 8, paddingHorizontal: 24,
  },
  errorEmoji: { fontSize: 36 },
  errorText: {
    fontFamily: FontFamily.primary, fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  refBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(140,92,245,0.9)',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12,
  },
  refText: {
    fontFamily: FontFamily.primary, fontSize: 13, fontWeight: "700",
    color: Colors.pureWhite,
  },
  hintBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.glowPurple,
    borderRadius: 16, padding: 14,
    width: '100%',
  },
  hintEmoji: { fontSize: 28 },
  hintContent: { flex: 1, gap: 2 },
  hintTitle: {
    fontFamily: FontFamily.primary, fontSize: 15, fontWeight: "700",
    color: Colors.magicPurple,
  },
  hintDesc: {
    fontFamily: FontFamily.primary, fontSize: 13,
    color: Colors.textPrimary, lineHeight: 18,
  },
  stepsRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 12,
    width: '100%',
  },
  stepItem: {
    alignItems: 'center', gap: 4, flex: 1,
  },
  stepNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.magicPurple,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: {
    fontFamily: FontFamily.primary, fontSize: 12, fontWeight: "700",
    color: Colors.pureWhite,
  },
  stepLabel: {
    fontFamily: FontFamily.primary, fontSize: 11, fontWeight: "500",
    color: Colors.textSecondary, textAlign: 'center',
  },
  closeBtn: {
    backgroundColor: Colors.magicPurple, borderRadius: 20,
    paddingVertical: 12, paddingHorizontal: 32,
    shadowColor: 'rgba(140,92,245,0.25)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4,
  },
  closeBtnText: {
    fontFamily: FontFamily.primary, fontSize: 15, fontWeight: "600",
    color: Colors.pureWhite,
  },
});

// ---- 口型视频示范组件 ----
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
  const mouthVideoUrl = getMouthVideoUrl(level.id);

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

        {/* 口型演示卡片 */}
        <View style={[styles.demoCard, { width: cardWidth }]}>
          <MouthDemo config={mouthConfig} playing={playing} videoUrl={mouthVideoUrl} />

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

        {/* 打开小镜子 - 前置摄像头 */}
        <TouchableOpacity
          style={[styles.mirrorBtn, { width: cardWidth }]}
          activeOpacity={0.8}
          onPress={() => setShowMirror(true)}
        >
          <Text style={styles.mirrorEmoji}>📸</Text>
          <View style={styles.mirrorTextWrap}>
            <Text style={[styles.mirrorTextMain, { fontSize: 16 * fontSizeMultiplier }]}>
              打开小镜子，看我做口型
            </Text>
            <Text style={styles.mirrorTextSub}>
              使用前置摄像头，看宝贝有没有跟着做
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.encourage}>
          💪 多练习几次，你的嘴巴会越来越听话！
        </Text>

        <PrimaryButton
          title="我做到了！"
          onPress={() => router.push(`/learn/${level.type === 'initial' ? 'spell' : 'tones'}?id=${level.id}`)}
          style={styles.cta}
        />
      </ScrollView>

      {showMirror && (
        <CameraMirror config={mouthConfig} onClose={() => setShowMirror(false)} />
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
    height: 'auto',
    backgroundColor: Colors.magicPurple, borderRadius: 20,
    flexDirection: 'row', alignItems: 'center',
    gap: 12,
    paddingVertical: 16, paddingHorizontal: 20,
    shadowColor: 'rgba(140,92,245,0.30)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4,
  },
  mirrorEmoji: { fontSize: 28 },
  mirrorTextWrap: { flex: 1, gap: 2 },
  mirrorTextMain: {
    fontFamily: FontFamily.primary, fontWeight: "600",
    color: Colors.pureWhite,
  },
  mirrorTextSub: {
    fontFamily: FontFamily.primary, fontSize: 12, fontWeight: "400",
    color: 'rgba(255,255,255,0.75)',
  },
  encourage: {
    fontFamily: FontFamily.primary, fontSize: 14, fontWeight: "500",
    color: Colors.stagePink, textAlign: 'center',
  },
  cta: { width: '100%', marginTop: 8 },
});
