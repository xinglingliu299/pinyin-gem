/**
 * 录音列表页
 * 从 Supabase 获取历史录音，只显示每个拼音最高分的那条
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/services/auth';
import { listRecordings, deleteRecording, type RecordingItem } from '@/services/recording';

export default function RecordingsPage() {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const currentAudioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (user) {
      loadRecordings();
    } else {
      setLoading(false);
    }
    return () => {
      currentAudioRef.current?.pause();
    };
  }, [user]);

  const loadRecordings = async () => {
    setLoading(true);
    const items = await listRecordings();
    setRecordings(items);
    setLoading(false);
  };

  const handlePlay = (item: RecordingItem) => {
    if (playingId === item.id) {
      currentAudioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    currentAudioRef.current?.pause();

    const audio = new Audio(item.url);
    currentAudioRef.current = audio;
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => {
      setPlayingId(null);
      Alert.alert('播放失败', '无法播放该录音');
    };
    audio.play();
    setPlayingId(item.id);
  };

  const handleDelete = (item: RecordingItem) => {
    Alert.alert('确认删除', '删除后无法恢复，确认要删除这条录音吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          // 从 Storage 路径中提取文件名
          const filename = item.url.split('/').pop() || '';
          const storagePath = `${user?.id}/${filename.replace(/\?.*$/, '')}`;
          const ok = await deleteRecording(item.id, storagePath);
          if (ok) {
            setRecordings((prev) => prev.filter((r) => r.id !== item.id));
          } else {
            Alert.alert('删除失败', '请稍后再试');
          }
        },
      },
    ]);
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return iso;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#22C55E';
    if (score >= 65) return '#F59E0B';
    return '#EF4444';
  };

  if (!user) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.backBtn}>← 返回</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>我的录音</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>🎤</Text>
          <Text style={s.emptyText}>请先登录账号</Text>
          <Text style={s.emptySub}>登录后录音数据自动保存到云端</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backBtn}>← 返回</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>我的录音</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 40 }} />
      ) : recordings.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>🎙️</Text>
          <Text style={s.emptyText}>还没有录音</Text>
          <Text style={s.emptySub}>在跟读练习中录音后，会自动保存到这里</Text>
        </View>
      ) : (
        <FlatList
          data={recordings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <View style={s.card}>
              <TouchableOpacity
                style={s.playArea}
                onPress={() => handlePlay(item)}
                activeOpacity={0.7}
              >
                <View style={[s.playIcon, playingId === item.id && s.playIconActive]}>
                  <Text style={s.playIconText}>{playingId === item.id ? '⏸' : '▶'}</Text>
                </View>
                <View style={s.info}>
                  <View style={s.nameRow}>
                    <Text style={s.name}>{item.pinyin}</Text>
                    <View style={[s.scoreBadge, { backgroundColor: getScoreColor(item.score) + '20' }]}>
                      <Text style={[s.scoreText, { color: getScoreColor(item.score) }]}>
                        {item.score}分
                      </Text>
                    </View>
                  </View>
                  <Text style={s.date}>{formatDate(item.created_at)}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.deleteBtn}
                onPress={() => handleDelete(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={s.deleteText}>🗑</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5FF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 12,
  },
  backBtn: { fontSize: 16, color: '#8B5CF6', width: 40 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  list: { padding: 16, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 1,
  },
  playArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  playIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconActive: { backgroundColor: '#8B5CF6' },
  playIconText: { fontSize: 14 },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  scoreBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scoreText: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  deleteBtn: { padding: 8 },
  deleteText: { fontSize: 18 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 100,
  },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: 17, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40 },
});
