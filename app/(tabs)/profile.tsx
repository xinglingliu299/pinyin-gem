// 个人中心 - 接入真实进度数据 + 用户登录
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { useProgress } from '@/services/progress';
import { useAuth } from '@/services/auth';
import { TOTAL_LEVELS } from '@/data/curriculum';

const menuItems = [
  { icon: '📚', label: '我的课程', route: '/profile/courses' },
  { icon: '🏆', label: '学习成就', route: '/profile/achievements' },
  { icon: '📊', label: '学习报告', route: '/profile/report' },
  { icon: '🎙️', label: '我的录音', route: '/profile/recordings' },
  { icon: '❤️', label: '我的收藏', route: '/profile/favorites' },
  { icon: '⚙️', label: '设置', route: '/settings' },
];

// 根据进度动态计算徽章
function getBadges(progress: ReturnType<typeof useProgress>['progress']) {
  const badges = [];
  if (progress.completedLevels.length >= 1) badges.push({ emoji: '🌟', label: '初学者' });
  if (progress.streak >= 3) badges.push({ emoji: '🔥', label: `连续${progress.streak}天` });
  if (progress.completedLevels.length >= 10) badges.push({ emoji: '📚', label: '勤学者' });
  if (progress.totalStars >= 10) badges.push({ emoji: '⭐', label: '星星达人' });
  // 至少保证有4个占位
  while (badges.length < 4) {
    badges.push({ emoji: '🔒', label: '待解锁' });
  }
  return badges.slice(0, 4);
}

// 根据进度计算等级
function getLevel(progress: ReturnType<typeof useProgress>['progress']) {
  const done = progress.completedLevels.length;
  if (done >= TOTAL_LEVELS) return { lv: 5, title: '拼音大师' };
  if (done >= 30) return { lv: 4, title: '拼音高手' };
  if (done >= 15) return { lv: 3, title: '拼音学徒' };
  if (done >= 5) return { lv: 2, title: '拼音新手' };
  return { lv: 1, title: '初来乍到' };
}

export default function ProfilePage() {
  const { progress } = useProgress();
  const { user, signOut } = useAuth();
  const badges = getBadges(progress);
  const userLevel = getLevel(progress);
  const isLoggedIn = !!user;

  const handleLogout = () => {
    Alert.alert('确认退出', '退出登录后，下次登录可恢复云端数据', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出登录',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar + Name */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>👸</Text>
        </View>
        <Text style={styles.userName}>
          {isLoggedIn ? user!.email?.split('@')[0] || '小魔法师' : '小魔法师'}
        </Text>
        <Text style={styles.userLevel}>Lv.{userLevel.lv} {userLevel.title}</Text>
        {!isLoggedIn && (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/auth/login' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.loginBtnText}>登录账号</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats - 真实数据 */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{progress.completedLevels.length}</Text>
          <Text style={styles.statLabel}>已学拼音</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{progress.streak}</Text>
          <Text style={styles.statLabel}>学习天数</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{progress.totalStars}</Text>
          <Text style={styles.statLabel}>获得星星</Text>
        </View>
      </View>

      {/* 徽章 - 动态 */}
      <Text style={styles.sectionTitle}>我的徽章</Text>
      <View style={styles.badgeRow}>
        {badges.map((badge) => (
          <View key={badge.label} style={[styles.badge, badge.emoji === '🔒' && styles.badgeLocked]}>
            <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
            <Text style={styles.badgeLabel}>{badge.label}</Text>
          </View>
        ))}
      </View>

      {/* Menu - 全部可点 */}
      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() => {
              if (item.route) router.push(item.route as any);
            }}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoggedIn && (
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutBtnText}>退出登录</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.version}>拼音魔法公主 v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBackground },
  content: { padding: Spacing.pagePadding, paddingBottom: 100 },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.sectionGap,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.glowPurple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(140, 92, 245, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarEmoji: { fontSize: 40 },
  userName: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.title2,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
    marginTop: Spacing.gapMD,
  },
  userLevel: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.callout,
    color: Colors.magicPurple,
    fontWeight: FontWeights.medium,
    marginTop: Spacing.gapXS,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.pureWhite,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.cardPadding,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: {
    width: 1, height: 30, backgroundColor: Colors.borderSubtle, alignSelf: 'center',
  },
  statValue: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.title2,
    fontWeight: FontWeights.light,
    color: Colors.magicPurple,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.footnote,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.subhead,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
    marginTop: Spacing.sectionGap,
    marginBottom: Spacing.elementGap,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.elementGap,
  },
  badge: {
    flex: 1,
    backgroundColor: Colors.pureWhite,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.cardPadding,
    alignItems: 'center',
    gap: Spacing.gapSM,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  badgeLocked: { opacity: 0.4 },
  badgeEmoji: { fontSize: 28 },
  badgeLabel: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.footnote,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  menu: {
    backgroundColor: Colors.pureWhite,
    borderRadius: Spacing.cardRadius,
    overflow: 'hidden',
    marginTop: Spacing.elementGap,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.cardPadding,
    paddingVertical: Spacing.paddingMD,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  menuIcon: { fontSize: 20, marginRight: Spacing.elementGap },
  menuLabel: {
    flex: 1,
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.callout,
    color: Colors.textPrimary,
  },
  menuArrow: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.title2,
    color: Colors.textSecondary,
  },
  version: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.footnote,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sectionGap,
  },
  loginBtn: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.magicPurple,
  },
  loginBtnText: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.callout,
    fontWeight: FontWeights.medium,
    color: Colors.pureWhite,
  },
  logoutBtn: {
    marginTop: Spacing.sectionGap,
    padding: 14,
    borderRadius: Spacing.cardRadius,
    backgroundColor: Colors.pureWhite,
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutBtnText: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.callout,
    color: Colors.errorRed,
    fontWeight: FontWeights.medium,
  },
});
