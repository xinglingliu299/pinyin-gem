// 收藏服务 - 管理收藏的拼音关卡
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@pinyin_favorites';

/** 获取收藏列表 */
export async function getFavorites(): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem(FAVORITES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  return [];
}

/** 切换收藏状态（已收藏则取消，未收藏则添加） */
export async function toggleFavorite(levelId: string): Promise<boolean> {
  const list = await getFavorites();
  const isFav = list.includes(levelId);
  const next = isFav
    ? list.filter((id) => id !== levelId)
    : [...list, levelId];
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)).catch(() => {});
  return !isFav; // 返回切换后的状态（true=已收藏）
}

/** 判断是否已收藏 */
export async function isFavorite(levelId: string): Promise<boolean> {
  const list = await getFavorites();
  return list.includes(levelId);
}
