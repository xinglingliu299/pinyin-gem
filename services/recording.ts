/**
 * 录音存储服务
 *
 * 登录用户：录音上传到 Supabase Storage
 * 游客用户：仅本地（返回提示信息）
 */

import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

const BUCKET = 'recordings';

export interface RecordingItem {
  id: string;
  name: string;
  pinyin: string;
  url: string;
  created_at: string;
  duration?: number;
}

/**
 * 上传录音到 Supabase Storage
 */
export async function uploadRecording(
  user: User,
  blob: Blob,
  filename: string,
): Promise<string | null> {
  try {
    const path = `${user.id}/${Date.now()}_${filename}.webm`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, {
        contentType: blob.type || 'audio/webm',
        upsert: false,
      });

    if (error) {
      console.warn('[Storage] upload failed:', error.message);
      return null;
    }

    // 获取公共 URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return publicUrl;
  } catch (e) {
    console.warn('[Storage] upload failed:', e);
    return null;
  }
}

/**
 * 列出用户的所有录音
 */
export async function listRecordings(user: User): Promise<RecordingItem[]> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(user.id, {
        sortBy: { column: 'created_at', order: 'desc' },
        limit: 100,
      });

    if (error || !data) return [];

    return data.map((item) => {
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(`${user.id}/${item.name}`);
      return {
        id: item.id!,
        name: item.name,
        pinyin: item.metadata?.pinyin || '',
        url: urlData.publicUrl,
        created_at: item.created_at || '',
      };
    });
  } catch (e) {
    console.warn('[Storage] list failed:', e);
    return [];
  }
}

/**
 * 删除录音
 */
export async function deleteRecording(user: User, filename: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([`${user.id}/${filename}`]);
    return !error;
  } catch {
    return false;
  }
}
