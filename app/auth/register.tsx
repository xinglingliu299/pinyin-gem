/**
 * 注册页
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

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { signUp } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('请输入邮箱和密码');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('密码至少需要6个字符');
      return;
    }
    if (password !== confirmPwd) {
      setErrorMsg('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    try {
      const { error } = await signUp(email.trim(), password);
      if (error) {
        setErrorMsg(error);
      } else {
        setSuccessMsg('注册成功！正在跳转登录页...');
        setTimeout(() => router.push('/auth/login' as any), 1500);
      }
    } catch (e: any) {
      console.error('Register error:', e);
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
          <Text style={s.emoji}>✨</Text>
          <Text style={s.title}>注册新账号</Text>
          <Text style={s.subtitle}>创建账号，学习进度云端保存</Text>
        </View>

        <View style={s.form}>
          <Text style={s.label}>邮箱地址</Text>
          <TextInput
            style={s.input}
            placeholder="请输入邮箱"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[s.label, { marginTop: 16 }]}>设置密码</Text>
          <TextInput
            style={s.input}
            placeholder="至少6个字符"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={[s.label, { marginTop: 16 }]}>确认密码</Text>
          <TextInput
            style={s.input}
            placeholder="再次输入密码"
            placeholderTextColor="#aaa"
            value={confirmPwd}
            onChangeText={setConfirmPwd}
            secureTextEntry
          />

          {errorMsg ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {successMsg ? (
            <View style={s.successBox}>
              <Text style={s.successText}>{successMsg}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[s.primaryBtn, loading && s.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={s.primaryBtnText}>
              {loading ? '注册中...' : '注 册'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={s.backBtnText}>← 已有账号？去登录</Text>
          </TouchableOpacity>
        </View>
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
  backBtn: { marginTop: 20, alignItems: 'center', padding: 8 },
  backBtnText: { color: '#8B5CF6', fontSize: 14 },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginTop: 12 },
  errorText: { color: '#DC2626', fontSize: 14 },
  successBox: { backgroundColor: '#D1FAE5', borderRadius: 10, padding: 12, marginTop: 12 },
  successText: { color: '#065F46', fontSize: 14 },
});
