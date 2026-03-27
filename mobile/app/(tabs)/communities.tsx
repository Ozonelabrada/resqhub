import { View, StyleSheet } from 'react-native';
import { ScreenLayout } from '@/components/shared/ScreenLayout';
import { useLanguage } from '@/context/LanguageContext';
import { EmptyState } from '@/components/shared/EmptyState';
import { colors } from '@/theme/colors';

export default function CommunitiesScreen() {
  const { t } = useLanguage();

  const handleCreateCommunity = () => {
    // TODO: Navigate to create community screen
  };

  return (
    <ScreenLayout
      headerProps={{
        title: t('communities.title', 'Communities'),
        variant: 'light',
        showNotifications: true,
        showSearch: true,
      }}
      showNavBar={true}
      scrollable={false}
    >
      <View style={styles.container}>
        <EmptyState
          icon="👥"
          title={t('communities.comingSoon', 'Communities Coming Soon')}
          description={t('communities.comingSoonDesc', 'Join communities and connect with neighbors around you.')}
          actionLabel={t('communities.explore', 'Explore')}
          size="md"
          onAction={handleCreateCommunity}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
