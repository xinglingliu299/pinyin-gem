// 11-魔法游戏屋 - 匹配 Ardot 设计稿
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';

interface GameItem {
  id: string;
  title: string;
  desc: string;
  score: number;
  icon: string;
  iconBg: string;
  scoreColor: string;
  route: string;
}

const games: GameItem[] = [
  {
    id: 'listen-match',
    title: '听音配图',
    desc: '听发音，找图片',
    score: 120,
    icon: '⭐',
    iconBg: '#FFF8E1',
    scoreColor: Colors.stageGold,
    route: '/explore/listen-match',
  },
  {
    id: 'pinyin-link',
    title: '拼音连连看',
    desc: '相同发音连一连',
    score: 95,
    icon: '🔗',
    iconBg: '#E8F0FE',
    scoreColor: Colors.stageBlue,
    route: '/explore/pinyin-link',
  },
  {
    id: 'find-diff',
    title: '找不同大挑战',
    desc: 'b/d/p/q 找不同',
    score: 80,
    icon: '🔍',
    iconBg: '#FCE4EC',
    scoreColor: Colors.stagePink,
    route: '/game/find-diff',
  },
  {
    id: 'flash-read',
    title: '快闪认读',
    desc: '快速认出拼音',
    score: 150,
    icon: '⚡',
    iconBg: '#EDE7F6',
    scoreColor: Colors.magicPurple,
    route: '/explore/flash-read',
  },
  {
    id: 'tone-spell',
    title: '声调拼拼乐',
    desc: '听汉字，选声调',
    score: 70,
    icon: '🎭',
    iconBg: '#FFF3E0',
    scoreColor: '#F59E0A',
    route: '/explore/tone-spell',
  },
  {
    id: 'memory-match',
    title: '拼音消消乐',
    desc: '翻牌记忆配对',
    score: 0,
    icon: '🃏',
    iconBg: '#FCE4EC',
    scoreColor: Colors.stagePink,
    route: '/explore/memory-match',
  },
];

function GameCard({ game }: { game: GameItem }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={[styles.iconWrap, { backgroundColor: game.iconBg }]}>
          <Text style={styles.icon}>{game.icon}</Text>
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{game.title}</Text>
          <Text style={styles.cardDesc}>{game.desc}</Text>
          <Text style={[styles.cardScore, { color: game.scoreColor }]}>
            最高分: {game.score}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.playBtn}
        onPress={() => router.push(game.route as any)}
      >
        <Text style={styles.playBtnText}>玩一玩</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function GameHallPage() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>魔法游戏屋</Text>
        <Text style={styles.headerSubtitle}>今日可用 5 min</Text>
      </View>

      {/* Game List */}
      <View style={styles.list}>
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
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
    paddingBottom: 120,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sectionGap,
  },
  headerTitle: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.title1,
    fontWeight: FontWeights.medium,
    color: Colors.magicPurple,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.footnote,
    color: Colors.textSecondary,
  },

  // List
  list: {
    gap: Spacing.elementGap,
  },
  card: {
    backgroundColor: Colors.pureWhite,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.cardPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gapMD,
    flex: 1,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  cardText: {
    gap: 2,
  },
  cardTitle: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.headline,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  cardDesc: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.footnote,
    color: Colors.textSecondary,
  },
  cardScore: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.footnote,
    fontWeight: FontWeights.medium,
  },
  playBtn: {
    backgroundColor: Colors.magicPurple,
    borderRadius: 16,
    paddingHorizontal: Spacing.paddingMD,
    paddingVertical: 8,
  },
  playBtnText: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.callout,
    fontWeight: FontWeights.medium,
    color: Colors.pureWhite,
  },
});
