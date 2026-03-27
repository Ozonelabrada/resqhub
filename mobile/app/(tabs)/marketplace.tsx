import { View, StyleSheet } from 'react-native';
import { ScreenLayout } from '@/components/shared/ScreenLayout';
import { useLanguage } from '@/context/LanguageContext';
import { EmptyState } from '@/components/shared/EmptyState';
import { colors } from '@/theme/colors';

export default function MarketplaceScreen() {
  const { t } = useLanguage();

  const handleBrowse = () => {
    // TODO: Navigate to marketplace listings
  };

  return (
    <ScreenLayout
      headerProps={{
        title: t('marketplace.title', 'Marketplace'),
        variant: 'light',
        showNotifications: true,
        showSearch: true,
      }}
      showNavBar={true}
      scrollable={false}
    >
      <View style={styles.container}>
        <EmptyState
          icon="🛍️"
          title={t('marketplace.comingSoon', 'Marketplace Coming Soon')}
          description={t('marketplace.comingSoonDesc', 'Buy, sell, and trade items with your community.')}
          actionLabel={t('marketplace.browse', 'Browse')}
          size="md"
          onAction={handleBrowse}
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
