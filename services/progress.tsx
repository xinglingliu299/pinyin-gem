/**
 * 进度上下文 + AsyncStorage 持久化
 *
 * 提供全局 UserProgress 状态，所有页面通过 useProgress() 读取。
 * 关卡完成时调用 completeLevel() 保存到 AsyncStorage。
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_PROGRESS, type UserProgress } from '@/data/types';

// ---- Storage Key ----

const STORAGE_KEY = '@pinyin_progress';

// ---- Context ----

interface ProgressContextValue {
  progress: UserProgress;
  completeLevel: (levelId: string, stars: number) => Promise<void>;
  resetProgress: () => Promise<void>;
  isLoading: boolean;
}

const ProgressContext = createContext<ProgressContextValue>({
  progress: DEFAULT_PROGRESS,
  completeLevel: async () => {},
  resetProgress: async () => {},
  isLoading: true,
});

// ---- Provider ----

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);

  // 启动时加载保存的进度
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as UserProgress;
            // 基本校验：必填字段存在
            if (
              parsed.completedLevels &&
              Array.isArray(parsed.completedLevels) &&
              parsed.starRatings &&
              typeof parsed.starRatings === 'object'
            ) {
              setProgress(parsed);
            } else {
              console.warn(
                '[Progress] Stored data shape invalid, using default',
              );
            }
          } catch (parseError) {
            console.warn('[Progress] JSON parse failed, using default');
          }
        }
      } catch (readError) {
        console.warn('[Progress] AsyncStorage read failed, using default');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // 保存进度到 AsyncStorage
  const saveProgress = useCallback(async (newProgress: UserProgress) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    } catch (writeError) {
      console.warn(
        '[Progress] AsyncStorage write failed, progress saved in memory only',
      );
    }
  }, []);

  // 完成关卡（幂等：重复完成不会重复计数）
  const completeLevel = useCallback(
    async (levelId: string, stars: number) => {
      setProgress((prev) => {
        // 已经完成过：不重复计算星星，但可以更新星级
        const alreadyCompleted = prev.completedLevels.includes(levelId);
        const prevStars = prev.starRatings[levelId] || 0;

        const newCompletedLevels = alreadyCompleted
          ? prev.completedLevels
          : [...prev.completedLevels, levelId];

        const newStarRatings = {
          ...prev.starRatings,
          [levelId]: Math.max(prevStars, stars), // 保留最高星级
        };

        const starsDelta = alreadyCompleted
          ? Math.max(0, stars - prevStars) // 仅增加差额
          : stars;

        const newProgress: UserProgress = {
          ...prev,
          completedLevels: newCompletedLevels,
          starRatings: newStarRatings,
          totalStars: prev.totalStars + starsDelta,
        };

        // 异步持久化（不阻塞 UI）
        saveProgress(newProgress);

        return newProgress;
      });
    },
    [saveProgress],
  );

  // 重置进度
  const resetProgress = useCallback(async () => {
    setProgress(DEFAULT_PROGRESS);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('[Progress] Failed to clear storage');
    }
  }, []);

  return (
    <ProgressContext.Provider
      value={{ progress, completeLevel, resetProgress, isLoading }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

// ---- Hook ----

export function useProgress(): ProgressContextValue {
  return useContext(ProgressContext);
}
