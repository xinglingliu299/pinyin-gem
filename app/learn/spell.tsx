// Step 3 (声母) - 拼读教学 - 声母与韵母的拼读练习
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { PrimaryButton, LearnTopBar } from '@/components';
import { getLevelById } from '@/data/curriculum';
import { useResponsive } from '@/hooks/useResponsive';
import { playPinyin } from '@/services/audio';

// 三步拼读步骤状态
type SpellStep = 'idle' | 'consonant' | 'vowel' | 'blend';

const STEP_LABELS: Record<SpellStep, string> = {
  idle: '',
  consonant: '声母',
  vowel: '韵母',
  blend: '拼读',
};

// 三步拼读：声母 → 韵母 → 连读（带回调通知步骤）
async function playThreeStepSpell(
  consonant: string,
  vowel: string,
  syllable: string,
  onStep: (step: SpellStep) => void,
): Promise<void> {
  if (typeof window === 'undefined') return;

  const audioBase = () => {
    const seg = window.location.pathname.split('/').filter(Boolean);
    return seg.length >= 1 && seg[0] === 'pinyin-gem' ? '/pinyin-gem/assets/audio' : '/assets/audio';
  };

  const play = (src: string): Promise<void> => {
    return new Promise((resolve) => {
      const a = new window.Audio();
      a.src = `${audioBase()}/${src}?v=4`;
      a.onended = () => resolve();
      a.onerror = () => resolve();
      a.play().catch(() => resolve());
    });
  };

  // Step 1: 声母
  onStep('consonant');
  await play(`letter_${consonant}.mp3`);

  // Step 2: 韵母
  onStep('vowel');
  await play(`tone_${vowel}1.mp3`);

  // Step 3: 拼读
  onStep('blend');
  await play(spellToFilename(syllable));
}

function spellToFilename(pinyin: string): string {
  const map: Record<string, string> = {
    'ā': 'a1','ō': 'o1','ē': 'e1','ī': 'i1','ū': 'u1',
    'á': 'a2','ó': 'o2','é': 'e2','í': 'i2','ú': 'u2',
    'ǎ': 'a3','ǒ': 'o3','ě': 'e3','ǐ': 'i3','ǔ': 'u3',
    'à': 'a4','ò': 'o4','è': 'e4','ì': 'i4','ù': 'u4',
    'ǖ': 'v1','ǘ': 'v2','ǚ': 'v3','ǜ': 'v4',
  };
  let base = pinyin;
  for (const [k, v] of Object.entries(map)) {
    base = base.replace(k, v);
  }
  return `spell_${base}.mp3`;
}

// 声母拼读数据：哪个声母 + 哪些韵母 = 哪些音节
const SPELLING_DATA: Record<string, { vowel: string; syllable: string; display: string }[]> = {
  b: [{vowel:'a',syllable:'bā',display:'bā'},{vowel:'o',syllable:'bō',display:'bō'},{vowel:'i',syllable:'bī',display:'bī'},{vowel:'u',syllable:'bū',display:'bū'}],
  p: [{vowel:'a',syllable:'pā',display:'pā'},{vowel:'o',syllable:'pō',display:'pō'},{vowel:'i',syllable:'pī',display:'pī'},{vowel:'u',syllable:'pū',display:'pū'}],
  m: [{vowel:'a',syllable:'mā',display:'mā'},{vowel:'o',syllable:'mō',display:'mō'},{vowel:'i',syllable:'mī',display:'mī'},{vowel:'u',syllable:'mū',display:'mū'}],
  f: [{vowel:'a',syllable:'fā',display:'fā'},{vowel:'o',syllable:'fō',display:'fō'},{vowel:'u',syllable:'fū',display:'fū'}],
  d: [{vowel:'a',syllable:'dā',display:'dā'},{vowel:'e',syllable:'dē',display:'dē'},{vowel:'i',syllable:'dī',display:'dī'},{vowel:'u',syllable:'dū',display:'dū'}],
  t: [{vowel:'a',syllable:'tā',display:'tā'},{vowel:'e',syllable:'tē',display:'tē'},{vowel:'i',syllable:'tī',display:'tī'},{vowel:'u',syllable:'tū',display:'tū'}],
  n: [{vowel:'a',syllable:'nā',display:'nā'},{vowel:'e',syllable:'nē',display:'nē'},{vowel:'i',syllable:'nī',display:'nī'},{vowel:'u',syllable:'nú',display:'nú'},{vowel:'ü',syllable:'nǚ',display:'nǚ'}],
  l: [{vowel:'a',syllable:'lā',display:'lā'},{vowel:'e',syllable:'lē',display:'lē'},{vowel:'i',syllable:'lī',display:'lī'},{vowel:'u',syllable:'lú',display:'lú'},{vowel:'ü',syllable:'lǚ',display:'lǚ'}],
  g: [{vowel:'a',syllable:'gā',display:'gā'},{vowel:'e',syllable:'gē',display:'gē'},{vowel:'u',syllable:'gū',display:'gū'}],
  k: [{vowel:'a',syllable:'kā',display:'kā'},{vowel:'e',syllable:'kē',display:'kē'},{vowel:'u',syllable:'kū',display:'kū'}],
  h: [{vowel:'a',syllable:'hā',display:'hā'},{vowel:'e',syllable:'hē',display:'hē'},{vowel:'u',syllable:'hū',display:'hū'}],
  j: [{vowel:'i',syllable:'jī',display:'jī'},{vowel:'ü',syllable:'jū',display:'jū'}],
  q: [{vowel:'i',syllable:'qī',display:'qī'},{vowel:'ü',syllable:'qū',display:'qū'}],
  x: [{vowel:'i',syllable:'xī',display:'xī'},{vowel:'ü',syllable:'xū',display:'xū'}],
  zh: [{vowel:'a',syllable:'zhā',display:'zhā'},{vowel:'e',syllable:'zhē',display:'zhē'},{vowel:'i',syllable:'zhī',display:'zhī'},{vowel:'u',syllable:'zhū',display:'zhū'}],
  ch: [{vowel:'a',syllable:'chā',display:'chā'},{vowel:'e',syllable:'chē',display:'chē'},{vowel:'i',syllable:'chī',display:'chī'},{vowel:'u',syllable:'chū',display:'chū'}],
  sh: [{vowel:'a',syllable:'shā',display:'shā'},{vowel:'e',syllable:'shē',display:'shē'},{vowel:'i',syllable:'shī',display:'shī'},{vowel:'u',syllable:'shū',display:'shū'}],
  r: [{vowel:'e',syllable:'rē',display:'rē'},{vowel:'i',syllable:'rī',display:'rī'},{vowel:'u',syllable:'rú',display:'rú'}],
  z: [{vowel:'a',syllable:'zā',display:'zā'},{vowel:'e',syllable:'zē',display:'zē'},{vowel:'i',syllable:'zī',display:'zī'},{vowel:'u',syllable:'zū',display:'zū'}],
  c: [{vowel:'a',syllable:'cā',display:'cā'},{vowel:'e',syllable:'cē',display:'cē'},{vowel:'i',syllable:'cī',display:'cī'},{vowel:'u',syllable:'cū',display:'cū'}],
  s: [{vowel:'a',syllable:'sā',display:'sā'},{vowel:'e',syllable:'sē',display:'sē'},{vowel:'i',syllable:'sī',display:'sī'},{vowel:'u',syllable:'sū',display:'sū'}],
  y: [{vowel:'a',syllable:'yā',display:'yā'},{vowel:'e',syllable:'yē',display:'yē'},{vowel:'i',syllable:'yī',display:'yī'},{vowel:'u',syllable:'yū',display:'yū'}],
  w: [{vowel:'a',syllable:'wā',display:'wā'},{vowel:'o',syllable:'wō',display:'wō'},{vowel:'u',syllable:'wū',display:'wū'}],
};

// ---- 拼读卡片组件 ----
function SpellCard({
  consonant,
  vowel,
  syllable,
  display,
  isHighlight,
  onPress,
  fontSizeMultiplier,
  step,
}: {
  consonant: string;
  vowel: string;
  syllable: string;
  display: string;
  isHighlight: boolean;
  onPress: () => void;
  fontSizeMultiplier: number;
  step: SpellStep;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [animating, setAnimating] = useState(false);

  const handlePress = () => {
    setAnimating(true);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start(() => setAnimating(false));
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[cardStyles.card, isHighlight && cardStyles.cardHighlight]}
        activeOpacity={0.7}
        onPress={handlePress}
      >
        <View style={cardStyles.formulaRow}>
          <View style={cardStyles.block}>
            <Text style={[cardStyles.blockText, { fontSize: 24 * fontSizeMultiplier }]}>{consonant}</Text>
          </View>
          <Text style={cardStyles.plus}>+</Text>
          <View style={cardStyles.block}>
            <Text style={[cardStyles.blockText, { fontSize: 24 * fontSizeMultiplier }]}>{vowel}</Text>
          </View>
          <Text style={cardStyles.equals}>=</Text>
          <View style={[cardStyles.block, cardStyles.resultBlock]}>
            <Text style={[cardStyles.resultText, { fontSize: 24 * fontSizeMultiplier }]}>{display}</Text>
          </View>
        </View>
        {isHighlight && <Text style={cardStyles.badge}>本关</Text>}
        {step !== 'idle' && (
          <View style={cardStyles.stepBar}>
            <Text style={cardStyles.stepText}>
              {step === 'consonant' ? `「${consonant}」声母` : step === 'vowel' ? `「${vowel}」韵母` : `「${display}」拼读`}
            </Text>
            <View style={cardStyles.stepDots}>
              <View style={[cardStyles.stepDot, step === 'consonant' ? cardStyles.stepDotActive : step === 'vowel' || step === 'blend' ? cardStyles.stepDotDone : {}]} />
              <View style={[cardStyles.stepDot, step === 'vowel' ? cardStyles.stepDotActive : step === 'blend' ? cardStyles.stepDotDone : {}]} />
              <View style={[cardStyles.stepDot, step === 'blend' ? cardStyles.stepDotActive : {}]} />
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.pureWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E8E0F0',
    position: 'relative',
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 1,
  },
  cardHighlight: {
    borderColor: Colors.magicPurple,
    backgroundColor: '#FAF5FF',
  },
  formulaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  block: {
    backgroundColor: Colors.glowPurple,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 52,
    alignItems: 'center',
  },
  blockText: {
    fontFamily: FontFamily.primary,
    fontWeight: "800",
    color: Colors.magicPurple,
  },
  plus: {
    fontFamily: FontFamily.primary,
    fontSize: 22,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  equals: {
    fontFamily: FontFamily.primary,
    fontSize: 22,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  resultBlock: {
    backgroundColor: Colors.magicPurple,
  },
  resultText: {
    fontFamily: FontFamily.primary,
    fontWeight: "800",
    color: Colors.pureWhite,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -4,
    backgroundColor: Colors.stagePink,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    fontFamily: FontFamily.primary,
    fontSize: 11,
    fontWeight: "700",
    color: Colors.pureWhite,
  },
  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8E0F0',
  },
  stepText: {
    fontFamily: FontFamily.primary,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.magicPurple,
  },
  stepDots: {
    flexDirection: 'row',
    gap: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0D8F0',
  },
  stepDotActive: {
    backgroundColor: Colors.magicPurple,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepDotDone: {
    backgroundColor: '#B8A8D8',
  },
});

// ========================
// Main Page
// ========================
export default function SpellPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const level = getLevelById(id ?? 'b');
  const { cardWidth, fontSizeMultiplier } = useResponsive();
  const [activeSyllable, setActiveSyllable] = useState<string | null>(null);
  const [spellStep, setSpellStep] = useState<SpellStep>('idle');

  if (!level || level.type !== 'initial') {
    // 不是声母，重定向到声调页面
    if (typeof window !== 'undefined') {
      window.location.href = `/pinyin-gem/learn/tones?id=${id}`;
    }
    return null;
  }

  const spellItems = SPELLING_DATA[level.letter] || [];

  const handlePlay = async (syllable: string, vowel: string) => {
    if (activeSyllable) return;
    setActiveSyllable(syllable);
    try {
      await playThreeStepSpell(level.letter, vowel, syllable, setSpellStep);
    } catch {}
    setSpellStep('idle');
    setActiveSyllable(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LearnTopBar step={3} />

        <Text style={[styles.title, { fontSize: 24 * fontSizeMultiplier }]}>
          声母拼读屋
        </Text>
        <Text style={[styles.subtitle, { fontSize: 14 * fontSizeMultiplier }]}>
          声母{level.letter} + 韵母 = 新音节，点一点听拼读
        </Text>

        {/* 拼读卡片列表 */}
        <View style={[styles.cardList, { width: cardWidth }]}>
          {spellItems.map((item, idx) => {
            const isHighlight = item.syllable === level.pinyin;
            const isActive = activeSyllable === item.syllable;
            return (
              <SpellCard
                key={idx}
                consonant={level.letter}
                vowel={item.vowel}
                syllable={item.syllable}
                display={item.display}
                isHighlight={isHighlight}
                onPress={() => handlePlay(item.syllable, item.vowel)}
                fontSizeMultiplier={fontSizeMultiplier}
                step={isActive ? spellStep : 'idle'}
              />
            );
          })}
        </View>

        <Text style={styles.tip}>
          💡 轻点卡片听发音，看看声母{level.letter}能和哪些韵母做朋友！
        </Text>

        <PrimaryButton
          title="我会拼了！"
          onPress={() => router.push(`/learn/practice?id=${level.id}`)}
          style={styles.cta}
        />
      </ScrollView>
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
  subtitle: {
    fontFamily: FontFamily.primary, fontWeight: "500",
    color: Colors.textSecondary, textAlign: 'center',
  },
  cardList: {
    gap: 8,
  },
  tip: {
    fontFamily: FontFamily.primary, fontSize: 14, fontWeight: "600",
    color: Colors.stagePink, textAlign: 'center',
    paddingHorizontal: 24,
  },
  cta: { width: '100%', marginTop: 8 },
});
