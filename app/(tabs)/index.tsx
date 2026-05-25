// 02-首页 - 真实进度版本
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { TOTAL_LEVELS } from '@/data/curriculum';
import { useProgress } from '@/services/progress';

// 小星头像
function AvatarIcon() {
  return (
    <View style={styles.avatar}>
      <View style={styles.avatarHead}>
        <View style={styles.avatarFace}>
          <View style={styles.avatarEyes}>
            <View style={styles.avatarEye} />
            <View style={styles.avatarEye} />
          </View>
          <View style={styles.avatarMouth} />
        </View>
      </View>
      <View style={styles.avatarBody} />
    </View>
  );
}

// 前进箭头
function ChevronRight() {
  return <Text style={styles.chevron}>{'>'}</Text>;
}

// 魔法领域卡片
function DomainCard({
  icon, iconBg, title, subtitle, textColor, onPress,
}: {
  icon: string; iconBg: string; title: string; subtitle: string; textColor: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.domainCard} onPress={onPress}>
      <View style={[styles.domainIconWrap, { backgroundColor: iconBg }]}>
        <Text style={styles.domainIcon}>{icon}</Text>
      </View>
      <Text style={[styles.domainTitle, { color: textColor }]}>{title}</Text>
      <Text style={styles.domainSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

export default function HomePage() {
  const { progress } = useProgress();
  const completedCount = progress.completedLevels.length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Greeting */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>你好呀，</Text>
          <Text style={styles.greeting}>魔法学徒！</Text>
        </View>
        <AvatarIcon />
      </View>

      {/* 今天的魔法任务 */}
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => router.push('/learn/new-sound' as any)}
      >
        <View>
          <Text style={styles.taskTitle}>今天的魔法任务</Text>
          <Text style={styles.taskSubtitle}>
            你已完成 {completedCount}/{TOTAL_LEVELS} 关
          </Text>
        </View>
        <ChevronRight />
      </TouchableOpacity>

      {/* 选择魔法领域 */}
      <Text style={styles.sectionTitle}>选择魔法领域</Text>
      <View style={styles.domainGrid}>
        <DomainCard
          icon="▲"
          iconBg={Colors.successGreen}
          title="声调森林"
          subtitle="单韵母+声调"
          textColor={Colors.successGreen}
          onPress={() => router.push('/explore/tones-forest' as any)}
        />
        <DomainCard
          icon="🏰"
          iconBg={Colors.stageBlue}
          title="声母城堡"
          subtitle="声母按部位"
          textColor={Colors.stageBlue}
          onPress={() => router.push('/explore/consonant-castle' as any)}
        />
        <DomainCard
          icon="🌸"
          iconBg={Colors.stagePink}
          title="韵母花园"
          subtitle="复韵母+三拼"
          textColor={Colors.stagePink}
          onPress={() => router.push('/explore/vowel-garden' as any)}
        />
        <DomainCard
          icon="🏛️"
          iconBg={Colors.stageGold}
          title="认读圣殿"
          subtitle="整体认读音节"
          textColor={Colors.stageGold}
          onPress={() => router.push('/explore/reading-temple' as any)}
        />
      </View>

      {/* 魔法路线图 */}
      <TouchableOpacity
        style={styles.routeCard}
        onPress={() => router.push('/map' as any)}
      >
        <View>
          <Text style={styles.routeTitle}>魔法路线图</Text>
          <Text style={styles.routeSubtitle}>查看全部 {TOTAL_LEVELS} 关进度</Text>
        </View>
        <ChevronRight />
      </TouchableOpacity>

      {/* 打卡 & 道具 */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>连续打卡</Text>
          <Text style={styles.statValue}>{Math.max(progress.streak, completedCount)} 天</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>魔法道具</Text>
          <Text style={styles.statValue}>{progress.totalStars}</Text>
        </View>
      </View>

      {/* 魔法游戏屋 */}
      <TouchableOpacity
        style={styles.gameCard}
        onPress={() => router.push('/game' as any)}
      >
        <Text style={styles.gameTitle}>魔法游戏屋</Text>
        <ChevronRight />
      </TouchableOpacity>
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
    alignItems: 'flex-start',
    marginBottom: Spacing.sectionGap,
  },
  greeting: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.title1,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },

  // Avatar
  avatar: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.glowPurple,
    borderRadius: 24,
  },
  avatarHead: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FCD44D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFace: {
    alignItems: 'center',
  },
  avatarEyes: {
    flexDirection: 'row',
    gap: 6,
  },
  avatarEye: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#2B2B29',
  },
  avatarMouth: {
    width: 5,
    height: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#2B2B29',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    marginTop: 1,
  },
  avatarBody: {
    width: 20,
    height: 16,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: Colors.magicPurple,
    marginTop: -2,
  },

  // Task Card
  taskCard: {
    backgroundColor: Colors.magicPurple,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.cardPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.headline,
    fontWeight: FontWeights.medium,
    color: Colors.pureWhite,
  },
  taskSubtitle: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.footnote,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.gapXS,
  },
  chevron: {
    fontSize: 20,
    color: Colors.pureWhite,
    fontWeight: '700',
  },

  // Section Title
  sectionTitle: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.headline,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
    marginTop: Spacing.sectionGap,
    marginBottom: Spacing.elementGap,
  },

  // Domain Grid
  domainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.elementGap,
  },
  domainCard: {
    width: '47%',
    backgroundColor: Colors.pureWhite,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.cardPadding,
    alignItems: 'flex-start',
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  domainIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.gapSM,
  },
  domainIcon: {
    fontSize: 16,
  },
  domainTitle: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.callout,
    fontWeight: FontWeights.medium,
  },
  domainSubtitle: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.footnote,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Route Card
  routeCard: {
    marginTop: Spacing.sectionGap,
    backgroundColor: Colors.magicPurple,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.cardPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeTitle: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.headline,
    fontWeight: FontWeights.medium,
    color: Colors.pureWhite,
  },
  routeSubtitle: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.footnote,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.gapXS,
  },

  // Stats Row
  statsRow: {
    marginTop: Spacing.elementGap,
    flexDirection: 'row',
    backgroundColor: Colors.pureWhite,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.cardPadding,
    justifyContent: 'space-between',
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gapSM,
  },
  statLabel: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.callout,
    color: Colors.textPrimary,
  },
  statValue: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.callout,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },

  // Game Card
  gameCard: {
    marginTop: Spacing.elementGap,
    backgroundColor: Colors.magicPurple,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.cardPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameTitle: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.headline,
    fontWeight: FontWeights.medium,
    color: Colors.pureWhite,
  },
});
