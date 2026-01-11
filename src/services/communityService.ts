import api from '../api/client';
import type { Community, CommunityPost, CommunityMember, JoinRequest } from '../types/community';

export const CommunityService = {
  async getCommunities(): Promise<Community[]> {
    try {
      const response = await api.get<{ data: { communities: Community[] } }>('/communities');
      const data = response.data?.data?.communities;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching communities:', error);
      return [];
    }
  },

  async searchCommunities(name: string): Promise<Community[]> {
    try {
      const response = await api.get<{ data: { communities: Community[] } }>(`/communities?search=${encodeURIComponent(name)}`);
      const data = response.data?.data?.communities;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error searching communities:', error);
      return [];
    }
  },

  async getCommunityById(id: string): Promise<Community | null> {
    try {
      const response = await api.get<{ data: Community }>(`/communities/${id}`);
      return response.data?.data || null;
    } catch (error) {
      console.error('Error fetching community details:', error);
      return null;
    }
  },

  async joinCommunity(id: string): Promise<boolean> {
    try {
      await api.post(`/communities/${id}/join`);
      return true;
    } catch (error) {
      console.error('Error joining community:', error);
      return false;
    }
  },

  async leaveCommunity(id: string): Promise<boolean> {
    try {
      await api.post(`/communities/${id}/leave`);
      return true;
    } catch (error) {
      console.error('Error leaving community:', error);
      return false;
    }
  },

  async getCommunityPosts(id: string, type?: string): Promise<CommunityPost[]> {
    try {
      const query = type ? `?type=${type}` : '';
      const response = await api.get<{ data: { data: CommunityPost[] } }>(`/reports/communities/${id}/posts${query}`);
      const data = response.data?.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching community posts:', error);
      return [];
    }
  },

  async createPost(communityId: string, payload: Partial<CommunityPost>): Promise<CommunityPost | null> {
    try {
      const response = await api.post<{ data: CommunityPost }>(`/communities/${communityId}/posts`, payload);
      return response.data?.data || null;
    } catch (error) {
      console.error('Error creating community post:', error);
      return null;
    }
  },

  async getCommunityMembers(id: string): Promise<CommunityMember[]> {
    try {
      // response.data.data contains { members: [], page: 1, ... }
      const response = await api.get<any>(`/communities/${id}/members`);
      const data = response.data?.data;
      
      if (data?.members && Array.isArray(data.members)) {
        // Map API fields (userId, userName) to CommunityMember type (id, username)
        return data.members.map((m: any) => ({
          id: m.userId,
          name: m.userFullName || m.userName,
          username: m.userName,
          role: m.role,
          joinedAt: m.joinedDate,
          profilePicture: m.profilePictureUrl
        }));
      }
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching community members:', error);
      return [];
    }
  },

  async updateCommunity(id: string, payload: Partial<Community>): Promise<Community | null> {
    try {
      const response = await api.put<{ data: Community }>(`/communities/${id}`, payload);
      return response.data?.data || null;
    } catch (error) {
      console.error('Error updating community:', error);
      return null;
    }
  },

  async submitForReview(payload: Partial<Community>): Promise<Community | null> {
    try {
      const response = await api.post<{ data: Community }>('/communities', payload);
      return response.data?.data || null;
    } catch (error) {
      console.error('Error submitting community for review:', error);
      return null;
    }
  },

  async getPendingCommunities(): Promise<Community[]> {
    try {
      const response = await api.get<{ data: Community[] }>('/admin/communities/pending');
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching pending communities:', error);
      return [];
    }
  },

  async updateStatus(id: string, status: 'approved' | 'rejected', reason?: string): Promise<boolean> {
    try {
      await api.patch(`/admin/communities/${id}/status`, { status, reason });
      return true;
    } catch (error) {
      console.error('Error updating community status:', error);
      return false;
    }
  },

  async inviteMembers(communityId: string, userIds: string[]): Promise<boolean> {
    try {
      await api.post(`/communities/${communityId}/invite`, { userIds });
      return true;
    } catch (error) {
      console.error('Error inviting members:', error);
      return false;
    }
  },

  async getJoinRequests(id: string): Promise<JoinRequest[]> {
    try {
      const response = await api.get<{ data: JoinRequest[] }>(`/communities/${id}/join-requests`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching join requests:', error);
      return [];
    }
  },

  async approveJoinRequest(communityId: string, requestId: number): Promise<boolean> {
    try {
      await api.patch(`/communities/${communityId}/join-requests/${requestId}/approve`);
      return true;
    } catch (error) {
      console.error('Error approving join request:', error);
      return false;
    }
  },

  async rejectJoinRequest(communityId: string, requestId: number): Promise<boolean> {
    try {
      await api.patch(`/communities/${communityId}/join-requests/${requestId}/reject`);
      return true;
    } catch (error) {
      console.error('Error rejecting join request:', error);
      return false;
    }
  }
};
