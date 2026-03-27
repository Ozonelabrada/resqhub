import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenLayout } from '@/components/shared/ScreenLayout';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { reportsService, Report } from '@/services/reportsService';
import { colors } from '@/theme/colors';
import { Text } from 'react-native';

type ReportType = 'all' | 'lost' | 'found';

export default function HomeScreen() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<ReportType>('all');

  /** Fetch reports */
  const fetchReports = useCallback(async (type: ReportType = 'all') => {
    try {
      setLoading(true);
      let result = await reportsService.getReports({ limit: 20, offset: 0 });

      // Filter by type if needed
      if (type !== 'all') {
        result = {
          ...result,
          data: result.data.filter((report) => report.type === type),
        };
      }

      setReports(result.data || []);
    } catch (error) {
      showToast(t('errors.loadReportsFailed', 'Failed to load reports'), 'error');
      setReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t, showToast]);

  // Fetch on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchReports(selectedType);
    }, [selectedType, fetchReports])
  );

  /** Handle refresh */
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports(selectedType);
  }, [selectedType, fetchReports]);

  /** Handle filter change */
  const handleFilterChange = (type: ReportType) => {
    setSelectedType(type);
    setLoading(true);
  };

  /** Render report item */
  const renderReportItem = ({ item }: { item: Report }) => (
    <Card variant="elevated" padding="md" style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportTitleContainer}>
          <Text style={styles.reportTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Badge
            variant={item.type === 'lost' ? 'error' : 'success'}
            size="sm"
            label={t(`report.type.${item.type}`, item.type.charAt(0).toUpperCase() + item.type.slice(1))}
            style={styles.typeBadge}
          />
        </View>
      </View>

      <Text style={styles.reportCategory}>{item.category}</Text>
      <Text style={styles.reportLocation} numberOfLines={1}>
        📍 {item.location}
      </Text>
      <Text style={styles.reportDescription} numberOfLines={3}>
        {item.description}
      </Text>

      <View style={styles.reportMeta}>
        <Text style={styles.reportDate}>
          {new Date(item.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
        <View style={styles.reportStats}>
          <Text style={styles.reportStat}>👁 {item.views || 0}</Text>
          <Text style={styles.reportStat}>❤️ {item.reactions?.length || 0}</Text>
        </View>
      </View>

      <Button
        variant="outlined"
        size="sm"
        label={t('common.viewDetails', 'View Details')}
        style={styles.viewButton}
        onPress={() => {
          showToast(t('common.comingSoon', 'Coming soon'), 'info');
        }}
      />
    </Card>
  );

  return (
    <ScreenLayout
      headerProps={{
        title: t('home.title', 'Home'),
        variant: 'light',
        showNotifications: true,
        showSearch: true,
      }}
      showNavBar={true}
    >
      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        <Button
          variant={selectedType === 'all' ? 'primary' : 'outlined'}
          size="sm"
          label={t('report.filter.all', 'All')}
          onPress={() => handleFilterChange('all')}
          style={styles.filterButton}
        />
        <Button
          variant={selectedType === 'lost' ? 'primary' : 'outlined'}
          size="sm"
          label={t('report.filter.lost', 'Lost Items')}
          onPress={() => handleFilterChange('lost')}
          style={styles.filterButton}
        />
        <Button
          variant={selectedType === 'found' ? 'primary' : 'outlined'}
          size="sm"
          label={t('report.filter.found', 'Found Items')}
          onPress={() => handleFilterChange('found')}
          style={styles.filterButton}
        />
      </View>

      {/* Loading State */}
      {loading && !refreshing && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.loadingText}>{t('common.loading', 'Loading...')}</Text>
        </View>
      )}

      {/* Empty State */}
      {!loading && reports.length === 0 && (
        <EmptyState
          icon="📭"
          title={t('home.noReports', 'No reports found')}
          description={t('home.noReportsDesc', 'Be the first to report a lost or found item!')}
          actionLabel={t('home.createReport', 'Create Report')}
          size="md"
          onAction={() => showToast(t('common.comingSoon', 'Coming soon'), 'info')}
        />
      )}

      {/* Reports List */}
      {!loading && reports.length > 0 && (
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary[600]}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: colors.spacing.md,
    paddingVertical: colors.spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    gap: colors.spacing.sm,
  },
  filterButton: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: colors.spacing.xl,
  },
  loadingText: {
    marginTop: colors.spacing.md,
    fontSize: colors.typography.sizes.sm,
    color: colors.neutral[500],
  },
  listContent: {
    paddingHorizontal: colors.spacing.md,
    paddingVertical: colors.spacing.md,
  },
  reportCard: {
    marginBottom: colors.spacing.md,
  },
  reportHeader: {
    marginBottom: colors.spacing.sm,
  },
  reportTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: colors.spacing.sm,
  },
  reportTitle: {
    flex: 1,
    fontSize: colors.typography.sizes.md,
    fontWeight: colors.typography.weights.semibold as any,
    color: colors.neutral[900],
  },
  typeBadge: {
    marginTop: colors.spacing.xs,
  },
  reportCategory: {
    fontSize: colors.typography.sizes.sm,
    color: colors.primary[600],
    fontWeight: colors.typography.weights.semibold as any,
    marginBottom: colors.spacing.xs,
  },
  reportLocation: {
    fontSize: colors.typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: colors.spacing.xs,
  },
  reportDescription: {
    fontSize: colors.typography.sizes.sm,
    color: colors.neutral[700],
    lineHeight: 20,
    marginBottom: colors.spacing.md,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: colors.spacing.md,
    paddingBottom: colors.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  reportDate: {
    fontSize: colors.typography.sizes.xs,
    color: colors.neutral[500],
  },
  reportStats: {
    flexDirection: 'row',
    gap: colors.spacing.md,
  },
  reportStat: {
    fontSize: colors.typography.sizes.xs,
    color: colors.neutral[600],
  },
  viewButton: {
    marginTop: colors.spacing.sm,
  },
  separator: {
    height: colors.spacing.xs,
  },
});
