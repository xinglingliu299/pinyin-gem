// 设置页 - 完整版
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { useProgress } from '@/services/progress';

export default function SettingsPage() {
  const { resetProgress } = useProgress();
  const [reminder, setReminder] = useState(true);
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(false);

  const handleReset = () => {
    Alert.alert(
      '重置学习进度',
      '确定要清除所有学习记录吗？此操作不可撤销！',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定重置', style: 'destructive',
          onPress: async () => {
            await resetProgress();
            Alert.alert('已重置', '所有学习进度已清除');
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.ct} showsVerticalScrollIndicator={false}>
      {/* 返回按钮 */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← 返回</Text>
      </TouchableOpacity>

      <Text style={styles.title}>设置</Text>

      {/* 通知与音效 */}
      <Text style={styles.secLabel}>通知与音效</Text>
      <View style={styles.sec}>
        <View style={styles.row}>
          <Text style={styles.icon}>🔔</Text>
          <Text style={styles.label}>学习提醒</Text>
          <Switch
            value={reminder}
            onValueChange={setReminder}
            trackColor={{ false: Colors.lockGray, true: Colors.magicPurple }}
            thumbColor={Colors.pureWhite}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.icon}>🔊</Text>
          <Text style={styles.label}>音效</Text>
          <Switch
            value={sound}
            onValueChange={setSound}
            trackColor={{ false: Colors.lockGray, true: Colors.magicPurple }}
            thumbColor={Colors.pureWhite}
          />
        </View>
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <Text style={styles.icon}>🎵</Text>
          <Text style={styles.label}>背景音乐</Text>
          <Switch
            value={music}
            onValueChange={setMusic}
            trackColor={{ false: Colors.lockGray, true: Colors.magicPurple }}
            thumbColor={Colors.pureWhite}
          />
        </View>
      </View>

      {/* 偏好设置 */}
      <Text style={styles.secLabel}>偏好设置</Text>
      <View style={styles.sec}>
        {[
          { icon: '👶', label: '年龄设置', detail: '4-6岁' },
          { icon: '📖', label: '学习难度', detail: '初级' },
          { icon: '🌐', label: '语言', detail: '简体中文' },
        ].map((item, idx) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.row, idx === 2 && { borderBottomWidth: 0 }]}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.detail}>{item.detail}</Text>
            <Text style={styles.arr}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 关于 */}
      <Text style={styles.secLabel}>关于</Text>
      <View style={styles.sec}>
        {[
          { icon: '📋', label: '用户协议' },
          { icon: '🔒', label: '隐私政策' },
          { icon: 'ℹ️', label: '关于我们' },
        ].map((item, idx) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.row, idx === 2 && { borderBottomWidth: 0 }]}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.arr}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 数据管理 */}
      <Text style={styles.secLabel}>数据管理</Text>
      <View style={styles.sec}>
        <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={handleReset}>
          <Text style={styles.icon}>🗑️</Text>
          <Text style={[styles.label, { color: Colors.errorRed }]}>重置学习进度</Text>
          <Text style={styles.arr}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.ver}>拼音魔法公主 v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: Colors.pageBackground },
  ct: { padding: Spacing.pagePadding, paddingBottom: 100 },
  backBtn: {
    marginTop: 40, marginBottom: Spacing.gapMD,
  },
  backText: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout,
    fontWeight: FontWeights.medium, color: Colors.magicPurple,
  },
  title: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.title1,
    fontWeight: FontWeights.light, color: Colors.textPrimary,
    letterSpacing: -0.5, marginBottom: Spacing.sectionGap,
  },
  secLabel: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.footnote,
    fontWeight: FontWeights.medium, color: Colors.textSecondary,
    marginBottom: Spacing.gapSM, marginTop: Spacing.gapLG,
    paddingLeft: 4,
  },
  sec: {
    backgroundColor: Colors.pureWhite,
    borderRadius: Spacing.cardRadius,
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.03)',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 1,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.cardPadding,
    paddingVertical: Spacing.paddingMD,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
  },
  icon: { fontSize: 20, marginRight: Spacing.elementGap },
  label: {
    flex: 1, fontFamily: FontFamily.primary,
    fontSize: FontSizes.callout, color: Colors.textPrimary,
  },
  detail: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout,
    color: Colors.textSecondary, marginRight: Spacing.gapSM,
  },
  arr: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.title2,
    color: Colors.textSecondary,
  },
  ver: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.footnote,
    color: Colors.textSecondary, textAlign: 'center',
    marginTop: Spacing.sectionGap,
  },
});
