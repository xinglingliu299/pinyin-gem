/**
 * 音频服务层
 * - Web 端：优先使用预生成的高质量音频文件（edge-tts / Microsoft Neural TTS）
 *   如果文件播放失败，自动回退到 Web Speech API (expo-speech)
 * - 原生端：直接使用 expo-speech
 * - 录音：expo-av Audio.Recording（原生平台）
 */

import { Platform, Alert, Linking } from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

// ---- Types ----

export interface PlayOptions {
  language?: string;
  rate?: number;
  pitch?: number;
}

export interface RecordingResult {
  uri: string;
  confidence: number;
}

// ---- Module State ----

let recordingInstance: Audio.Recording | null = null;
let isRecording = false;

// 当前播放的 Audio 实例（用于停止）
let currentAudio: HTMLAudioElement | null = null;

// ---- 音频文件映射 ----
// 关卡拼音 -> 音频文件名
const PINYIN_AUDIO_MAP: Record<string, string> = {
  // 第一阶段：单韵母
  'ā': 'pinyin_a', 'ō': 'pinyin_o', 'ē': 'pinyin_e',
  'ī': 'pinyin_i', 'ū': 'pinyin_u', 'ǖ': 'pinyin_v',
  // 第二阶段：声母
  'bō': 'pinyin_b', 'pō': 'pinyin_p', 'mō': 'pinyin_m', 'fō': 'pinyin_f',
  'dē': 'pinyin_d', 'tē': 'pinyin_t', 'nē': 'pinyin_n', 'lē': 'pinyin_l',
  'gē': 'pinyin_g', 'kē': 'pinyin_k', 'hē': 'pinyin_h',
  'jī': 'pinyin_j', 'qī': 'pinyin_q', 'xī': 'pinyin_x',
  'zhī': 'pinyin_zhi', 'chī': 'pinyin_chi', 'shī': 'pinyin_shi',
  'rì': 'pinyin_ri', 'zī': 'pinyin_zi2', 'cī': 'pinyin_ci',
  'sī': 'pinyin_si', 'yī': 'pinyin_yi', 'wū': 'pinyin_wu',
  // 第三阶段：复韵母+鼻韵母
  'āi': 'pinyin_ai', 'ēi': 'pinyin_ei', 'uī': 'pinyin_ui',
  'āo': 'pinyin_ao', 'ōu': 'pinyin_ou', 'iū': 'pinyin_iu',
  'iē': 'pinyin_ie', 'üē': 'pinyin_ve', 'ér': 'pinyin_er',
  'ān': 'pinyin_an', 'ēn': 'pinyin_en', 'yīn': 'pinyin_in',
  'āng': 'pinyin_ang', 'ēng': 'pinyin_eng',
  // 第四阶段：整体认读音节
  'zhī': 'pinyin_zhi', 'chī': 'pinyin_chi', 'shī': 'pinyin_shi',
  'rì': 'pinyin_ri', 'zì': 'pinyin_zi2', 'cí': 'pinyin_ci',
  'sī': 'pinyin_si', 'yī': 'pinyin_yi', 'wú': 'pinyin_wu',
  'yǔ': 'pinyin_yu2', 'yè': 'pinyin_ye',
};

// 例字 -> 音频文件名
const EXAMPLE_AUDIO_MAP: Record<string, string> = {
  // 第一阶段
  '啊': 'ex_a', '哦': 'ex_o', '鹅': 'ex_e',
  '衣': 'ex_i', '屋': 'ex_u', '鱼': 'ex_v',
  // 第二阶段
  '波': 'ex_b', '泼': 'ex_p', '摸': 'ex_m', '佛': 'ex_f',
  '大': 'ex_d', '特': 'ex_t', '那': 'ex_n', '拉': 'ex_l',
  '哥': 'ex_g', '蝌': 'ex_k', '喝': 'ex_h',
  '鸡': 'ex_j', '七': 'ex_q', '西': 'ex_x',
  '蜘': 'ex_zh', '吃': 'ex_ch', '狮': 'ex_sh', '日': 'ex_r',
  '字': 'ex_z', '刺': 'ex_c', '丝': 'ex_s',
  '一': 'ex_y', '乌': 'ex_w',
  // 第三阶段
  '爱': 'ex_ai', '飞': 'ex_ei', '归': 'ex_ui',
  '猫': 'ex_ao', '狗': 'ex_ou', '牛': 'ex_iu',
  '写': 'ex_ie', '月': 'ex_ve', '耳': 'ex_er',
  '天': 'ex_an', '门': 'ex_en', '林': 'ex_in',
  '羊': 'ex_ang', '风': 'ex_eng',
  // 第四阶段
  '蜘蛛': 'ex_zhi', '吃饭': 'ex_chi', '狮子': 'ex_shi',
  '日出': 'ex_ri', '写字': 'ex_zi', '瓷碗': 'ex_ci',
  '丝瓜': 'ex_si', '衣服': 'ex_yi', '跳舞': 'ex_wu',
  '下雨': 'ex_yu', '叶子': 'ex_ye',
};

// 声调森林的4声映射
const TONE_AUDIO_MAP: Record<string, string> = {
  'ā': 'tone_a1', 'á': 'tone_a2', 'ǎ': 'tone_a3', 'à': 'tone_a4',
  'ō': 'tone_o1', 'ó': 'tone_o2', 'ǒ': 'tone_o3', 'ò': 'tone_o4',
  'ē': 'tone_e1', 'é': 'tone_e2', 'ě': 'tone_e3', 'è': 'tone_e4',
  'ī': 'tone_i1', 'í': 'tone_i2', 'ǐ': 'tone_i3', 'ì': 'tone_i4',
  'ū': 'tone_u1', 'ú': 'tone_u2', 'ǔ': 'tone_u3', 'ù': 'tone_u4',
  'ǖ': 'tone_v1', 'ǘ': 'tone_v2', 'ǚ': 'tone_v3', 'ǜ': 'tone_v4',
};

// 游戏音频映射
const GAME_AUDIO_MAP: Record<string, string> = {
  '八': 'game_ba', '妈': 'game_ma', '大': 'game_da',
  '歌': 'game_ge', '鸡': 'game_ji', '知': 'game_zhi2',
  '喝': 'game_he', '一': 'game_yi2', '屋': 'game_wu2',
  '雨': 'game_yu3',
};

// 快闪认读音频映射
const FLASH_AUDIO_MAP: Record<string, string> = {
  '波': 'flash_b', '泼': 'flash_p', '摸': 'flash_m',
  '佛': 'flash_f', '得': 'flash_d', '特': 'flash_t',
  '呢': 'flash_n', '哥': 'flash_g', '科': 'flash_k',
  '喝': 'flash_h',
};

/**
 * 获取音频文件路径
 * 从当前页面 URL 自动推导 base path，不依赖任何全局变量
 */
function getAudioUrl(audioKey: string): string {
  try {
    if (typeof window !== 'undefined') {
      // 从当前 URL 路径推导 base path
      // 例如 /pinyin-gem/learn/mouth -> /pinyin-gem
      // 例如 /pinyin-gem -> /pinyin-gem
      const pathname = window.location.pathname;
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length >= 1 && segments[0] === 'pinyin-gem') {
        return `/pinyin-gem/assets/audio/${audioKey}.mp3`;
      }
      return `/assets/audio/${audioKey}.mp3`;
    }
  } catch {
    // ignore
  }
  return `/pinyin-gem/assets/audio/${audioKey}.mp3`;
}

/**
 * 通过 HTML5 Audio 播放音频文件
 * @returns true 表示播放成功，false 表示失败
 */
function playAudioFile(url: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    try {
      // 停止当前播放
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
        currentAudio = null;
      }

      const audio = new Audio();
      currentAudio = audio;
      let settled = false;

      const done = (ok: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        if (!ok) currentAudio = null;
        resolve(ok);
      };

      // 设置加载超时
      const timeout = setTimeout(() => {
        console.warn('[audio] 加载超时:', url);
        done(false);
      }, 8000);

      audio.onerror = () => {
        console.warn('[audio] 加载失败:', url);
        done(false);
      };

      audio.oncanplaythrough = () => {
        audio.play().then(() => {
          done(true); // 播放启动成功
        }).catch((err) => {
          console.warn('[audio] play() 被拒绝:', err.message);
          done(false);
        });
      };

      audio.onended = () => {
        currentAudio = null;
      };

      audio.src = url;
      audio.load();
    } catch (err) {
      console.warn('[audio] 创建 Audio 失败:', err);
      resolve(false);
    }
  });
}

/**
 * 查找文本对应的预生成音频 key
 */
function findAudioKey(text: string): string | null {
  if (PINYIN_AUDIO_MAP[text]) return PINYIN_AUDIO_MAP[text];
  if (EXAMPLE_AUDIO_MAP[text]) return EXAMPLE_AUDIO_MAP[text];
  if (TONE_AUDIO_MAP[text]) return TONE_AUDIO_MAP[text];
  if (GAME_AUDIO_MAP[text]) return GAME_AUDIO_MAP[text];
  if (FLASH_AUDIO_MAP[text]) return FLASH_AUDIO_MAP[text];
  return null;
}

// ---- TTS (Text-to-Speech) ----

/**
 * 使用 Web Speech API / expo-speech 播放文本
 */
function speakWithTTS(text: string, options: PlayOptions): Promise<void> {
  return new Promise<void>((resolve) => {
    try {
      Speech.stop();
      Speech.speak(text, {
        language: options.language || 'zh-CN',
        rate: options.rate || 0.5,
        pitch: options.pitch || 1.0,
        onDone: () => resolve(),
        onError: () => resolve(),
        onStopped: () => resolve(),
      });
    } catch {
      resolve();
    }
  });
}

/**
 * 播放拼音发音
 * 优先使用预生成的高质量音频，失败自动回退到 expo-speech
 */
export async function playPinyin(
  text: string,
  options: PlayOptions = {},
): Promise<void> {
  const { language = 'zh-CN', rate = 0.5, pitch = 1.0 } = options;

  // 尝试播放预生成音频文件（所有平台都尝试）
  const audioKey = findAudioKey(text);
  if (audioKey) {
    const url = getAudioUrl(audioKey);
    const success = await playAudioFile(url);
    if (success) return; // 文件播放成功，直接返回
    // 文件播放失败，继续回退到 TTS
    console.log('[audio] 文件播放失败，回退到 TTS:', text);
  }

  // 回退到 expo-speech (Web Speech API)
  await speakWithTTS(text, { language, rate, pitch });
}

/**
 * 停止当前朗读
 */
export function stopSpeaking(): void {
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      currentAudio = null;
    }
    Speech.stop();
  } catch {
    // ignore
  }
}

// ---- Recording ----

export async function startRecording(): Promise<void> {
  if (isRecording) return;

  if (Platform.OS === 'web') {
    Alert.alert(
      '提示',
      '网页版暂不支持录音功能，请在手机或平板上使用哦~',
      [{ text: '知道了' }],
    );
    throw new Error('Recording not supported on web');
  }

  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        '需要麦克风权限',
        '录音需要麦克风权限，请在系统设置中开启。',
        [
          { text: '取消', style: 'cancel' },
          { text: '去设置', onPress: () => Linking.openSettings() },
        ],
      );
      throw new Error('Microphone permission denied');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();

    recordingInstance = recording;
    isRecording = true;
  } catch (error: any) {
    if (
      error?.message === 'Microphone permission denied' ||
      error?.message === 'Recording not supported on web'
    ) {
      throw error;
    }
    isRecording = false;
    recordingInstance = null;
    throw error;
  }
}

export async function stopRecording(): Promise<RecordingResult> {
  if (!isRecording || !recordingInstance) {
    return { uri: '', confidence: 0 };
  }

  try {
    await recordingInstance.stopAndUnloadAsync();
    const uri = recordingInstance.getURI() || '';
    recordingInstance = null;
    isRecording = false;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    const confidence = Math.floor(Math.random() * 41) + 60;
    return { uri, confidence };
  } catch {
    recordingInstance = null;
    isRecording = false;
    return { uri: '', confidence: 0 };
  }
}

export async function cleanupRecording(): Promise<void> {
  if (recordingInstance && isRecording) {
    try { await recordingInstance.stopAndUnloadAsync(); } catch { /* */ }
  }
  recordingInstance = null;
  isRecording = false;
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
  } catch { /* */ }
}

export function getIsRecording(): boolean {
  return isRecording;
}
