// 01-欢迎页 - 匹配 Ardot 设计稿
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import PrimaryButton from '@/components/PrimaryButton';

// 小星角色插画 (用 React Native View 模拟)
function CharacterIllustration() {
  return (
    <View style={styles.illustrationContainer}>
      <View style={styles.outerGlow}>
        <View style={styles.characterBg}>
          {/* Character body */}
          <View style={styles.head}>
            {/* Face */}
            <View style={styles.face}>
              <View style={styles.eyesRow}>
                <View style={styles.eye} />
                <View style={styles.eye} />
              </View>
              <View style={styles.mouth} />
              <View style={styles.cheekRow}>
                <View style={styles.cheek} />
                <View style={styles.cheek} />
              </View>
            </View>
            {/* Magic wand */}
            <View style={styles.wand}>
              <View style={styles.wandStick} />
              <View style={styles.wandStar}>
                <Text style={styles.wandStarText}>✦</Text>
              </View>
            </View>
          </View>
          {/* Body */}
          <View style={styles.body} />
        </View>
      </View>
    </View>
  );
}

// 底部星星装饰
function StarDecorations() {
  const stars = ['filled', 'empty', 'filled', 'empty', 'filled'];
  return (
    <View style={styles.starsRow}>
      {stars.map((type, i) => (
        <Text key={i} style={[styles.star, type === 'filled' ? styles.starFilled : styles.starEmpty]}>
          {type === 'filled' ? '★' : '☆'}
        </Text>
      ))}
    </View>
  );
}

export default function WelcomePage() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Character Illustration */}
        <CharacterIllustration />

        {/* Title */}
        <Text style={styles.title}>拼音魔法公主</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>快乐学拼音，轻松会拼读</Text>

        {/* Description */}
        <Text style={styles.description}>
          欢迎来到拼音魔法王国，
        </Text>
        <Text style={styles.description}>
          和小星一起开启拼音冒险吧！
        </Text>
      </View>

      {/* Bottom Area */}
      <View style={styles.bottom}>
        <PrimaryButton
          title="开始冒险"
          onPress={() => router.replace('/(tabs)')}
          style={styles.startBtn}
        />
        <StarDecorations />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pageBackground,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.pagePadding,
    paddingTop: 80,
    paddingBottom: 40,
  },
  content: {
    alignItems: 'center',
  },

  // Illustration
  illustrationContainer: {
    marginBottom: Spacing.sectionGap,
    alignItems: 'center',
  },
  outerGlow: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(222, 214, 252, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.magicPurple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  characterBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.glowPurple,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  head: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FCD44D',
    position: 'absolute',
    top: 22,
    alignItems: 'center',
  },
  face: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 14,
  },
  eyesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 2,
  },
  eye: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#2B2B29',
  },
  mouth: {
    width: 10,
    height: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#2B2B29',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    marginBottom: 2,
  },
  cheekRow: {
    flexDirection: 'row',
    gap: 20,
    position: 'absolute',
    top: 22,
  },
  cheek: {
    width: 7,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(237, 71, 153, 0.3)',
  },
  body: {
    width: 42,
    height: 48,
    borderRadius: 21,
    backgroundColor: Colors.magicPurple,
    position: 'absolute',
    bottom: 16,
  },
  wand: {
    position: 'absolute',
    right: -14,
    top: 20,
    alignItems: 'center',
    transform: [{ rotate: '25deg' }],
  },
  wandStick: {
    width: 3,
    height: 24,
    backgroundColor: '#2B2B29',
    borderRadius: 1.5,
  },
  wandStar: {
    marginTop: -2,
  },
  wandStarText: {
    fontSize: 10,
    color: Colors.magicGold,
  },

  // Typography
  title: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.title1,
    fontWeight: FontWeights.medium,
    color: Colors.magicPurple,
    letterSpacing: 2,
    marginTop: Spacing.gapMD,
  },
  subtitle: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.callout,
    color: Colors.textSecondary,
    marginTop: Spacing.gapSM,
  },
  description: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.body,
    color: Colors.magicPurple,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: Spacing.gapMD,
  },

  // Bottom
  bottom: {
    alignItems: 'center',
    gap: Spacing.sectionGap,
  },
  startBtn: {
    width: '100%',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  star: {
    fontSize: 16,
  },
  starFilled: {
    color: Colors.magicGold,
  },
  starEmpty: {
    color: '#D4D1C7',
  },
});
