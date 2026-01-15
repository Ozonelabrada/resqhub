import { useState, useEffect } from 'react';
import { AdminService } from '@/services';
import type { 
  CommunitySummary, 
  CommunityListParams, 
  CommunityListResponse,
  AdminAction,
  AdminActionResponse
} from '@/types';

export const useAdminCommunities = (initialParams: CommunityListParams = {}) => {
  const [communities, setCommunities] = useState<CommunitySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [params, setParams] = useState<CommunityListParams>(initialParams);

  const loadCommunities = async (newParams?: CommunityListParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedParams = { ...params, ...newParams };
      const response: CommunityListResponse = await AdminService.getCommunities(mergedParams);
      
      if (response.succeeded && response.data) {
        setCommunities(response.data.items);
        setPagination({
          page: response.data.page,
          pageSize: response.data.pageSize,
          total: response.data.total,
          totalPages: response.data.totalPages || 0
        });
      }
      
      setParams(mergedParams);
    } catch (err) {
      console.error('Error loading communities:', err);
      setError('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const approveCommunity = async (id: string, reason?: string): Promise<boolean> => {
    try {
      const action: AdminAction = {
        type: 'approve',
        reason,
        notifyUser: true
      };
      
      const response: AdminActionResponse = await AdminService.approveCommunity(id, action);
      
      if (response.succeeded && response.data.success) {
        // Update local state
        setCommunities(prev => prev.map(community => 
          String(community.id) === id 
            ? { ...community, status: 'active' as const }
            : community
        ));
        
        // Log the admin action
        await AdminService.logAdminAction({
          adminId: 'current-admin', // Would be actual admin ID
          adminName: 'Admin User', // Would be actual admin name
          action: 'approve_community',
          resourceType: 'community',
          resourceId: id,
          details: `Community approved${reason ? `: ${reason}` : ''}`
        });
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error approving community:', err);
      return false;
    }
  };

  const rejectCommunity = async (id: string, reason: string): Promise<boolean> => {
    try {
      const action: AdminAction = {
        type: 'reject',
        reason,
        notifyUser: true
      };
      
      const response: AdminActionResponse = await AdminService.rejectCommunity(id, action);
      
      if (response.succeeded && response.data.success) {
        // Update local state
        setCommunities(prev => prev.map(community => 
          String(community.id) === id 
            ? { ...community, status: 'rejected' as const }
            : community
        ));
        
        // Log the admin action
        await AdminService.logAdminAction({
          adminId: 'current-admin',
          adminName: 'Admin User',
          action: 'reject_community',
          resourceType: 'community',
          resourceId: id,
          details: `Community rejected: ${reason}`
        });
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error rejecting community:', err);
      return false;
    }
  };

  const disableCommunity = async (id: string, reason?: string): Promise<boolean> => {
    try {
      const action: AdminAction = {
        type: 'disable',
        reason,
        notifyUser: true
      };
      
      // Note: Using reject endpoint for disable action - would need separate endpoint
      const response: AdminActionResponse = await AdminService.rejectCommunity(id, action);
      
      if (response.succeeded && response.data.success) {
        setCommunities(prev => prev.map(community => 
          String(community.id) === id 
            ? { ...community, status: 'disabled' as const }
            : community
        ));
        
        await AdminService.logAdminAction({
          adminId: 'current-admin',
          adminName: 'Admin User',
          action: 'disable_community',
          resourceType: 'community',
          resourceId: id,
          details: `Community disabled${reason ? `: ${reason}` : ''}`
        });
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error disabling community:', err);
      return false;
    }
  };

  const searchCommunities = (query: string) => {
    loadCommunities({ ...params, query, page: 1 });
  };

  const filterByStatus = (status: CommunityListParams['status']) => {
    loadCommunities({ ...params, status, page: 1 });
  };

  const sortCommunities = (sort: CommunityListParams['sort'], order: CommunityListParams['order'] = 'desc') => {
    loadCommunities({ ...params, sort, order, page: 1 });
  };

  const changePage = (page: number) => {
    loadCommunities({ ...params, page });
  };

  const changePageSize = (pageSize: number) => {
    loadCommunities({ ...params, pageSize, page: 1 });
  };

  const refresh = () => {
    loadCommunities(params);
  };

  // Load initial data
  useEffect(() => {
    loadCommunities();
  }, []); // Only run once on mount

  return {
    communities,
    loading,
    error,
    pagination,
    params,
    loadCommunities,
    approveCommunity,
    rejectCommunity,
    disableCommunity,
    searchCommunities,
    filterByStatus,
    sortCommunities,
    changePage,
    changePageSize,
    refresh
  };
};

export default useAdminCommunities;