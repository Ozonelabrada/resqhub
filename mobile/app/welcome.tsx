import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { colors, spacing } from '@/theme/colors';

const { height } = Dimensions.get('window');

interface LanguageOption {
  code: 'en' | 'tl' | 'ceb';
  name: string;
  nativeName: string;
  flag: string;
  description: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'ceb',
    name: 'Cebuano',
    nativeName: 'Cebuano',
    flag: '🇵🇭',
    description: 'Bisaya/Cebuano',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    description: 'English language',
  },
  {
    code: 'tl',
    name: 'Tagalog',
    nativeName: 'Tagalog',
    flag: '🇵🇭',
    description: 'Wikang Tagalog',
  },
];

export default function WelcomeScreen() {
  const { isAuthenticated } = useAuth();
  const { currentLanguage, setLanguage } = useLanguage();
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState<'en' | 'tl' | 'ceb'>(
    currentLanguage || 'en'
  );

  const handleLanguageSelect = async (lang: 'en' | 'tl' | 'ceb') => {
    setSelectedLang(lang);
    await setLanguage(lang);
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.replace('(tabs)');
    } else {
      router.push('auth/login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Ionicons
              name="search"
              size={48}
              color={colors.primary.DEFAULT}
            />
          </View>
          <Text style={styles.title}>FindrHub</Text>
          <Text style={styles.subtitle}>Find Lost & Found Items in Your Community</Text>
        </View>

        {/* Language Selection */}
        <View style={styles.languageSection}>
          <Text style={styles.sectionTitle}>Select Language</Text>
          <View style={styles.languageGrid}>
            {LANGUAGE_OPTIONS.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageCard,
                  selectedLang === lang.code && styles.languageCardActive,
                ]}
                onPress={() => handleLanguageSelect(lang.code)}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <Text style={styles.langName}>{lang.nativeName}</Text>
                <Text style={styles.langDesc}>{lang.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why FindrHub?</Text>
          <Card variant="outlined" padding="md" style={styles.featureCard}>
            <View style={styles.featureItem}>
              <View
                style={[
                  styles.iconBg,
                  { backgroundColor: `${colors.primary.DEFAULT}15` },
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={24}
                  color={colors.primary.DEFAULT}
                />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Find Lost Items</Text>
                <Text style={styles.featureDesc}>
                  Help return lost items to their owners
                </Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <View
                style={[
                  styles.iconBg,
                  { backgroundColor: `${colors.success.DEFAULT}15` },
                ]}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color={colors.success.DEFAULT}
                />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Report Found Items</Text>
                <Text style={styles.featureDesc}>
                  Post found items and connect with owners
                </Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <View
                style={[
                  styles.iconBg,
                  { backgroundColor: `${colors.info.DEFAULT}15` },
                ]}
              >
                <Ionicons
                  name="people-outline"
                  size={24}
                  color={colors.info.DEFAULT}
                />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Join Communities</Text>
                <Text style={styles.featureDesc}>
                  Connect with neighbors and help each other
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* CTA Button */}
        <Button
          title="Get Started"
          onPress={handleGetStarted}
          variant="primary"
          size="lg"
          fullWidth
          style={styles.ctaButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary.DEFAULT}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  languageSection: {
    marginBottom: spacing.xl * 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  languageGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  languageCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  languageCardActive: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: `${colors.primary.DEFAULT}10`,
  },
  flag: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  langName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  langDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  featuresSection: {
    marginBottom: spacing.xl,
  },
  featureCard: {
    gap: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  featureDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  ctaButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
