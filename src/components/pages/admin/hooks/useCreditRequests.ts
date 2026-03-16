import { useState } from 'react';
import { CreditRequest } from '../components/CreditRequestsView';
import { AdminService } from '@/services/adminService';

// Transform API response to CreditRequest format
const transformPurchaseToCreditRequest = (purchase: any): CreditRequest => {
  const amountPaid = purchase.amountPaid || 0;
  const creditsAcquired = purchase.creditsAcquired || 0;
  const creditValue = creditsAcquired > 0 ? amountPaid / creditsAcquired : 0;
  const user = purchase.user || {};
  const servicePlan = purchase.servicePlan || {};

  return {
    id: `REQ_${purchase.purchaseId}`,
    userId: user.userId || `USER_${purchase.purchaseId}`,
    user: {
      firstName: user.firstName || 'User',
      lastName: user.lastName || '',
      email: user.email || `user_${purchase.purchaseId}@resqhub.com`,
    },
    requestType: 'grant',
    serviceType: servicePlan.serviceType || 'rider',
    amount: creditsAcquired,
    creditValue: creditValue,
    reason: purchase.notes || `Credit purchase via ${purchase.paymentMethod || 'unknown'}`,
    status: purchase.status === 'pending_approval' ? 'pending' : 'approved',
    requestedBy: 'system',
    requestedDate: purchase.purchaseDate || new Date().toISOString(),
    userCurrentCredits: 0,
    paymentReference: purchase.paymentReference || '',
    bankVerified: false,
  };
};

// Mock data for credit requests awaiting approval (fallback if API fails)
const mockCreditRequests: CreditRequest[] = [
  {
    id: 'REQ001',
    userId: 'R001',
    user: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    requestType: 'grant',
    serviceType: 'rider',
    amount: 100,
    creditValue: 99.99,
    reason: 'Customer complaint resolution - Delayed pickup',
    status: 'pending',
    requestedBy: 'support@resqhub.com',
    requestedDate: '2025-03-15T10:30:00Z',
    userCurrentCredits: 250,
    paymentReference: 'BANK_TRF_R001_20250315_TX-123456',
    bankVerified: false,
  },
  {
    id: 'REQ002',
    userId: 'S001',
    user: {
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike@example.com',
    },
    requestType: 'deduct',
    serviceType: 'seller',
    amount: 50,
    creditValue: 49.99,
    reason: 'Correction - Unauthorized transaction',
    status: 'pending',
    requestedBy: 'support@resqhub.com',
    requestedDate: '2025-03-15T11:00:00Z',
    userCurrentCredits: 500,
  },
  {
    id: 'REQ003',
    userId: 'R002',
    user: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    },
    requestType: 'grant',
    serviceType: 'rider',
    amount: 50,
    creditValue: 49.99,
    reason: 'Welcome bonus for new rider',
    status: 'pending',
    requestedBy: 'marketing@resqhub.com',
    requestedDate: '2025-03-15T12:00:00Z',
    userCurrentCredits: 100,
    paymentReference: 'BANK_TRF_R002_20250315_TX-789012',
    bankVerified: false,
  },
  {
    id: 'REQ004',
    userId: 'R001',
    user: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    requestType: 'grant',
    serviceType: 'rider',
    amount: 75,
    creditValue: 74.99,
    reason: 'Referral bonus - New user signup',
    status: 'approved',
    requestedBy: 'admin@resqhub.com',
    requestedDate: '2025-03-14T09:00:00Z',
    approvalDate: '2025-03-14T09:15:00Z',
    approvedBy: 'admin@resqhub.com',
    userCurrentCredits: 250,
    paymentReference: 'BANK_TRF_R001_20250314_TX-345678',
    bankVerified: true,
  },
  {
    id: 'REQ005',
    userId: 'S001',
    user: {
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike@example.com',
    },
    requestType: 'deduct',
    serviceType: 'seller',
    amount: 25,
    creditValue: 24.99,
    reason: 'Policy violation - Terms breach',
    status: 'rejected',
    requestedBy: 'moderation@resqhub.com',
    requestedDate: '2025-03-14T14:30:00Z',
    approvalDate: '2025-03-14T15:00:00Z',
    approvedBy: 'admin@resqhub.com',
    userCurrentCredits: 500,
  },
];

export const useCreditRequests = (serviceType: string) => {
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Manual fetch function - called when tab is navigated to
  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Fetch pending purchases from API
      const response = await AdminService.getPendingCreditPurchases(1, 20);

      if (response.succeeded && response.data?.purchases) {
        // Transform API response to CreditRequest format
        const transformedRequests = response.data.purchases.map((purchase: any) =>
          transformPurchaseToCreditRequest(purchase)
        );
        setRequests(transformedRequests);
        setHasLoadedOnce(true);
      } else {
        // Fallback to mock data if API doesn't return expected structure
        const filteredRequests = mockCreditRequests.filter(
          (req) => req.serviceType === serviceType || serviceType === 'all'
        );
        setRequests(filteredRequests);
        setHasLoadedOnce(true);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching credit requests:', err);
      // Fallback to mock data on error
      const filteredRequests = mockCreditRequests.filter(
        (req) => req.serviceType === serviceType || serviceType === 'all'
      );
      setRequests(filteredRequests);
      setHasLoadedOnce(true);
      setError('Using cached data. Failed to fetch latest requests from server.');
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    setApproving(requestId);
    try {
      // Simulate API response processing
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update the request status
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: 'approved',
                approvalDate: new Date().toISOString(),
                approvedBy: 'admin@resqhub.com', // Replace with actual user
              }
            : req
        )
      );

      setError(null);
      return { success: true, message: 'Request approved successfully' };
    } catch (err) {
      setError(`Failed to approve request: ${err}`);
      console.error('Error approving request:', err);
      return { success: false, message: 'Failed to approve request' };
    } finally {
      setApproving(null);
    }
  };

  const rejectRequest = async (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    setApproving(requestId);
    try {
      // Simulate API response processing
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update the request status
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: 'rejected',
                approvalDate: new Date().toISOString(),
                approvedBy: 'admin@resqhub.com', // Replace with actual user
              }
            : req
        )
      );

      setError(null);
      return { success: true, message: 'Request rejected successfully' };
    } catch (err) {
      setError(`Failed to reject request: ${err}`);
      console.error('Error rejecting request:', err);
      return { success: false, message: 'Failed to reject request' };
    } finally {
      setApproving(null);
    }
  };

  return {
    requests,
    loading,
    error,
    approving,
    hasLoadedOnce,
    fetchRequests,
    approveRequest,
    rejectRequest,
  };
};
