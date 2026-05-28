/**
 * 忘记密码页
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/services/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { resetPassword } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!email.trim()) {
      setErrorMsg('请输入邮箱');
      return;
    }
    setLoading(true);
    try {
      const { error } = await resetPassword(email.trim());
      if (error) {
        setErrorMsg(error);
      } else {
        setSent(true);
      }
    } catch (e: any) {
      console.error('Reset password error:', e);
      setErrorMsg(e?.message || '网络错误，请检查网络连接后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'web' ? undefined : 'padding'}
    >
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.logoArea}>
          <Text style={s.emoji}>🔑</Text>
          <Text style={s.title}>找回密码</Text>
          <Text style={s.subtitle}>
            {sent ? '重置邮件已发送' : '输入注册邮箱，发送重置链接'}
          </Text>
        </View>

        {!sent ? (
          <View style={s.form}>
            <Text style={s.label}>邮箱地址</Text>
            <TextInput
              style={s.input}
              placeholder="请输入注册时使用的邮箱"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errorMsg ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{errorMsg}</Text>
              </View>
            ) : null}
            <TouchableOpacity
              style={[s.primaryBtn, loading && s.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={s.primaryBtnText}>
                {loading ? '发送中...' : '发送重置链接'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.form}>
            <View style={s.successBox}>
              <Text style={s.successText}>
                请检查 {email} 的收件箱，点击邮件中的链接即可重置密码。
              </Text>
            </View>
            <TouchableOpacity
              style={s.primaryBtn}
              onPress={() => router.push('/auth/login' as any)}
              activeOpacity={0.8}
            >
              <Text style={s.primaryBtnText}>返回登录</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={s.backBtnText}>← 返回</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5FF' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 32 },
  logoArea: { alignItems: 'center', marginBottom: 40 },
  emoji: { fontSize: 56 },
  title: { fontSize: 26, fontWeight: '700', color: '#6B21A8', marginTop: 12 },
  subtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
  form: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  primaryBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  successBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  successText: { fontSize: 14, color: '#166534', lineHeight: 22 },
  backBtn: { marginTop: 24, alignItems: 'center', padding: 8 },
  backBtnText: { color: '#8B5CF6', fontSize: 14 },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginTop: 12 },
  errorText: { color: '#DC2626', fontSize: 14 },
});
