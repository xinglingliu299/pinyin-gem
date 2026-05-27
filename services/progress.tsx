/**
 * 进度上下文 + 双存储（AsyncStorage + Supabase）
 *
 * 游客用户：仅本地 AsyncStorage
 * 登录用户：本地 + 云端双写，登录时自动合并
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_PROGRESS, type UserProgress } from '@/data/types';
import { useAuth } from './auth';
import {
  fetchCloudProgress,
  mergeProgress,
  uploadProgress,
  clearCloudProgress,
} from './cloud';

// ---- Storage Key ----

const STORAGE_KEY = '@pinyin_progress';

// ---- Context ----

interface ProgressContextValue {
  progress: UserProgress;
  completeLevel: (levelId: string, stars: number) => Promise<void>;
  resetProgress: () => Promise<void>;
  isLoading: boolean;
  isSyncing: boolean;
}

const ProgressContext = createContext<ProgressContextValue>({
  progress: DEFAULT_PROGRESS,
  completeLevel: async () => {},
  resetProgress: async () => {},
  isLoading: true,
  isSyncing: false,
});

// ---- Provider ----

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user, session } = useAuth();
  const progressRef = useRef(progress);
  progressRef.current = progress;

  // 保存到本地
  const saveLocal = useCallback(async (p: UserProgress) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch (e) {
      console.warn('[Progress] AsyncStorage write failed');
    }
  }, []);

  // 保存到云端（仅登录用户）
  const saveCloud = useCallback(
    async (p: UserProgress) => {
      if (!user) return;
      try {
        await uploadProgress(user.id, p);
      } catch (e) {
        console.warn('[Progress] cloud save failed');
      }
    },
    [user]
  );

  // 双写（本地 + 云端）
  const saveBoth = useCallback(
    async (p: UserProgress) => {
      saveLocal(p);
      saveCloud(p);
    },
    [saveLocal, saveCloud]
  );

  // 启动加载
  useEffect(() => {
    (async () => {
      try {
        // 1. 读本地
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        let localProgress = DEFAULT_PROGRESS;
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as UserProgress;
            if (
              parsed.completedLevels &&
              Array.isArray(parsed.completedLevels) &&
              parsed.starRatings &&
              typeof parsed.starRatings === 'object'
            ) {
              localProgress = parsed;
            }
          } catch {
            // ignore
          }
        }

        // 2. 如果已登录，从云端拉取并合并
        if (user) {
          setIsSyncing(true);
          const cloudProgress = await fetchCloudProgress(user.id);
          if (cloudProgress) {
            const merged = mergeProgress(localProgress, cloudProgress);
            setProgress(merged);
            saveLocal(merged); // 更新本地
          } else {
            setProgress(localProgress);
            // 本地有数据但云端没有，推上去
            if (localProgress.completedLevels.length > 0) {
              await uploadProgress(user.id, localProgress);
            }
          }
          setIsSyncing(false);
        } else {
          setProgress(localProgress);
        }
      } catch {
        // fallback to default
      } finally {
        setIsLoading(false);
      }
    })();
    // 仅在 user/session 变化时重新加载
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // 完成关卡
  const completeLevel = useCallback(
    async (levelId: string, stars: number) => {
      setProgress((prev) => {
        const alreadyCompleted = prev.completedLevels.includes(levelId);
        const prevStars = prev.starRatings[levelId] || 0;

        const newCompletedLevels = alreadyCompleted
          ? prev.completedLevels
          : [...prev.completedLevels, levelId];

        const newStarRatings = {
          ...prev.starRatings,
          [levelId]: Math.max(prevStars, stars),
        };

        const starsDelta = alreadyCompleted
          ? Math.max(0, stars - prevStars)
          : stars;

        const newProgress: UserProgress = {
          ...prev,
          completedLevels: newCompletedLevels,
          starRatings: newStarRatings,
          totalStars: prev.totalStars + starsDelta,
        };

        // 异步双写
        saveBoth(newProgress);
        return newProgress;
      });
    },
    [saveBoth]
  );

  // 重置进度
  const resetProgress = useCallback(async () => {
    setProgress(DEFAULT_PROGRESS);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    if (user) {
      await clearCloudProgress(user.id);
    }
  }, [user]);

  return (
    <ProgressContext.Provider
      value={{ progress, completeLevel, resetProgress, isLoading, isSyncing }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

// ---- Hook ----

export function useProgress(): ProgressContextValue {
  return useContext(ProgressContext);
}
