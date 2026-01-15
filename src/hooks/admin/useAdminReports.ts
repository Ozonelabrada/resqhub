import { useState, useEffect } from 'react';
import { AdminService } from '@/services';
import type { 
  AdminReport, 
  ReportListParams, 
  ReportListResponse,
  AdminAction,
  AdminActionResponse,
  ReportSummary
} from '@/types';

export const useAdminReports = (initialParams: ReportListParams = {}) => {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [params, setParams] = useState<ReportListParams>(initialParams);

  const loadReports = async (newParams?: ReportListParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedParams = { ...params, ...newParams };
      const response: ReportListResponse = await AdminService.getReports(mergedParams);
      
      if (response.succeeded && response.data) {
        setReports(response.data.items);
        setSummary(response.data.summary);
        setPagination({
          page: response.data.page,
          pageSize: response.data.pageSize,
          total: response.data.total,
          totalPages: response.data.totalPages || 0
        });
      }
      
      setParams(mergedParams);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Failed to load reports');
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const resolveReport = async (id: string, reason?: string): Promise<boolean> => {
    try {
      const action: AdminAction = {
        type: 'resolve',
        reason,
        notifyUser: true
      };
      
      const response: AdminActionResponse = await AdminService.takeReportAction(id, action);
      
      if (response.succeeded && response.data.success) {
        setReports(prev => prev.map(report => 
          report.id === id 
            ? { ...report, status: 'resolved' as const }
            : report
        ));
        
        await AdminService.logAdminAction({
          adminId: 'current-admin',
          adminName: 'Admin User',
          action: 'resolve_report',
          resourceType: 'report',
          resourceId: id,
          details: `Report resolved${reason ? `: ${reason}` : ''}`
        });
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error resolving report:', err);
      return false;
    }
  };

  const escalateReport = async (id: string, assignedTo: string, reason?: string): Promise<boolean> => {
    try {
      const action: AdminAction = {
        type: 'escalate',
        assignedTo,
        reason,
        notifyUser: true
      };
      
      const response: AdminActionResponse = await AdminService.takeReportAction(id, action);
      
      if (response.succeeded && response.data.success) {
        setReports(prev => prev.map(report => 
          report.id === id 
            ? { 
                ...report, 
                status: 'investigating' as const,
                priority: 'high' as const,
                assignedTo: { id: assignedTo, name: 'Senior Admin' } // Would be actual user data
              }
            : report
        ));
        
        await AdminService.logAdminAction({
          adminId: 'current-admin',
          adminName: 'Admin User',
          action: 'escalate_report',
          resourceType: 'report',
          resourceId: id,
          details: `Report escalated to ${assignedTo}${reason ? `: ${reason}` : ''}`
        });
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error escalating report:', err);
      return false;
    }
  };

  const assignReport = async (id: string, assignedTo: string): Promise<boolean> => {
    try {
      const action: AdminAction = {
        type: 'assign',
        assignedTo,
        notifyUser: true
      };
      
      const response: AdminActionResponse = await AdminService.takeReportAction(id, action);
      
      if (response.succeeded && response.data.success) {
        setReports(prev => prev.map(report => 
          report.id === id 
            ? { 
                ...report,
                assignedTo: { id: assignedTo, name: 'Admin User' } // Would be actual user data
              }
            : report
        ));
        
        await AdminService.logAdminAction({
          adminId: 'current-admin',
          adminName: 'Admin User',
          action: 'assign_report',
          resourceType: 'report',
          resourceId: id,
          details: `Report assigned to ${assignedTo}`
        });
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error assigning report:', err);
      return false;
    }
  };

  const dismissReport = async (id: string, reason: string): Promise<boolean> => {
    try {
      // Using resolve action for dismiss - would need separate endpoint
      const action: AdminAction = {
        type: 'resolve',
        reason,
        notifyUser: true
      };
      
      const response: AdminActionResponse = await AdminService.takeReportAction(id, action);
      
      if (response.succeeded && response.data.success) {
        setReports(prev => prev.map(report => 
          report.id === id 
            ? { ...report, status: 'dismissed' as const }
            : report
        ));
        
        await AdminService.logAdminAction({
          adminId: 'current-admin',
          adminName: 'Admin User',
          action: 'dismiss_report',
          resourceType: 'report',
          resourceId: id,
          details: `Report dismissed: ${reason}`
        });
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error dismissing report:', err);
      return false;
    }
  };

  const searchReports = (query: string) => {
    loadReports({ ...params, page: 1 });
  };

  const filterByType = (type: ReportListParams['type']) => {
    loadReports({ ...params, type, page: 1 });
  };

  const filterByStatus = (status: ReportListParams['status']) => {
    loadReports({ ...params, status, page: 1 });
  };

  const filterByPriority = (priority: ReportListParams['priority']) => {
    loadReports({ ...params, priority, page: 1 });
  };

  const filterByCommunity = (communityId: string) => {
    loadReports({ ...params, communityId, page: 1 });
  };

  const filterByDateRange = (from?: string, to?: string) => {
    loadReports({ ...params, from, to, page: 1 });
  };

  const sortReports = (sort: ReportListParams['sort'], order: ReportListParams['order'] = 'desc') => {
    loadReports({ ...params, sort, order, page: 1 });
  };

  const changePage = (page: number) => {
    loadReports({ ...params, page });
  };

  const changePageSize = (pageSize: number) => {
    loadReports({ ...params, pageSize, page: 1 });
  };

  const refresh = () => {
    loadReports(params);
  };

  // Load initial data
  useEffect(() => {
    loadReports();
  }, []); // Only run once on mount

  return {
    reports,
    summary,
    loading,
    error,
    pagination,
    params,
    loadReports,
    resolveReport,
    escalateReport,
    assignReport,
    dismissReport,
    searchReports,
    filterByType,
    filterByStatus,
    filterByPriority,
    filterByCommunity,
    filterByDateRange,
    sortReports,
    changePage,
    changePageSize,
    refresh
  };
};

export default useAdminReports;