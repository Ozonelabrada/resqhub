import { useState, useEffect } from 'react';
import { CreditRequest } from '../components/CreditRequestsView';

// Mock data for credit requests awaiting approval
const mockCreditRequests: CreditRequest[] = [
  {
    id: 'REQ001',
    userId: 'R001',
    username: 'johndoe',
    userEmail: 'john@example.com',
    requestType: 'grant',
    serviceType: 'rider',
    amount: 100,
    creditValue: 99.99,
    reason: 'Customer complaint resolution - Delayed pickup',
    status: 'pending',
    requestedBy: 'support@resqhub.com',
    requestedDate: '2025-03-15T10:30:00Z',
    userCurrentCredits: 250,
  },
  {
    id: 'REQ002',
    userId: 'S001',
    username: 'seller_mike',
    userEmail: 'mike@example.com',
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
    username: 'janedoe',
    userEmail: 'jane@example.com',
    requestType: 'grant',
    serviceType: 'rider',
    amount: 50,
    creditValue: 49.99,
    reason: 'Welcome bonus for new rider',
    status: 'pending',
    requestedBy: 'marketing@resqhub.com',
    requestedDate: '2025-03-15T12:00:00Z',
    userCurrentCredits: 100,
  },
  {
    id: 'REQ004',
    userId: 'R001',
    username: 'johndoe',
    userEmail: 'john@example.com',
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
  },
  {
    id: 'REQ005',
    userId: 'S001',
    username: 'seller_mike',
    userEmail: 'mike@example.com',
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

  // Fetch credit requests on component mount
  useEffect(() => {
    fetchRequests();
  }, [serviceType]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Filter by service type if needed
      const filteredRequests = mockCreditRequests.filter(
        (req) => req.serviceType === serviceType || serviceType === 'all'
      );

      setRequests(filteredRequests);
      setError(null);
    } catch (err) {
      setError('Failed to fetch credit requests');
      console.error('Error fetching credit requests:', err);
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
    fetchRequests,
    approveRequest,
    rejectRequest,
  };
};
