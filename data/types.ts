/**
 * 拼音魔法公主 - 核心数据类型
 */

// 学习阶段
export type StageId = 'tones-forest' | 'consonant-castle' | 'vowel-garden' | 'reading-temple';

// 音素类型
export type PhonemeType = 'single-final' | 'initial' | 'compound-final' | 'nasal-final' | 'whole-syllable';

// 声调 (1-4)
export type ToneNumber = 1 | 2 | 3 | 4;

// 每关的学习内容
export interface LevelData {
  /** 唯一标识，如 "b" "ai" "zhi" */
  id: string;
  /** 拼音字母（无调号），如 "b" "a" "ai" */
  letter: string;
  /** 带调号的完整拼音，如 "bō" "ā" */
  pinyin: string;
  /** 所属发音类型 */
  type: PhonemeType;
  /** 当前关教的声调 */
  tone: ToneNumber;
  /** 例字，如 "波" */
  example: string;
  /** 例词/组词，如 "波浪" */
  word: string;
  /** 口型指导文字 */
  mouthGuide: string;
  /** 声调口诀（本关重点那句） */
  toneRhyme: string;
  /** 声调手势描述 */
  toneGesture: string;
  /** 测验正确选项 */
  quizCorrect: string;
  /** 测验干扰项（3个） */
  quizWrong: string[];
  /** 音频文件名（不含扩展名） */
  audioKey: string;
  /** 在所属阶段中的序号（从0开始） */
  stageIndex: number;
}

// 阶段信息
export interface StageInfo {
  id: StageId;
  name: string;
  subtitle: string;
  icon: string;
  iconBg: string;
  barColor: string;
  textColor: string;
}

// 用户进度（持久化存储）
export interface UserProgress {
  /** 已完成的关卡ID列表 */
  completedLevels: string[];
  /** 每关的星级评价 (levelId -> stars 1-3) */
  starRatings: Record<string, number>;
  /** 连续打卡天数 */
  streak: number;
  /** 最后打卡日期 (YYYY-MM-DD) */
  lastCheckin: string;
  /** 已获得的魔法星星总数 */
  totalStars: number;
}

// 默认进度
export const DEFAULT_PROGRESS: UserProgress = {
  completedLevels: [],
  starRatings: {},
  streak: 0,
  lastCheckin: '',
  totalStars: 0,
};
