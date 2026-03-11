import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  loginFarmer,
  clearAuthErrors,
} from '../../store/slices/authSlice';
import { SCREENS, COLORS } from '../../constants';
import { TRANSLATIONS } from '../../constants/locationData';

const LoginScreen = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { loginLoading, loginError, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  // Language from route params (set during registration) or default EN
  const lang = route?.params?.language || 'EN';
  const t = TRANSLATIONS[lang] || TRANSLATIONS.EN;

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearAuthErrors());
  }, [dispatch]);

  // Navigate to home on successful login
  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: SCREENS.HOME }],
      });
    }
  }, [isAuthenticated, navigation]);

  const handleLogin = () => {
    setLocalError('');
    dispatch(clearAuthErrors());

    if (!userName.trim() || !password.trim()) {
      setLocalError(t.fillAll);
      return;
    }

    dispatch(loginFarmer({ userName: userName.trim(), password }));
  };

  const displayError = localError || loginError;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>

            {/* ─── Logo & Header ─── */}
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  backgroundColor: COLORS.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  shadowColor: COLORS.primary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <Ionicons name="leaf" size={40} color={COLORS.white} />
              </View>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '800',
                  color: COLORS.primaryDark,
                  letterSpacing: -0.5,
                }}
              >
                GramVikash
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: COLORS.textSecondary,
                  marginTop: 4,
                }}
              >
                {t.loginSubtitle}
              </Text>
            </View>

            {/* ─── Error Banner ─── */}
            {displayError ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#FEF2F2',
                  borderWidth: 1,
                  borderColor: '#FECACA',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 20,
                }}
              >
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text
                  style={{
                    color: COLORS.error,
                    fontSize: 13,
                    marginLeft: 8,
                    flex: 1,
                  }}
                >
                  {displayError}
                </Text>
              </View>
            ) : null}

            {/* ─── Username Field ─── */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: COLORS.textPrimary,
                  marginBottom: 8,
                  marginLeft: 4,
                }}
              >
                {t.username}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: COLORS.white,
                  borderWidth: 1.5,
                  borderColor: COLORS.border,
                  borderRadius: 14,
                  paddingHorizontal: 14,
                }}
              >
                <Ionicons name="person-outline" size={20} color={COLORS.textMuted} />
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    paddingHorizontal: 10,
                    fontSize: 15,
                    color: COLORS.textPrimary,
                  }}
                  placeholder={t.usernamePlaceholder}
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  value={userName}
                  onChangeText={setUserName}
                  editable={!loginLoading}
                />
              </View>
            </View>

            {/* ─── Password Field ─── */}
            <View style={{ marginBottom: 8 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: COLORS.textPrimary,
                  marginBottom: 8,
                  marginLeft: 4,
                }}
              >
                {t.password}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: COLORS.white,
                  borderWidth: 1.5,
                  borderColor: COLORS.border,
                  borderRadius: 14,
                  paddingHorizontal: 14,
                }}
              >
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} />
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    paddingHorizontal: 10,
                    fontSize: 15,
                    color: COLORS.textPrimary,
                  }}
                  placeholder={t.passwordPlaceholder}
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loginLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* ─── Sign In Button ─── */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loginLoading}
              activeOpacity={0.85}
              style={{
                marginTop: 28,
                backgroundColor: loginLoading ? COLORS.primaryLight : COLORS.primary,
                borderRadius: 14,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {loginLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 8 }} />
              ) : (
                <Ionicons name="log-in-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
              )}
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 16,
                  fontWeight: '700',
                }}
              >
                {loginLoading ? t.loggingIn : t.login}
              </Text>
            </TouchableOpacity>

            {/* ─── Register Link ─── */}
            <TouchableOpacity
              style={{
                marginTop: 24,
                alignItems: 'center',
                paddingVertical: 8,
              }}
              onPress={() => navigation.navigate(SCREENS.REGISTER)}
              disabled={loginLoading}
            >
              <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                {t.noAccount}{' '}
                <Text
                  style={{
                    color: COLORS.primary,
                    fontWeight: '700',
                  }}
                >
                  {t.registerLink}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
