// 我的收藏 - 收藏的拼音关卡
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';
import { getLevelById } from '@/data/curriculum';
import { useProgress } from '@/services/progress';

const FAVORITES_KEY = '@pinyin_favorites';

// 收藏服务 hook
function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setFavorites(parsed);
        }
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const toggleFavorite = useCallback(async (levelId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(levelId)
        ? prev.filter((id) => id !== levelId)
        : [...prev, levelId];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const isFavorite = useCallback((levelId: string) => favorites.includes(levelId), [favorites]);

  return { favorites, loading, toggleFavorite, isFavorite };
}

export default function FavoritesPage() {
  const { favorites, loading, toggleFavorite } = useFavorites();
  const { progress } = useProgress();

  const levels = favorites.map((id) => getLevelById(id)).filter(Boolean);

  const handleRemove = (id: string) => {
    Alert.alert('取消收藏', '确定要取消收藏这个拼音吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: () => toggleFavorite(id) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的收藏</Text>
        <Text style={styles.headerSub}>{favorites.length} 个拼音</Text>
      </View>

      {loading ? (
        <View style={styles.emptyCard}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : levels.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>❤️</Text>
          <Text style={styles.emptyText}>还没有收藏的拼音</Text>
          <Text style={styles.emptyHint}>
            在学习中长按拼音卡片即可收藏，方便反复练习哦~
          </Text>
          <TouchableOpacity
            style={styles.goLearnBtn}
            onPress={() => router.navigate('/(tabs)/map')}
          >
            <Text style={styles.goLearnText}>去地图学习</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listWrap}>
          {levels.map((level) => {
            const isDone = progress.completedLevels.includes(level.id);
            const stars = progress.starRatings[level.id] || 0;

            return (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.favCard,
                  { borderColor: isDone ? Colors.successGreen : Colors.borderDefault },
                  isDone && { backgroundColor: Colors.successGreen + '08' },
                ]}
                activeOpacity={0.7}
                onPress={() => router.push(`/learn/new-sound?id=${level.id}` as any)}
                onLongPress={() => handleRemove(level.id)}
              >
                {/* 左侧：字母 */}
                <View style={styles.favLetterWrap}>
                  <Text style={[styles.favLetter, isDone && { color: Colors.successGreen }]}>
                    {level.letter}
                  </Text>
                </View>

                {/* 中间：信息 */}
                <View style={styles.favInfo}>
                  <Text style={styles.favPinyin}>{level.pinyin}</Text>
                  <Text style={styles.favWord}>{level.word}</Text>
                  <Text style={styles.favExample}>{level.example}</Text>
                </View>

                {/* 右侧：星级 + 删除 */}
                <View style={styles.favRight}>
                  {isDone && (
                    <View style={styles.favStars}>
                      {[1, 2, 3].map((s) => (
                        <Text key={s} style={[styles.starIcon, { color: s <= stars ? Colors.stageGold : Colors.borderDefault }]}>
                          {s <= stars ? '★' : '☆'}
                        </Text>
                      ))}
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemove(level.id)}
                  >
                    <Text style={styles.removeText}>取消</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* 提示 */}
      {levels.length > 0 && (
        <Text style={styles.footerHint}>💡 长按卡片可取消收藏</Text>
      )}

      {/* 返回 */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← 返回</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBackground },
  content: { paddingBottom: 80 },
  // Header
  header: {
    paddingHorizontal: Spacing.pagePadding,
    paddingTop: Spacing.sectionGap + 40,
    paddingBottom: Spacing.gapLG,
  },
  headerTitle: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.title1, fontWeight: FontWeights.light,
    color: Colors.textPrimary, letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout,
    color: Colors.magicPurple, marginTop: Spacing.gapXS, fontWeight: FontWeights.medium,
  },
  // Empty
  emptyCard: {
    marginHorizontal: Spacing.pagePadding,
    backgroundColor: Colors.pureWhite,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.paddingXL,
    alignItems: 'center',
    gap: Spacing.elementGap,
  },
  emptyEmoji: { fontSize: 48 },
  emptyText: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout,
    fontWeight: FontWeights.medium, color: Colors.textPrimary,
  },
  emptyHint: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.footnote,
    color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout,
    color: Colors.textSecondary,
  },
  goLearnBtn: {
    marginTop: Spacing.gapSM,
    backgroundColor: Colors.magicPurple,
    paddingHorizontal: Spacing.paddingLG, paddingVertical: Spacing.paddingSM,
    borderRadius: Spacing.buttonRadius,
  },
  goLearnText: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout,
    fontWeight: FontWeights.medium, color: Colors.pureWhite,
  },
  // Fav card
  listWrap: {
    marginHorizontal: Spacing.pagePadding,
    gap: Spacing.gapSM,
  },
  favCard: {
    backgroundColor: Colors.pureWhite,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.paddingMD,
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.elementGap,
    borderWidth: 1.5,
    shadowColor: 'rgba(0,0,0,0.03)',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 1,
  },
  favLetterWrap: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: Colors.magicPurple + '10',
    alignItems: 'center', justifyContent: 'center',
  },
  favLetter: {
    fontFamily: FontFamily.primary, fontSize: 26, fontWeight: FontWeights.light,
    color: Colors.textPrimary,
  },
  favInfo: { flex: 1, gap: 2 },
  favPinyin: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout,
    fontWeight: FontWeights.medium, color: Colors.magicPurple,
  },
  favWord: {
    fontFamily: FontFamily.chinese, fontSize: FontSizes.callout,
    fontWeight: FontWeights.medium, color: Colors.textPrimary,
  },
  favExample: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.footnote,
    color: Colors.textSecondary,
  },
  favRight: { alignItems: 'flex-end', gap: Spacing.gapSM },
  favStars: { flexDirection: 'row', gap: 1 },
  starIcon: { fontSize: 12 },
  removeBtn: {
    paddingHorizontal: Spacing.paddingXS,
    paddingVertical: 4,
    borderRadius: Spacing.tagRadius,
    backgroundColor: Colors.errorRed + '10',
  },
  removeText: {
    fontFamily: FontFamily.primary, fontSize: 10,
    color: Colors.errorRed, fontWeight: FontWeights.medium,
  },
  footerHint: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.footnote,
    color: Colors.textSecondary, textAlign: 'center',
    marginTop: Spacing.gapMD,
  },
  // Back
  backBtn: {
    marginHorizontal: Spacing.pagePadding, marginTop: Spacing.gapLG,
    paddingVertical: Spacing.paddingMD, alignItems: 'center',
    backgroundColor: Colors.pureWhite, borderRadius: Spacing.cardRadius,
    borderWidth: 1, borderColor: Colors.borderSubtle,
  },
  backText: {
    fontFamily: FontFamily.primary, fontSize: FontSizes.callout, fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
  },
});
