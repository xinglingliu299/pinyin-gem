// 10-易混字母对比
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import PrimaryButton from '@/components/PrimaryButton';

export default function ComparePage() {
  const items = ["b-d", "p-q", "n-l"];
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>易混字母对比</Text>
      <Text style={styles.subtitle}>辨别容易混淆的拼音字母</Text>
      <View style={styles.grid}>
        {items.map((s: string, i: number) => (
          <TouchableOpacity key={i} style={styles.card}>
            <Text style={styles.char}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.area}>
        <Text style={styles.areaText}>互动练习区域</Text>
      </View>
      <PrimaryButton title="下一个" onPress={() => router.push('/(tabs)' as any)} style={styles.btn} />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBackground },
  content: { padding: Spacing.pagePadding, paddingBottom: 100 },
  title: { fontFamily: FontFamily.primary, fontSize: FontSizes.title1, fontWeight: FontWeights.light, color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontFamily: FontFamily.primary, fontSize: FontSizes.callout, color: Colors.textSecondary, marginTop: Spacing.gapXS },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.elementGap, marginTop: Spacing.sectionGap, justifyContent: 'center' },
  card: { width: 70, height: 70, backgroundColor: Colors.pureWhite, borderRadius: Spacing.cardRadius, alignItems: 'center', justifyContent: 'center', shadowColor: 'rgba(140,92,245,0.15)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 3 },
  char: { fontFamily: FontFamily.primary, fontSize: FontSizes.title1, fontWeight: FontWeights.light, color: Colors.magicPurple },
  area: { marginTop: Spacing.sectionGap, backgroundColor: Colors.glowPurple, borderRadius: Spacing.cardRadius, padding: Spacing.sectionGap, alignItems: 'center' },
  areaText: { fontFamily: FontFamily.primary, fontSize: FontSizes.callout, color: Colors.textSecondary },
  btn: { marginTop: Spacing.sectionGap },
});
