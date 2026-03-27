import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Card } from '@/components/shared/Card';
import { colors } from '@/theme/colors';
import { Text } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  /** Validate form inputs */
  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = t('validation.emailRequired', 'Email is required');
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      newErrors.email = t('validation.emailInvalid', 'Please enter a valid email');
    }

    if (!password.trim()) {
      newErrors.password = t('validation.passwordRequired', 'Password is required');
    } else if (password.length < 6) {
      newErrors.password = t('validation.passwordTooShort', 'Password must be at least 6 characters');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Handle login */
  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email, password);
      showToast(t('auth.loginSuccess', 'Welcome back!'), 'success');
      // Navigation handled by AuthContext redirect
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('auth.loginFailed', 'Login failed. Please try again.');
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>ResqHub</Text>
          <Text style={styles.title}>{t('auth.login', 'Login')}</Text>
          <Text style={styles.subtitle}>{t('auth.loginSubtitle', 'Welcome back! Login to your account')}</Text>
        </View>

        {/* Form Card */}
        <Card variant="filled" padding="lg" style={styles.formCard}>
          <Input
            label={t('common.email', 'Email')}
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            icon="mail"
            editable={!loading}
          />

          <Input
            label={t('common.password', 'Password')}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
            icon="lock"
            editable={!loading}
            style={styles.passwordInput}
          />

          {/* Login Button */}
          <Button
            variant="primary"
            size="md"
            onPress={handleLogin}
            disabled={loading}
            loading={loading}
            style={styles.loginButton}
          >
            {t('auth.login', 'Login')}
          </Button>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              {t('auth.noAccount', "Don't have an account? ")}
              <Text
                style={[styles.registerLink, { color: colors.primary[600] }]}
                onPress={() => router.push('/auth/register')}
              >
                {t('auth.registerHere', 'Register here')}
              </Text>
            </Text>
          </View>
        </Card>

        {/* Forgot Password Link */}
        <View style={styles.forgotContainer}>
          <Text
            style={[styles.forgotLink, { color: colors.primary[600] }]}
            onPress={() => showToast(t('auth.resetLink', 'Reset link sent to your email'), 'info')}
          >
            {t('auth.forgotPassword', 'Forgot password?')}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: colors.spacing.md,
    paddingVertical: colors.spacing.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: colors.spacing.xl,
  },
  logo: {
    fontSize: colors.typography.sizes.lg,
    fontWeight: colors.typography.weights.bold as any,
    color: colors.primary[600],
    marginBottom: colors.spacing.sm,
  },
  title: {
    fontSize: colors.typography.sizes.xl,
    fontWeight: colors.typography.weights.bold as any,
    color: colors.neutral[900],
    marginBottom: colors.spacing.xs,
  },
  subtitle: {
    fontSize: colors.typography.sizes.sm,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  formCard: {
    marginBottom: colors.spacing.lg,
  },
  passwordInput: {
    marginTop: colors.spacing.md,
  },
  loginButton: {
    marginTop: colors.spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: colors.spacing.lg,
  },
  registerContainer: {
    alignItems: 'center',
  },
  registerText: {
    fontSize: colors.typography.sizes.sm,
    color: colors.neutral[600],
  },
  registerLink: {
    fontWeight: colors.typography.weights.semibold as any,
  },
  forgotContainer: {
    alignItems: 'center',
    marginTop: colors.spacing.md,
  },
  forgotLink: {
    fontSize: colors.typography.sizes.sm,
    fontWeight: colors.typography.weights.semibold as any,
  },
});
