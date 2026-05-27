/**
 * 云端进度同步服务
 *
 * 登录用户：本地 + 云端双写，登录时云端数据合并到本地
 * 游客用户：仅本地存储（现有逻辑不变）
 */

import { supabase } from '@/lib/supabase';
import { DEFAULT_PROGRESS, type UserProgress } from '@/data/types';

const TABLE = 'user_progress';

/**
 * 从云端拉取进度
 */
export async function fetchCloudProgress(userId: string): Promise<UserProgress | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('progress_data')
      .eq('user_id', userId)
      .single();

    if (error || !data?.progress_data) return null;
    const parsed = JSON.parse(data.progress_data as string) as UserProgress;
    if (
      parsed.completedLevels &&
      Array.isArray(parsed.completedLevels) &&
      parsed.starRatings &&
      typeof parsed.starRatings === 'object'
    ) {
      return parsed;
    }
    return null;
  } catch (e) {
    console.warn('[Cloud] fetchCloudProgress failed:', e);
    return null;
  }
}

/**
 * 合并本地和云端进度（取并集）
 */
export function mergeProgress(local: UserProgress, cloud: UserProgress): UserProgress {
  const merged: UserProgress = {
    ...DEFAULT_PROGRESS,
    completedLevels: [...new Set([...local.completedLevels, ...cloud.completedLevels])],
    starRatings: { ...cloud.starRatings, ...local.starRatings },
    totalStars: 0,
    streak: Math.max(local.streak, cloud.streak),
    lastCheckin: local.lastCheckin || cloud.lastCheckin,
  };

  // 重算 totalStars
  Object.values(merged.starRatings).forEach((s) => {
    merged.totalStars += s;
  });

  return merged;
}

/**
 * 上传进度到云端
 */
export async function uploadProgress(userId: string, progress: UserProgress): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLE)
      .upsert(
        {
          user_id: userId,
          progress_data: JSON.stringify(progress),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.warn('[Cloud] uploadProgress failed:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[Cloud] uploadProgress failed:', e);
    return false;
  }
}

/**
 * 清除云端进度（重置时调用）
 */
export async function clearCloudProgress(userId: string): Promise<void> {
  try {
    await supabase.from(TABLE).delete().eq('user_id', userId);
  } catch (e) {
    console.warn('[Cloud] clearCloudProgress failed:', e);
  }
}
