import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenLayout } from '@/components/shared/ScreenLayout';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { colors } from '@/theme/colors';
import { Text } from 'react-native';

export default function ProfileScreen() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  /** Handle logout */
  const handleLogout = async () => {
    try {
      await logout();
      showToast(t('auth.logoutSuccess', 'Logged out successfully'), 'success');
      router.replace('/welcome');
    } catch (error) {
      showToast(t('auth.logoutFailed', 'Failed to logout'), 'error');
    }
  };

  return (
    <ScreenLayout
      headerProps={{
        title: t('profile.title', 'Profile'),
        variant: 'light',
        showNotifications: true,
      }}
      showNavBar={true}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <Card variant="filled" padding="lg" style={styles.userCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || '?'}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{user?.name || t('common.unknown', 'Unknown')}</Text>
              <Text style={styles.userEmail}>{user?.email || ''}</Text>
            </View>
          </View>
        </Card>

        {/* Stats Section */}
        <Card variant="outlined" padding="md" style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>{t('profile.reportsPosted', 'Reports Posted')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>{t('profile.helpfulVotes', 'Helpful Votes')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>{t('profile.itemsResolved', 'Items Resolved')}</Text>
            </View>
          </View>
        </Card>

        {/* Settings Section */}
        <Text style={styles.sectionTitle}>{t('profile.settings', 'Settings')}</Text>

        <Card variant="outlined" padding="md" style={styles.settingsCard}>
          <Button
            variant="ghost"
            size="md"
            label={t('profile.editProfile', 'Edit Profile')}
            style={styles.settingButton}
            onPress={() => showToast(t('common.comingSoon', 'Coming soon'), 'info')}
          />
          <View style={styles.divider} />

          <Button
            variant="ghost"
            size="md"
            label={t('profile.changeLanguage', 'Change Language')}
            style={styles.settingButton}
            onPress={() => router.push('/welcome')}
          />
          <View style={styles.divider} />

          <Button
            variant="ghost"
            size="md"
            label={t('profile.notificationSettings', 'Notification Settings')}
            style={styles.settingButton}
            onPress={() => showToast(t('common.comingSoon', 'Coming soon'), 'info')}
          />
          <View style={styles.divider} />

          <Button
            variant="ghost"
            size="md"
            label={t('profile.privacyPolicy', 'Privacy Policy')}
            style={styles.settingButton}
            onPress={() => showToast(t('common.comingSoon', 'Coming soon'), 'info')}
          />
          <View style={styles.divider} />

          <Button
            variant="ghost"
            size="md"
            label={t('profile.termsOfService', 'Terms of Service')}
            style={styles.settingButton}
            onPress={() => showToast(t('common.comingSoon', 'Coming soon'), 'info')}
          />
        </Card>

        {/* Logout Button */}
        <Button
          variant="primary"
          size="md"
          label={t('auth.logout', 'Logout')}
          style={styles.logoutButton}
          onPress={handleLogout}
        />

        {/* Footer Spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: colors.spacing.md,
    paddingVertical: colors.spacing.md,
  },
  userCard: {
    marginBottom: colors.spacing.lg,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: colors.spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: colors.typography.sizes.lg,
    fontWeight: colors.typography.weights.bold as any,
    color: colors.primary[600],
  },
  userName: {
    fontSize: colors.typography.sizes.md,
    fontWeight: colors.typography.weights.semibold as any,
    color: colors.neutral[900],
  },
  userEmail: {
    fontSize: colors.typography.sizes.sm,
    color: colors.neutral[500],
    marginTop: colors.spacing.xs,
  },
  statsCard: {
    marginBottom: colors.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: colors.typography.sizes.lg,
    fontWeight: colors.typography.weights.bold as any,
    color: colors.primary[600],
  },
  statLabel: {
    fontSize: colors.typography.sizes.xs,
    color: colors.neutral[600],
    marginTop: colors.spacing.xs,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: colors.typography.sizes.md,
    fontWeight: colors.typography.weights.semibold as any,
    color: colors.neutral[900],
    marginBottom: colors.spacing.md,
  },
  settingsCard: {
    marginBottom: colors.spacing.lg,
  },
  settingButton: {
    paddingVertical: colors.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
  },
  logoutButton: {
    marginBottom: colors.spacing.lg,
  },
  footer: {
    height: colors.spacing.lg,
  },
});
