/**
 * 录音存储服务
 *
 * 登录用户：录音上传到 Supabase Storage + 元数据写入 user_recordings 表
 * 游客用户：仅本地（不保存）
 *
 * 业务规则：每个拼音只保留最高分的录音（由 saveRecording 内部处理）
 */

import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

const BUCKET = 'recordings';

export interface RecordingItem {
  id: string;
  level_id: string;
  pinyin: string;
  url: string;
  score: number;
  duration?: number;
  created_at: string;
}

/**
 * 上传录音到 Supabase Storage，并保存元数据到 user_recordings 表
 * 内部自动处理：同一拼音只保留最高分录音
 *
 * @param user 登录用户
 * @param blob 录音文件 Blob
 * @param levelId 拼音级别 id，如 'b', 'ai'
 * @param pinyin 拼音，如 'bō'
 * @param score 发音评分 0-100
 * @param duration 录音时长（秒）
 * @returns 是否成功保存（分数不高时也可能返回 false）
 */
export async function saveRecording(
  user: User,
  blob: Blob,
  levelId: string,
  pinyin: string,
  score: number,
  duration?: number,
): Promise<{ saved: boolean; url?: string }> {
  try {
    // 1. 上传到 Storage
    const path = `${user.id}/${Date.now()}_${levelId}.webm`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, {
        contentType: blob.type || 'audio/webm',
        upsert: false,
      });

    if (uploadError) {
      console.warn('[Storage] upload failed:', uploadError.message);
      return { saved: false };
    }

    // 2. 获取公共 URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);

    // 3. 调用 RPC 保存元数据（内部自动去重：只保留最高分）
    const { data, error: rpcError } = await supabase.rpc('save_user_recording', {
      p_level_id: levelId,
      p_pinyin: pinyin,
      p_storage_path: path,
      p_public_url: publicUrl,
      p_score: score,
      p_duration: duration ?? null,
    });

    if (rpcError) {
      console.warn('[RPC] save_user_recording failed:', rpcError.message);
      // Storage 已上传，RPC 失败仍视为部分成功
      return { saved: false };
    }

    console.log('[Recording] saved:', data);
    return { saved: data?.saved === true, url: publicUrl };
  } catch (e) {
    console.warn('[Storage] saveRecording failed:', e);
    return { saved: false };
  }
}

/**
 * 获取当前用户的所有录音（只返回每个拼音最高分的那条）
 */
export async function listRecordings(): Promise<RecordingItem[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_recordings');
    if (error || !data) {
      console.warn('[RPC] get_user_recordings failed:', error?.message);
      return [];
    }

    const list = Array.isArray(data) ? data : [];
    return list.map((item: any) => ({
      id: item.id ?? '',
      level_id: item.level_id ?? '',
      pinyin: item.pinyin ?? '',
      url: item.public_url ?? '',
      score: item.score ?? 0,
      duration: item.duration ?? undefined,
      created_at: item.created_at ?? '',
    }));
  } catch (e) {
    console.warn('[RPC] get_user_recordings failed:', e);
    return [];
  }
}

/**
 * 删除录音（Storage 文件 + user_recordings 记录）
 */
export async function deleteRecording(recordingId: string, storagePath: string): Promise<boolean> {
  try {
    // 1. 删除 Storage 文件
    await supabase.storage.from(BUCKET).remove([storagePath]);

    // 2. 删除数据库记录（通过 RPC，带 auth 验证）
    const { error } = await supabase.rpc('delete_user_recording_by_id', {
      p_recording_id: recordingId,
    });

    if (error) {
      console.warn('[RPC] delete failed:', error.message);
    }

    return !error;
  } catch {
    return false;
  }
}
