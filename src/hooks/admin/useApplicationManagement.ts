import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { AdminService } from '@/services';
import type {
  Application,
  ApplicationListParams,
  ApplicationStatus,
  ApplicationRole
} from '@/types/admin';

export interface ApplicationStatusCounts {
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
}

export interface UseApplicationManagementReturn {
  // State
  applications: Application[];
  applicationDetail: Application | null;
  statusCounts: ApplicationStatusCounts;
  isLoading: boolean;
  isDetailLoading: boolean;
  isActionLoading: boolean;

  // Methods
  fetchApplications: (params: ApplicationListParams) => Promise<void>;
  fetchApplicationDetail: (id: string) => Promise<void>;
  approveApplication: (id: string, reason?: string) => Promise<boolean>;
  rejectApplication: (id: string, reason: string) => Promise<boolean>;
  suspendApplication: (id: string, reason?: string) => Promise<boolean>;
  reactivateApplication: (id: string, reason?: string) => Promise<boolean>;
  clearDetail: () => void;
}

/**
 * Custom hook to manage all application-related state and operations
 * Handles fetching, filtering, and performing actions on applications
 */
export const useApplicationManagement = (): UseApplicationManagementReturn => {
  // State
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationDetail, setApplicationDetail] = useState<Application | null>(null);
  const [statusCounts, setStatusCounts] = useState<ApplicationStatusCounts>({
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch applications with optional filters
  const fetchApplications = useCallback(
    async (params: ApplicationListParams = {}): Promise<void> => {
      setIsLoading(true);
      try {
        const response = await AdminService.getApplications(params);
        if (response.succeeded && response.data) {
          setApplications(response.data.items || []);
          if (response.data.summary) {
            setStatusCounts(response.data.summary);
          }
        } else {
          toast.error('Failed to load applications');
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Error loading applications');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch single application detail
  const fetchApplicationDetail = useCallback(
    async (id: string): Promise<void> => {
      setIsDetailLoading(true);
      try {
        const detail = await AdminService.getApplicationDetail(id);
        setApplicationDetail(detail);
      } catch (error) {
        console.error('Error fetching application detail:', error);
        toast.error('Failed to load application details');
      } finally {
        setIsDetailLoading(false);
      }
    },
    []
  );

  // Approve application
  const approveApplication = useCallback(
    async (id: string, reason?: string): Promise<boolean> => {
      setIsActionLoading(true);
      try {
        const response = await AdminService.approveApplication(id, {
          type: 'approve',
          reason,
          notifyUser: true
        });

        if (response.succeeded && response.data.success) {
          toast.success('Application approved successfully');
          
          // Update local state
          const updated = applicationDetail && applicationDetail.id === id
            ? { ...applicationDetail, status: 'approved' as ApplicationStatus }
            : applications.map(app =>
                app.id === id ? { ...app, status: 'approved' as ApplicationStatus } : app
              );

          if (applicationDetail && applicationDetail.id === id) {
            setApplicationDetail(updated as Application);
          } else {
            setApplications(updated as Application[]);
          }

          return true;
        }
        toast.error(response.data?.message || 'Failed to approve application');
        return false;
      } catch (error) {
        console.error('Error approving application:', error);
        toast.error('Error approving application');
        return false;
      } finally {
        setIsActionLoading(false);
      }
    },
    [applicationDetail, applications]
  );

  // Reject application
  const rejectApplication = useCallback(
    async (id: string, reason: string): Promise<boolean> => {
      if (!reason.trim()) {
        toast.error('Please provide a rejection reason');
        return false;
      }

      setIsActionLoading(true);
      try {
        const response = await AdminService.rejectApplication(id, {
          type: 'reject',
          reason,
          notifyUser: true
        });

        if (response.succeeded && response.data.success) {
          toast.success('Application rejected');
          
          // Update local state
          const updated = applicationDetail && applicationDetail.id === id
            ? { 
                ...applicationDetail, 
                status: 'rejected' as ApplicationStatus,
                rejectionReason: reason
              }
            : applications.map(app =>
                app.id === id 
                  ? { ...app, status: 'rejected' as ApplicationStatus, rejectionReason: reason }
                  : app
              );

          if (applicationDetail && applicationDetail.id === id) {
            setApplicationDetail(updated as Application);
          } else {
            setApplications(updated as Application[]);
          }

          return true;
        }
        toast.error(response.data?.message || 'Failed to reject application');
        return false;
      } catch (error) {
        console.error('Error rejecting application:', error);
        toast.error('Error rejecting application');
        return false;
      } finally {
        setIsActionLoading(false);
      }
    },
    [applicationDetail, applications]
  );

  // Suspend application
  const suspendApplication = useCallback(
    async (id: string, reason?: string): Promise<boolean> => {
      setIsActionLoading(true);
      try {
        const response = await AdminService.suspendApplication(id, {
          type: 'suspend',
          reason,
          notifyUser: true
        });

        if (response.succeeded && response.data.success) {
          toast.success('Application suspended');
          
          // Update local state
          const updated = applicationDetail && applicationDetail.id === id
            ? { ...applicationDetail, status: 'suspended' as ApplicationStatus }
            : applications.map(app =>
                app.id === id ? { ...app, status: 'suspended' as ApplicationStatus } : app
              );

          if (applicationDetail && applicationDetail.id === id) {
            setApplicationDetail(updated as Application);
          } else {
            setApplications(updated as Application[]);
          }

          return true;
        }
        toast.error(response.data?.message || 'Failed to suspend application');
        return false;
      } catch (error) {
        console.error('Error suspending application:', error);
        toast.error('Error suspending application');
        return false;
      } finally {
        setIsActionLoading(false);
      }
    },
    [applicationDetail, applications]
  );

  // Reactivate application
  const reactivateApplication = useCallback(
    async (id: string, reason?: string): Promise<boolean> => {
      setIsActionLoading(true);
      try {
        const response = await AdminService.reactivateApplication(id, {
          type: 'reactivate',
          reason,
          notifyUser: true
        });

        if (response.succeeded && response.data.success) {
          toast.success('Application reactivated');
          
          // Update local state
          const updated = applicationDetail && applicationDetail.id === id
            ? { ...applicationDetail, status: 'approved' as ApplicationStatus }
            : applications.map(app =>
                app.id === id ? { ...app, status: 'approved' as ApplicationStatus } : app
              );

          if (applicationDetail && applicationDetail.id === id) {
            setApplicationDetail(updated as Application);
          } else {
            setApplications(updated as Application[]);
          }

          return true;
        }
        toast.error(response.data?.message || 'Failed to reactivate application');
        return false;
      } catch (error) {
        console.error('Error reactivating application:', error);
        toast.error('Error reactivating application');
        return false;
      } finally {
        setIsActionLoading(false);
      }
    },
    [applicationDetail, applications]
  );

  // Clear detail view
  const clearDetail = useCallback(() => {
    setApplicationDetail(null);
  }, []);

  return {
    applications,
    applicationDetail,
    statusCounts,
    isLoading,
    isDetailLoading,
    isActionLoading,
    fetchApplications,
    fetchApplicationDetail,
    approveApplication,
    rejectApplication,
    suspendApplication,
    reactivateApplication,
    clearDetail
  };
};
