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

// 字母独立发音映射（两步学习法：先听字母音，再听连读）
// key = 关卡 id（level.id），value = 音频文件名
const LETTER_AUDIO_MAP: Record<string, string> = {
  // 第一阶段：单韵母
  'a': 'letter_a', 'o': 'letter_o', 'e': 'letter_e',
  'i': 'letter_i', 'u': 'letter_u', 'v': 'letter_v', 'ü': 'letter_v',
  // 第二阶段：声母（慢速发音，突出辅音）
  'b': 'letter_b', 'p': 'letter_p', 'm': 'letter_m', 'f': 'letter_f',
  'd': 'letter_d', 't': 'letter_t', 'n': 'letter_n', 'l': 'letter_l',
  'g': 'letter_g', 'k': 'letter_k', 'h': 'letter_h',
  'j': 'letter_j', 'q': 'letter_q', 'x': 'letter_x',
  'zh': 'letter_zh', 'ch': 'letter_ch', 'sh': 'letter_sh', 'r': 'letter_r',
  'z': 'letter_z', 'c': 'letter_c', 's': 'letter_s',
  'y': 'letter_y', 'w': 'letter_w',
  // 第三阶段：复韵母+鼻韵母
  'ai': 'letter_ai', 'ei': 'letter_ei', 'ui': 'letter_ui',
  'ao': 'letter_ao', 'ou': 'letter_ou', 'iu': 'letter_iu',
  'ie': 'letter_ie', 've': 'letter_ve', 'er': 'letter_er',
  'an': 'letter_an', 'en': 'letter_en', 'in': 'letter_in',
  'ang': 'letter_ang', 'eng': 'letter_eng',
  // 第四阶段：整体认读音节
  'zhi': 'letter_zhi', 'chi': 'letter_chi', 'shi': 'letter_shi',
  'ri': 'letter_ri', 'zi': 'letter_zi', 'ci': 'letter_ci',
  'si': 'letter_si', 'yi': 'letter_yi', 'wu': 'letter_wu',
  'yu': 'letter_yu', 'ye': 'letter_ye',
  // 额外映射：快闪认读用到的组合
  'yue': 'letter_ve', 'yun': 'letter_yu',
};

// 字母回退 TTS 用中文文本（防止读成英文）
const LETTER_TTS_FALLBACK: Record<string, string> = {
  'a': '阿', 'o': '哦', 'e': '鹅', 'i': '衣', 'u': '乌', 'v': '鱼', 'ü': '鱼',
  'b': '玻', 'p': '坡', 'm': '摸', 'f': '佛',
  'd': '得', 't': '特', 'n': '呢', 'l': '勒',
  'g': '哥', 'k': '科', 'h': '喝',
  'j': '鸡', 'q': '七', 'x': '西',
  'zh': '知', 'ch': '吃', 'sh': '诗', 'r': '日',
  'z': '资', 'c': '次', 's': '思',
  'y': '衣', 'w': '乌',
  'ai': '爱', 'ei': '诶', 'ui': '威',
  'ao': '熬', 'ou': '欧', 'iu': '优',
  'ie': '耶', 've': '约', 'er': '耳',
  'an': '安', 'en': '恩', 'in': '因',
  'ang': '昂', 'eng': '鞥',
  'zhi': '织', 'chi': '吃', 'shi': '狮',
  'ri': '日', 'zi': '字', 'ci': '瓷',
  'si': '丝', 'yi': '衣', 'wu': '无',
  'yu': '雨', 'ye': '夜',
  'yue': '约', 'yun': '云',
};

// 音频缓存版本号 — 音频文件更新时手动递增，强制浏览器重新下载
export const AUDIO_CACHE_VERSION = 4;

/**
 * 获取视频文件路径
 */
function getVideoUrl(videoKey: string): string {
  try {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const segments = pathname.split('/').filter(Boolean);
      let base: string;
      if (segments.length >= 1 && segments[0] === 'pinyin-gem') {
        base = `/pinyin-gem/assets/video/${videoKey}.mp4`;
      } else {
        base = `/assets/video/${videoKey}.mp4`;
      }
      return `${base}?v=${AUDIO_CACHE_VERSION}`;
    }
  } catch {
    // ignore
  }
  return `/pinyin-gem/assets/video/${videoKey}.mp4?v=${AUDIO_CACHE_VERSION}`;
}

// 口型视频映射：关卡ID -> 视频文件名
const MOUTH_VIDEO_MAP: Record<string, string> = {
  'a': 'mouth_a', 'o': 'mouth_o', 'e': 'mouth_e',
  'i': 'mouth_i', 'u': 'mouth_u', 'v': 'mouth_v',
  'b': 'mouth_b', 'p': 'mouth_p', 'm': 'mouth_m', 'f': 'mouth_f',
};

/**
 * 获取口型示范视频 URL
 */
export function getMouthVideoUrl(levelId: string): string | null {
  const videoKey = MOUTH_VIDEO_MAP[levelId];
  if (!videoKey) return null;
  return getVideoUrl(videoKey);
}

/**
 * 获取音频文件路径
 * 从当前页面 URL 自动推导 base path，不依赖任何全局变量
 * 附加缓存版本号参数，防止浏览器播放旧版缓存
 */
function getAudioUrl(audioKey: string): string {
  try {
    if (typeof window !== 'undefined') {
      // 从当前 URL 路径推导 base path
      // 例如 /pinyin-gem/learn/mouth -> /pinyin-gem
      // 例如 /pinyin-gem -> /pinyin-gem
      const pathname = window.location.pathname;
      const segments = pathname.split('/').filter(Boolean);
      let base: string;
      if (segments.length >= 1 && segments[0] === 'pinyin-gem') {
        base = `/pinyin-gem/assets/audio/${audioKey}.mp3`;
      } else {
        base = `/assets/audio/${audioKey}.mp3`;
      }
      return `${base}?v=${AUDIO_CACHE_VERSION}`;
    }
  } catch {
    // ignore
  }
  return `/pinyin-gem/assets/audio/${audioKey}.mp3?v=${AUDIO_CACHE_VERSION}`;
}

/**
 * 通过 HTML5 Audio 播放音频文件
 * 手机浏览器修复：play() 必须在用户点击回调内同步调用，不能延迟到事件回调中
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

      const audio = new window.Audio();
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

      // onerror 任何加载错误都视为失败
      audio.onerror = () => {
        console.warn('[audio] 加载失败:', url);
        done(false);
      };

      // 播放结束
      audio.onended = () => {
        currentAudio = null;
      };

      // oncanplaythrough — 加载完成后播放（作为首次 play() 失败的后备）
      audio.oncanplaythrough = () => {
        if (!settled) {
          audio.play().then(() => done(true)).catch((err) => {
            console.warn('[audio] 后备 play() 仍被拒绝:', err.message);
            done(false);
          });
        }
      };

      audio.src = url;
      audio.load();

      // 首次 play()：在用户交互回调内同步调用，满足手机 autoplay 策略
      // 如果音频已缓存会直接成功；如果未加载完成会抛出
      audio.play().then(() => done(true)).catch((err) => {
        // 不立即放弃，等 oncanplaythrough 重试（大多数失败是因未加载完成）
        console.warn('[audio] 首次 play() 未就绪，等待加载后再试:', err.message);
      });
    } catch (err) {
      console.warn('[audio] 创建 Audio 失败:', err);
      resolve(false);
    }
  });
}

// playPinyin 回退 TTS 用中文文本
const PINYIN_TTS_FALLBACK: Record<string, string> = {
  'ā': '阿', 'ō': '哦', 'ē': '鹅', 'ī': '衣', 'ū': '乌', 'ǖ': '鱼',
  'bō': '波', 'pō': '泼', 'mō': '摸', 'fō': '佛',
  'dē': '得', 'tē': '特', 'nē': '呢', 'lē': '勒',
  'gē': '哥', 'kē': '科', 'hē': '喝',
  'jī': '鸡', 'qī': '七', 'xī': '西',
  'zhī': '知', 'chī': '吃', 'shī': '诗',
  'rì': '日', 'zī': '资', 'cī': '次', 'sī': '思',
  'yī': '衣', 'wū': '乌',
  'āi': '爱', 'ēi': '诶', 'uī': '威',
  'āo': '熬', 'ōu': '欧', 'iū': '优',
  'iē': '耶', 'üē': '约', 'ér': '耳',
  'ān': '安', 'ēn': '恩', 'yīn': '因',
  'āng': '昂', 'ēng': '鞥',
  'zì': '字', 'cí': '瓷', 'wú': '无',
  'yǔ': '雨', 'yè': '夜',
};

// playPinyin 回退 TTS 用中文文本
const FLASH_TTS_FALLBACK: Record<string, string> = {
  '波': '波', '泼': '泼', '摸': '摸',
  '佛': '佛', '得': '得', '特': '特',
  '呢': '呢', '哥': '哥', '科': '科', '喝': '喝',
};

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

  // 回退到 expo-speech (Web Speech API)，用中文文本避免读成英文
  const fallbackText = PINYIN_TTS_FALLBACK[text] || FLASH_TTS_FALLBACK[text] || text;
  await speakWithTTS(fallbackText, { language, rate, pitch });
}

/**
 * 播放字母独立发音（两步学习法第一步）
 * 通过关卡 ID 查找对应的字母音频文件
 */
export async function playLetter(
  levelId: string,
  options: PlayOptions = {},
): Promise<void> {
  const { language = 'zh-CN', rate = 0.5, pitch = 1.0 } = options;
  const audioKey = LETTER_AUDIO_MAP[levelId];
  if (audioKey) {
    const url = getAudioUrl(audioKey);
    const success = await playAudioFile(url);
    if (success) return;
    console.log('[audio] 字母音频播放失败，回退到 TTS:', levelId);
  }
  // 回退：用 TTS 读中文文本（防止单字母被读成英文）
  const fallbackText = LETTER_TTS_FALLBACK[levelId] || levelId;
  await speakWithTTS(fallbackText, { language, rate, pitch });
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
// 支持：原生 expo-av + Web MediaRecorder API

let webMediaRecorder: MediaRecorder | null = null;
let webAudioChunks: Blob[] = [];
let webStream: MediaStream | null = null;

export async function startRecording(): Promise<void> {
  if (isRecording) return;

  // Web 端：使用 MediaRecorder API
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.mediaDevices) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      webStream = stream;
      webAudioChunks = [];

      // 优先使用 webm，Safari 回退 mp4
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) webAudioChunks.push(e.data);
      };
      recorder.start(200); // 每200ms一个chunk
      webMediaRecorder = recorder;
      isRecording = true;
      return;
    } catch (error: any) {
      if (error?.name === 'NotAllowedError') {
        Alert.alert(
          '需要麦克风权限',
          '请在浏览器中允许麦克风访问后重试。',
        );
      }
      throw new Error('麦克风访问失败');
    }
  }

  // 原生端：expo-av
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
  // Web 端：停止 MediaRecorder
  if (webMediaRecorder && webMediaRecorder.state !== 'inactive') {
    return new Promise<RecordingResult>((resolve) => {
      const mimeType = webMediaRecorder!.mimeType;
      webMediaRecorder!.onstop = () => {
        const blob = new Blob(webAudioChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        // 清理流
        webStream?.getTracks().forEach((t) => t.stop());
        webStream = null;
        webMediaRecorder = null;
        webAudioChunks = [];
        isRecording = false;

        // 随机评分（后续可接入真实语音识别）
        const confidence = Math.floor(Math.random() * 41) + 60;
        resolve({ uri: url, confidence });
      };
      webMediaRecorder!.stop();
    });
  }

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
