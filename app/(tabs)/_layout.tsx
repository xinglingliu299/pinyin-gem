import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Colors, FontSizes, FontWeights, FontFamily, Spacing } from '@/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.pureWhite,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          fontFamily: FontFamily.primary,
          fontSize: FontSizes.title3,
          fontWeight: FontWeights.medium,
          color: Colors.textPrimary,
        },
        tabBarStyle: {
          backgroundColor: Colors.pureWhite,
          borderTopWidth: 1,
          borderTopColor: Colors.borderSubtle,
          paddingTop: Spacing.gapSM,
          paddingBottom: 20,
          height: 80,
        },
        tabBarActiveTintColor: Colors.magicPurple,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: FontFamily.primary,
          fontSize: FontSizes.footnote,
          fontWeight: FontWeights.regular,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="⌂" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: '学习',
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="📖" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          title: '游戏',
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="⭐" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="👤" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontSize: focused ? 24 : 22,
        opacity: focused ? 1 : 0.5,
        color: focused ? Colors.magicPurple : Colors.textSecondary,
      }}
    >
      {symbol}
    </Text>
  );
}
