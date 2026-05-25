import React from 'react';
import { Stack } from 'expo-router';
import { ProgressProvider } from '@/services/progress';

export default function RootLayout() {
  return (
    <ProgressProvider>
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAF5FF' },
        animation: 'default',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
      <Stack.Screen
        name="learn/new-sound"
        options={{ presentation: 'modal', title: '认识新音' }}
      />
      <Stack.Screen
        name="learn/mouth"
        options={{ presentation: 'modal', title: '口型模仿' }}
      />
      <Stack.Screen
        name="learn/tones"
        options={{ presentation: 'modal', title: '声调手势操' }}
      />
      <Stack.Screen
        name="learn/practice"
        options={{ presentation: 'modal', title: '跟读练习' }}
      />
      <Stack.Screen
        name="learn/quiz"
        options={{ presentation: 'modal', title: '魔法小测' }}
      />
      <Stack.Screen
        name="learn/result"
        options={{ presentation: 'modal', title: '关卡结果' }}
      />
      <Stack.Screen
        name="learn/compare"
        options={{ presentation: 'modal', title: '易混字母对比' }}
      />
      <Stack.Screen
        name="game/find-diff"
        options={{ presentation: 'modal', title: '游戏找不同' }}
      />
      <Stack.Screen
        name="game/game-result"
        options={{ presentation: 'modal', title: '游戏结果' }}
      />
      <Stack.Screen
        name="explore/tones-forest"
        options={{ title: '声调森林', headerShown: false }}
      />
      <Stack.Screen
        name="explore/consonant-castle"
        options={{ title: '声母城堡', headerShown: false }}
      />
      <Stack.Screen
        name="explore/vowel-garden"
        options={{ title: '韵母花园', headerShown: false }}
      />
      <Stack.Screen
        name="explore/reading-temple"
        options={{ title: '认读圣殿', headerShown: false }}
      />
      <Stack.Screen
        name="explore/listen-match"
        options={{ presentation: 'modal', title: '听音配图' }}
      />
      <Stack.Screen
        name="explore/pinyin-link"
        options={{ presentation: 'modal', title: '拼音连连看' }}
      />
      <Stack.Screen
        name="explore/flash-read"
        options={{ presentation: 'modal', title: '快闪认读' }}
      />
      <Stack.Screen
        name="profile/courses"
        options={{ title: '我的课程', headerShown: false }}
      />
      <Stack.Screen
        name="profile/achievements"
        options={{ title: '学习成就', headerShown: false }}
      />
      <Stack.Screen
        name="profile/report"
        options={{ title: '学习报告', headerShown: false }}
      />
      <Stack.Screen
        name="profile/favorites"
        options={{ title: '我的收藏', headerShown: false }}
      />
      <Stack.Screen name="settings" options={{ title: '设置', headerShown: false }} />
    </Stack>
    </ProgressProvider>
  );
}
