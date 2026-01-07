// hooks/useUserReports.ts
import { useState, useEffect, useCallback } from 'react';
import { ItemsService } from '../services/itemsService';
import { UserService } from '../services/userService';
import type { UserReport } from '../types/personalHub';

export const useUserReports = (userId: string | null) => {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const getConditionLabel = (condition: number): string => {
    const conditionMap: { [key: number]: string } = {
      1: 'excellent',
      2: 'good',
      3: 'fair',
      4: 'damaged'
    };
    return conditionMap[condition] || 'good';
  };

  const getHandoverLabel = (handover: number): string => {
    const handoverMap: { [key: number]: string } = {
      1: 'meet',
      2: 'pickup',
      3: 'mail'
    };
    return handoverMap[handover] || 'meet';
  };

  const getContactMethodLabel = (method: number): string => {
    const methodMap: { [key: number]: string } = {
      1: 'phone',
      2: 'email',
      3: 'both'
    };
    return methodMap[method] || 'phone';
  };

  const fetchReports = useCallback(async (loadMore = false) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await ItemsService.getReportsByUser(userId, loadMore ? currentPage + 1 : 1);

      let reportsArray: any[] = [];
      let hasMoreData = false;

      // Handle nested response structure
      if (response && typeof response === 'object') {
        if (
          'data' in response &&
          response.data &&
          typeof response.data === 'object' &&
          'data' in response.data &&
          Array.isArray((response.data as any).data)
        ) {
          reportsArray = (response.data as any).data;
          hasMoreData = (response.data as any).hasMore || (response.data as any).loadMore || false;
        } else if ('data' in response && Array.isArray(response.data)) {
          reportsArray = response.data;
          hasMoreData = (response as any).hasMore || false;
        } else if ('reports' in response && Array.isArray(response.reports)) {
          reportsArray = response.reports;
          hasMoreData = (response as any).hasMore || false;
        } else if (Array.isArray(response)) {
          reportsArray = response;
          hasMoreData = false;
        }
      }

      // Transform reports
      const mappedReports: UserReport[] = reportsArray.map((report) => ({
        id: report.id || report.reportId,
        title: report.title || report.itemName || 'Untitled Report',
        category: report.category || report.itemCategory || 'Other',
        location: report.incidentLocation || report.location || 'Unknown Location',
        currentLocation: report.currentLocation || '',
        date: report.incidentDate !== '0001-01-01T00:00:00' ? report.incidentDate : report.createdAt || new Date().toISOString(),
        time: report.incidentTime || '',
        status: report.statusDescription?.toLowerCase() || 'active',
        views: report.viewsCount || report.views || 0,
        type: String(report.reportType).toLowerCase().includes('lost') || report.reportType === 1 ? 'lost' : 
              String(report.reportType).toLowerCase().includes('found') || report.reportType === 2 ? 'found' :
              String(report.reportType).toLowerCase(),
        description: report.description || '',
        circumstances: report.circumstances || '',
        identifyingFeatures: report.identifyingFeatures || '',
        condition: getConditionLabel(report.condition || 2),
        handoverPreference: getHandoverLabel(report.handoverPreference || 1),
        contactInfo: {
          name: report.contactName || 'Unknown',
          phone: report.contactPhone || '',
          email: report.contactEmail || '',
          preferredContact: getContactMethodLabel(report.preferredContactMethod || 1)
        },
        reward: {
          amount: report.rewardAmount || 0,
          description: report.rewardDescription || ''
        },
        images: report.imageUrls || [],
        storageLocation: report.storageLocation || '',
        createdAt: report.createdAt || new Date().toISOString(),
        updatedAt: report.dateModified || report.updatedAt || new Date().toISOString(),
        expiresAt: report.expiresAt,
        reportTypeDescription: report.reportTypeDescription,
        verificationStatus: report.verificationStatusDescription,
        potentialMatches: report.potentialMatchesCount || 0
      }));

      if (loadMore) {
        setReports(prev => [...prev, ...mappedReports]);
        setCurrentPage(prev => prev + 1);
      } else {
        setReports(mappedReports);
        setCurrentPage(1);
      }

      setHasMore(hasMoreData);
    } catch (err) {
      console.error('Error fetching user reports:', err);
      setError('Failed to load reports');
      setReports([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [userId, currentPage]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    fetchReports(true);
  }, [loading, hasMore, fetchReports]);

  useEffect(() => {
    if (userId) {
      fetchReports(false);
    }
  }, [userId, fetchReports]);

  return {
    reports,
    loading,
    hasMore,
    error,
    loadMore,
    refetch: () => fetchReports(false)
  };
};