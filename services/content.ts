/**
 * 远程内容服务 - 从 Supabase 获取运营内容
 * 优先使用 DB 数据，回退到本地 curriculum 数据
 */
import { supabase } from './supabase';
import { ALL_LEVELS, STAGES } from '../data/curriculum';
import type { LevelData, StageInfo } from '../data/types';

interface RemoteContent {
  level_id: string;
  stage_id: string;
  phoneme_type: string;
  sort_order: number;
  letter: string;
  pinyin: string;
  tone: number;
  example: string | null;
  word: string | null;
  mouth_guide: string | null;
  tone_rhyme: string | null;
  tone_gesture: string | null;
  quiz_correct: string | null;
  quiz_wrong: string[];
  audio_key: string | null;
  video_url: string | null;
  difficulty_level: string;
  is_published: boolean;
}

// 缓存远程内容，避免重复请求
let cachedRemoteLevels: LevelData[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

async function fetchRemoteContent(): Promise<LevelData[]> {
  // 检查缓存
  const now = Date.now();
  if (cachedRemoteLevels && now - cacheTimestamp < CACHE_DURATION) {
    return cachedRemoteLevels;
  }

  try {
    const { data, error } = await supabase.rpc('get_all_published_content');
    if (error || !Array.isArray(data)) {
      console.log('[content] Remote fetch failed, using local data');
      return ALL_LEVELS;
    }

    const remoteItems: RemoteContent[] = data;
    if (remoteItems.length === 0) {
      return ALL_LEVELS;
    }

    // 转换为 LevelData 格式
    const mapped: LevelData[] = remoteItems
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item, index) => {
        // 找到同 level_id 的本地数据作为 fallback
        const local = ALL_LEVELS.find((l) => l.id === item.level_id);
        // 计算所属阶段的 stageIndex
        const stageLevels = mapped.filter((l) => l.stageId === item.stage_id);
        const stageIndex = stageLevels.length;

        return {
          id: item.level_id,
          letter: item.letter || local?.letter || item.level_id,
          pinyin: item.pinyin || local?.pinyin || item.level_id,
          type: (item.phoneme_type as any) || local?.type || 'initial',
          tone: item.tone || local?.tone || 1,
          example: item.example || local?.example || '',
          word: item.word || local?.word || '',
          mouthGuide: item.mouth_guide || local?.mouthGuide || '',
          toneRhyme: item.tone_rhyme || local?.toneRhyme || '',
          toneGesture: item.tone_gesture || local?.toneGesture || '',
          quizCorrect: item.quiz_correct || local?.quizCorrect || '',
          quizWrong: Array.isArray(item.quiz_wrong) && item.quiz_wrong.length > 0
            ? item.quiz_wrong
            : local?.quizWrong || [],
          audioKey: item.audio_key || local?.audioKey || '',
          videoUrl: item.video_url || undefined,
          difficultyLevel: item.difficulty_level || local?.difficultyLevel || 'standard',
          stageId: item.stage_id || local?.stageId || 'tones-forest',
          stageIndex,
        } as LevelData & { videoUrl?: string; difficultyLevel?: string; stageId?: string };
      });

    cachedRemoteLevels = mapped;
    cacheTimestamp = now;
    console.log(`[content] Loaded ${mapped.length} levels from remote`);
    return mapped;
  } catch (err) {
    console.log('[content] Remote fetch error:', err);
    return ALL_LEVELS;
  }
}

/**
 * 获取所有关卡数据（优先远程，回退本地）
 */
export async function getDynamicLevels(): Promise<LevelData[]> {
  return fetchRemoteContent();
}

/**
 * 获取单个关卡（优先远程，回退本地）
 */
export async function getDynamicLevelById(id: string): Promise<LevelData | undefined> {
  const levels = await getDynamicLevels();
  return levels.find((l) => l.id === id);
}

/**
 * 清除缓存（用于刷新）
 */
export function clearContentCache() {
  cachedRemoteLevels = null;
  cacheTimestamp = 0;
}
