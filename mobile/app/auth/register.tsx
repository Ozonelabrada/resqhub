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

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});

  /** Validate form inputs */
  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};

    if (!name.trim()) {
      newErrors.name = t('validation.nameRequired', 'Name is required');
    } else if (name.trim().length < 2) {
      newErrors.name = t('validation.nameTooShort', 'Name must be at least 2 characters');
    }

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

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t('validation.confirmPasswordRequired', 'Please confirm your password');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMismatch', 'Passwords do not match');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Handle registration */
  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(email, password, name);
      showToast(t('auth.registerSuccess', 'Account created successfully!'), 'success');
      // Navigation handled by AuthContext redirect
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('auth.registerFailed', 'Registration failed. Please try again.');
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
          <Text style={styles.title}>{t('auth.register', 'Register')}</Text>
          <Text style={styles.subtitle}>{t('auth.registerSubtitle', 'Create a new account to get started')}</Text>
        </View>

        {/* Form Card */}
        <Card variant="filled" padding="lg" style={styles.formCard}>
          <Input
            label={t('common.name', 'Full Name')}
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={errors.name}
            icon="user"
            editable={!loading}
          />

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
            style={styles.emailInput}
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

          <Input
            label={t('auth.confirmPassword', 'Confirm Password')}
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={errors.confirmPassword}
            icon="lock"
            editable={!loading}
            style={styles.confirmPasswordInput}
          />

          {/* Register Button */}
          <Button
            variant="primary"
            size="md"
            onPress={handleRegister}
            disabled={loading}
            loading={loading}
            style={styles.registerButton}
          >
            {t('auth.register', 'Register')}
          </Button>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              {t('auth.haveAccount', 'Already have an account? ')}
              <Text
                style={[styles.loginLink, { color: colors.primary[600] }]}
                onPress={() => router.push('/auth/login')}
              >
                {t('auth.loginHere', 'Login here')}
              </Text>
            </Text>
          </View>
        </Card>

        {/* Terms & Conditions */}
        <Text style={styles.termsText}>
          {t('auth.agreeTerms', 'By registering, you agree to our ')}
          <Text style={[styles.termsLink, { color: colors.primary[600] }]}>
            {t('common.termsOfService', 'Terms of Service')}
          </Text>
        </Text>
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
  emailInput: {
    marginTop: colors.spacing.md,
  },
  passwordInput: {
    marginTop: colors.spacing.md,
  },
  confirmPasswordInput: {
    marginTop: colors.spacing.md,
  },
  registerButton: {
    marginTop: colors.spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: colors.spacing.lg,
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: colors.typography.sizes.sm,
    color: colors.neutral[600],
  },
  loginLink: {
    fontWeight: colors.typography.weights.semibold as any,
  },
  termsText: {
    fontSize: colors.typography.sizes.xs,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: colors.spacing.md,
  },
  termsLink: {
    fontWeight: colors.typography.weights.semibold as any,
  },
});
