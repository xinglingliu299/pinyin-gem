/**
 * 音频服务层
 * - TTS 朗读：expo-speech（跨平台，含 Web）
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

// ---- TTS (Text-to-Speech) ----

/**
 * 播放拼音发音
 * @param text 要朗读的文本（拼音或例字）
 * @param options 播放选项，rate 默认 0.5（儿童友好慢速）
 */
export async function playPinyin(
  text: string,
  options: PlayOptions = {},
): Promise<void> {
  const { language = 'zh-CN', rate = 0.5, pitch = 1.0 } = options;

  return new Promise<void>((resolve, reject) => {
    try {
      // Stop any ongoing speech first
      Speech.stop();

      Speech.speak(text, {
        language,
        rate,
        pitch,
        onDone: () => resolve(),
        onError: (error) => {
          console.warn('[Audio] TTS error:', error);
          resolve(); // silent fail for child-friendly UX
        },
        onStopped: () => resolve(),
      });
    } catch (error) {
      console.warn('[Audio] TTS exception:', error);
      resolve(); // silent fail
    }
  });
}

/**
 * 停止当前朗读
 */
export function stopSpeaking(): void {
  try {
    Speech.stop();
  } catch (e) {
    // ignore
  }
}

// ---- Recording ----

/**
 * 开始录音
 * 需先请求麦克风权限
 */
export async function startRecording(): Promise<void> {
  if (isRecording) {
    console.warn('[Audio] Already recording, ignoring duplicate start');
    return;
  }

  // Web 平台不支持录音
  if (Platform.OS === 'web') {
    Alert.alert(
      '提示',
      '网页版暂不支持录音功能，请在手机或平板上使用哦~',
      [{ text: '知道了' }],
    );
    throw new Error('Recording not supported on web');
  }

  try {
    // 请求权限
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

    // 配置音频模式
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // 创建并开始录音
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );
    await recording.startAsync();

    recordingInstance = recording;
    isRecording = true;
  } catch (error: any) {
    // 权限被拒绝时，error 可能是我们抛出的，直接重新抛出
    if (
      error?.message === 'Microphone permission denied' ||
      error?.message === 'Recording not supported on web'
    ) {
      throw error;
    }
    console.warn('[Audio] Recording start failed:', error);
    isRecording = false;
    recordingInstance = null;
    throw error;
  }
}

/**
 * 停止录音并返回结果
 * @returns 录音文件 URI 和模拟的置信度评分（60-100）
 */
export async function stopRecording(): Promise<RecordingResult> {
  if (!isRecording || !recordingInstance) {
    console.warn('[Audio] No active recording to stop');
    return { uri: '', confidence: 0 };
  }

  try {
    await recordingInstance.stopAndUnloadAsync();
    const uri = recordingInstance.getURI() || '';

    // 清理
    recordingInstance = null;
    isRecording = false;

    // 恢复音频模式
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    // 模拟置信度评分：60-100 随机
    const confidence = Math.floor(Math.random() * 41) + 60; // 60-100

    return { uri, confidence };
  } catch (error) {
    console.warn('[Audio] Recording stop failed:', error);
    recordingInstance = null;
    isRecording = false;
    return { uri: '', confidence: 0 };
  }
}

/**
 * 清理：取消正在进行的录音
 */
export async function cleanupRecording(): Promise<void> {
  if (recordingInstance && isRecording) {
    try {
      await recordingInstance.stopAndUnloadAsync();
    } catch (e) {
      // ignore
    }
  }
  recordingInstance = null;
  isRecording = false;

  // 恢复音频模式
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
  } catch (e) {
    // ignore
  }
}

/**
 * 检查是否正在录音
 */
export function getIsRecording(): boolean {
  return isRecording;
}
