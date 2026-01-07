import api from '../api/client';
import publicApi from '../api/publicClient';
import type { Community, CommunityPost, CommunityMember } from '../types/community';

export const CommunityService = {
  async getCommunities(): Promise<Community[]> {
    try {
      const response = await publicApi.get<{ data: Community[] }>('/communities');
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching communities:', error);
      return [];
    }
  },

  async getCommunityById(id: string): Promise<Community | null> {
    try {
      const response = await publicApi.get<{ data: Community }>(`/communities/${id}`);
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
      const response = await publicApi.get<{ data: CommunityPost[] }>(`/communities/${id}/posts${query}`);
      const data = response.data?.data;
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
      const response = await publicApi.get<{ data: CommunityMember[] }>(`/communities/${id}/members`);
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching community members:', error);
      return [];
    }
  }
};
