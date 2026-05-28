/**
 * 登录页
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('请输入邮箱和密码');
      return;
    }
    setLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setErrorMsg(error);
      }
    } catch (e: any) {
      console.error('Login error:', e);
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
          <Text style={s.emoji}>👸</Text>
          <Text style={s.title}>拼音魔法公主</Text>
          <Text style={s.subtitle}>登录账号，学习进度云端同步</Text>
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

          <Text style={[s.label, { marginTop: 16 }]}>密码</Text>
          <TextInput
            style={s.input}
            placeholder="请输入密码"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={s.forgotBtn}
            onPress={() => router.push('/auth/forgot-password' as any)}
          >
            <Text style={s.forgotText}>忘记密码？</Text>
          </TouchableOpacity>

          {errorMsg ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[s.primaryBtn, loading && s.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={s.primaryBtnText}>
              {loading ? '登录中...' : '登 录'}
            </Text>
          </TouchableOpacity>

          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>或</Text>
            <View style={s.dividerLine} />
          </View>

          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={() => router.push('/auth/register' as any)}
            activeOpacity={0.8}
          >
            <Text style={s.secondaryBtnText}>注册新账号</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.guestBtn}
            onPress={() => router.replace('/(tabs)' as any)}
            activeOpacity={0.8}
          >
            <Text style={s.guestBtnText}>游客模式（数据仅存本地）</Text>
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
  emoji: { fontSize: 64 },
  title: { fontSize: 28, fontWeight: '700', color: '#6B21A8', marginTop: 12 },
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
  forgotBtn: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 8 },
  forgotText: { fontSize: 13, color: '#8B5CF6' },
  primaryBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 12, color: '#9CA3AF', fontSize: 13 },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#8B5CF6', fontSize: 16, fontWeight: '600' },
  guestBtn: { marginTop: 16, alignItems: 'center', padding: 8 },
  guestBtnText: { color: '#9CA3AF', fontSize: 13 },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginTop: 12 },
  errorText: { color: '#DC2626', fontSize: 14 },
});
