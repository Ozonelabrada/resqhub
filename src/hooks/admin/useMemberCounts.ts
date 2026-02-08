import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/api/client';

interface MemberCounts {
  allResidents: number;
  pendingRequests: number;
  volunteers: number;
  sellers: number;
}

interface UseMemberCountsReturn {
  memberCounts: MemberCounts;
  fetchMemberCounts: (communityId: string | number) => Promise<void>;
}

/**
 * Custom hook to fetch and manage member count data from API
 * Provides accurate counts for all member categories
 */
export const useMemberCounts = (): UseMemberCountsReturn => {
  const [memberCounts, setMemberCounts] = useState<MemberCounts>({
    allResidents: 0,
    pendingRequests: 0,
    volunteers: 0,
    sellers: 0,
  });

  const fetchMemberCounts = useCallback(
    async (communityId: string | number): Promise<void> => {
      try {
        const response = await api.get(`/communities/${communityId}/members`, {
          params: { page: 1, pageSize: 1 },
        });
        if (response.data?.succeeded && response.data.data.memberCounts) {
          setMemberCounts(response.data.data.memberCounts);
        }
      } catch (error) {
        console.error('Error fetching member counts:', error);
      }
    },
    []
  );

  return {
    memberCounts,
    fetchMemberCounts,
  };
};
