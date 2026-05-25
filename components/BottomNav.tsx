import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily, IconSizes } from '@/constants';

interface BottomNavProps {
  activeTab: string;
}

const tabs = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'map', label: '路线', icon: '🗺️' },
  { key: 'game', label: '游戏', icon: '🎮' },
  { key: 'profile', label: '我的', icon: '👤' },
];

export default function BottomNav({ activeTab }: BottomNavProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <View key={tab.key} style={styles.tabItem}>
            <Text style={[styles.icon, isActive && styles.activeIcon]}>
              {tab.icon}
            </Text>
            <Text
              style={[styles.label, isActive && styles.activeLabel]}
            >
              {tab.label}
            </Text>
            {isActive && <View style={[styles.indicator, { backgroundColor: Colors.magicPurple }]} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.pureWhite,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingHorizontal: Spacing.gapXL,
    paddingBottom: 20, // safe area
    paddingTop: Spacing.gapSM,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingTop: Spacing.gapSM,
  },
  icon: {
    fontSize: IconSizes.nav,
    opacity: 0.4,
  },
  activeIcon: {
    opacity: 1,
  },
  label: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.footnote,
    fontWeight: FontWeights.regular,
    color: Colors.textSecondary,
  },
  activeLabel: {
    color: Colors.magicPurple,
    fontWeight: FontWeights.medium,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});
