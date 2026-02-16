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

  async getCommunityPosts(id: string, type?: string, status?: string | number): Promise<CommunityPost[]> {
    try {
      const queryParams = new URLSearchParams();
      if (type) queryParams.append('type', type);
      if (status !== undefined) queryParams.append('ReportStatus', String(status));
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await api.get<any>(`/reports/communities/${id}/posts${query}`);
      
      // Handle various response structures: response.data.data.data, response.data.data, response.data.items, etc.
      const rawData = response.data;
      let items: any[] = [];
      
      if (rawData?.data?.data && Array.isArray(rawData.data.data)) {
        items = rawData.data.data;
      } else if (rawData?.data && Array.isArray(rawData.data)) {
        items = rawData.data;
      } else if (rawData?.items && Array.isArray(rawData.items)) {
        items = rawData.items;
      } else if (Array.isArray(rawData)) {
        items = rawData;
      } else if (rawData?.data && rawData.data.items) {
        items = rawData.data.items;
      }
      
      return items;
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
      // response.data.data contains { members: [], page: 1, memberCounts: { ... } }
      const response = await api.get<any>(`/communities/${id}/members`);
      const data = response.data?.data;
      
      if (data?.members && Array.isArray(data.members)) {
        // Map API fields (userId, userName) to CommunityMember type (id, username)
        // API returns roles as array, so select the primary role (admin > moderator > member)
        return data.members.map((m: any) => {
          let role: 'admin' | 'moderator' | 'member' = 'member';
          const rolesArray = m.roles || (m.role ? [m.role] : []);
          
          if (Array.isArray(rolesArray)) {
            if (rolesArray.includes('admin')) {
              role = 'admin';
            } else if (rolesArray.includes('moderator')) {
              role = 'moderator';
            } else if (rolesArray.includes('member')) {
              role = 'member';
            }
          } else if (m.role) {
            // Fallback for legacy API response format
            role = m.role as any;
          }
          
          return {
            id: m.userId,
            name: m.userFullName || m.userName,
            username: m.userName,
            role: role,
            roles: rolesArray, // Include all roles
            joinedAt: m.joinedDate,
            profilePicture: m.profilePictureUrl,
            isSeller: m.isSeller,
            isVolunteer: m.isVolunteer || false, // Add volunteer flag
            memberIsApproved: m.memberIsApproved
          };
        });
      }
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching community members:', error);
      return [];
    }
  },

  async getCommunityVolunteers(communityId: string, pageSize: number = 10, page: number = 1): Promise<{ members: CommunityMember[]; totalCount: number; totalPages: number }> {
    try {
      // Fetch volunteers using role filter
      const response = await api.get<any>(
        `/community-members/community/${communityId}?role=volunteer&pageSize=${pageSize}&page=${page}`
      );
      const data = response.data?.data;
      
      if (data?.members && Array.isArray(data.members)) {
        // Map API fields to CommunityMember type
        const mapped = data.members.map((m: any) => {
          let role: 'admin' | 'moderator' | 'member' = 'member';
          const rolesArray = m.roles || (m.role ? [m.role] : []);
          
          if (Array.isArray(rolesArray)) {
            if (rolesArray.includes('admin')) {
              role = 'admin';
            } else if (rolesArray.includes('moderator')) {
              role = 'moderator';
            } else if (rolesArray.includes('member')) {
              role = 'member';
            }
          } else if (m.role) {
            role = m.role as any;
          }
          
          return {
            id: m.userId,
            name: m.userFullName || m.userName,
            username: m.userName,
            role: role,
            roles: rolesArray,
            joinedAt: m.joinedDate,
            profilePicture: m.profilePictureUrl,
            isSeller: m.isSeller,
            isVolunteer: true, // Mark as volunteer since we fetched from volunteer endpoint
            memberIsApproved: m.memberIsApproved || m.isApproved
          };
        });
        
        return {
          members: mapped,
          totalCount: data.totalCount || 0,
          totalPages: data.totalPages || 1
        };
      }
      
      return { members: [], totalCount: 0, totalPages: 1 };
    } catch (error) {
      console.error('Error fetching community volunteers:', error);
      return { members: [], totalCount: 0, totalPages: 1 };
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
      const response = await api.get<{ data: Community[] }>('/admin/communities');
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching pending communities:', error);
      return [];
    }
  },

  async updateStatus(id: string, status: 'approved' | 'denied', reason?: string): Promise<boolean> {
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

  async approveJoinRequest(communityId: string, requestId: number, userId: string): Promise<boolean> {
    try {
      await api.patch(`/community-members/communities/${communityId}/members/${userId}/approve`);
      return true;
    } catch (error) {
      console.error('Error approving join request:', error);
      return false;
    }
  },

  async rejectJoinRequest(communityId: string, requestId: number, userId: string): Promise<boolean> {
    try {
      await api.patch(`/community-members/communities/${communityId}/members/${userId}/reject`);
      return true;
    } catch (error) {
      console.error('Error rejecting join request:', error);
      return false;
    }
  },

  async createAnnouncement(payload: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    reportUrl?: string;
    category: string;
    type: 'announcement' | 'news' | 'events';
    location: string;
    contactInfo: string;
    communityId: number | string;
    privacy?: 'community' | 'internal';
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      console.log('Creating announcement with payload:', payload);
      
      const response = await api.post('/communities/report', payload);
      console.log('Announcement created successfully:', response.data);
      
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error: any) {
      console.error('Error creating community announcement:', error);
      return {
        success: false,
        message: error?.response?.data?.message || error?.message || 'Failed to create announcement'
      };
    }
  },

  async getCommunityReports(filters?: {
    type?: 'announcement' | 'news' | 'events';
    category?: string;
    communityId?: number | string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<CommunityPost[]> {
    try {
      const query = new URLSearchParams();
      if (filters?.type) query.append('type', filters.type);
      if (filters?.category) query.append('category', filters.category);
      if (filters?.communityId) query.append('communityId', String(filters.communityId));
      if (filters?.startDate) query.append('startDate', filters.startDate);
      if (filters?.endDate) query.append('endDate', filters.endDate);
      if (filters?.page) query.append('page', String(filters.page));
      if (filters?.pageSize) query.append('pageSize', String(filters.pageSize));

      const url = `/communities/reports${query.toString() ? '?' + query.toString() : ''}`;
      const response = await api.get<any>(url);

      // Extract data from response - handle various response structures
      const rawData = response.data;
      let reports: CommunityPost[] = [];

      // Handle structure: { data: { items: [...], total: N } }
      if (rawData?.data?.items && Array.isArray(rawData.data.items)) {
        reports = rawData.data.items;
      } else if (rawData?.data?.data && Array.isArray(rawData.data.data)) {
        reports = rawData.data.data;
      } else if (rawData?.data && Array.isArray(rawData.data)) {
        reports = rawData.data;
      } else if (Array.isArray(rawData)) {
        reports = rawData;
      }

      return reports;
    } catch (error) {
      console.error('Error fetching community reports:', error);
      return [];
    }
  },

  async getCalendarEvents(filters?: {
    communityId?: number | string;
    category?: string;
    fromDate?: string; // Format: 1-1-2026
    toDate?: string; // Format: 12-1-2026
    page?: number;
    pageSize?: number;
  }): Promise<any[]> {
    try {
      const query = new URLSearchParams();
      if (filters?.communityId) query.append('communityId', String(filters.communityId));
      if (filters?.category) query.append('category', filters.category);
      if (filters?.fromDate) query.append('fromDate', filters.fromDate);
      if (filters?.toDate) query.append('toDate', filters.toDate);
      if (filters?.page) query.append('page', String(filters.page));
      if (filters?.pageSize) query.append('pageSize', String(filters.pageSize));

      const url = `/communities/calendar${query.toString() ? '?' + query.toString() : ''}`;
      const response = await api.get<any>(url);

      // Extract data from response - handle the items array from the backend
      const rawData = response.data;
      let events: any[] = [];

      // Handle response structure: { data: { items: [...], total, page, pageSize } }
      if (rawData?.data?.items && Array.isArray(rawData.data.items)) {
        events = rawData.data.items;
      } else if (rawData?.data?.data && Array.isArray(rawData.data.data)) {
        events = rawData.data.data;
      } else if (rawData?.data && Array.isArray(rawData.data)) {
        events = rawData.data;
      } else if (Array.isArray(rawData)) {
        events = rawData;
      }

      return events;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  },

  async createCalendarEvents(payload: {
    communityId: number | string;
    events: Array<{
      title: string;
      description: string;
      category: string;
      fromDate: string; // ISO 8601 date format
      toDate?: string;  // ISO 8601 date format (toDate for backward compatibility)
      endDate?: string; // ISO 8601 date format (endDate for consistency)
      time?: string;
      location: string;
      privacy?: 'community' | 'internal';
    }>;
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      // Normalize endDate/toDate field names - accept both for flexibility
      const normalizedPayload = {
        ...payload,
        events: payload.events.map(event => ({
          title: event.title,
          description: event.description,
          category: event.category,
          fromDate: event.fromDate,
          endDate: event.endDate || event.toDate, // Use endDate as primary, fall back to toDate
          time: event.time,
          location: event.location,
          privacy: event.privacy || 'community',
        }))
      };
      
      console.log('Creating calendar events with payload:', normalizedPayload);
      
      const response = await api.post('/communities/calendar', normalizedPayload);
      console.log('Calendar events created successfully:', response.data);
      
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error: any) {
      console.error('Error creating calendar events:', error);
      return {
        success: false,
        message: error?.response?.data?.message || error?.message || 'Failed to create calendar events'
      };
    }
  },

  async getUpcomingReports(type?: 'news' | 'announcement' | 'event'): Promise<{
    today: any[];
    tomorrow: any[];
    totalToday: number;
    totalTomorrow: number;
  }> {
    try {
      const query = new URLSearchParams();
      if (type) query.append('type', type);

      const url = `/communities/reports/upcoming${query.toString() ? '?' + query.toString() : ''}`;
      const response = await api.get<any>(url);

      // Extract data from response structure
      const rawData = response.data;
      
      if (rawData?.data) {
        return {
          today: rawData.data.today || [],
          tomorrow: rawData.data.tomorrow || [],
          totalToday: rawData.data.totalToday || 0,
          totalTomorrow: rawData.data.totalTomorrow || 0
        };
      }

      return {
        today: [],
        tomorrow: [],
        totalToday: 0,
        totalTomorrow: 0
      };
    } catch (error) {
      console.error('Error fetching upcoming reports:', error);
      return {
        today: [],
        tomorrow: [],
        totalToday: 0,
        totalTomorrow: 0
      };
    }
  },

  async getTodayActivities(): Promise<any[]> {
    try {
      const response = await api.get<any>('/communities/my-activities/today');
      
      // Extract activities from new unified endpoint
      const rawData = response.data?.data?.activities || {};
      
      // Flatten all activities into single array maintaining type
      const allActivities = [
        ...(rawData.announcements || []).map((item: any) => ({
          ...item,
          type: 'announcement'
        })),
        ...(rawData.news || []).map((item: any) => ({
          ...item,
          type: 'news'
        })),
        ...(rawData.events || []).map((item: any) => ({
          ...item,
          type: 'event'
        }))
      ];

      // Sort by dateCreated (newest first)
      return allActivities.sort((a: any, b: any) => {
        const dateA = new Date(a.dateCreated).getTime();
        const dateB = new Date(b.dateCreated).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error fetching today activities:', error);
      return [];
    }
  },



  async createCommunityEvents(payload: {
    communityId: string | number;
    events: Array<{
      title: string;
      description: string;
      startDate: string;
      endDate: string;
      location: string;
      contactInfo: string;
      category: string;
      imageUrl?: string;
      maxAttendees?: number;
      publishDate: string;
      privacy: 'public' | 'internal';
    }>;
    sendNotifications?: boolean;
    notificationMessage?: string;
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      console.log('Creating community events with payload:', payload);
      
      const response = await api.post('/community-events', payload);
      console.log('Community events created successfully:', response.data);
      
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error: any) {
      console.error('Error creating community events:', error);
      return {
        success: false,
        message: error?.response?.data?.message || error?.message || 'Failed to create events'
      };
    }
  },

  async createCommunityNews(payload: {
    communityId: string | number;
    newsArticles: Array<{
      title: string;
      content: string;
      summary: string;
      category: string;
      author: string;
      imageUrl?: string;
      publishDate: string;
      isFeatured: boolean;
      privacy: 'public' | 'internal';
      sourceUrl?: string;
    }>;
    sendNotifications?: boolean;
    notificationMessage?: string;
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      console.log('Creating community news with payload:', payload);
      
      const response = await api.post('/community-news', payload);
      console.log('Community news created successfully:', response.data);
      
      return {
        success: true,
        data: response.data?.data || response.data
      };
    } catch (error: any) {
      console.error('Error creating community news:', error);
      return {
        success: false,
        message: error?.response?.data?.message || error?.message || 'Failed to create news'
      };
    }
  },

  async addVolunteersToCommunity(
    communityId: string | number,
    userIds: string[]
  ): Promise<boolean> {
    try {
      await api.post('/community-members/volunteers', {
        communityId: Number(communityId),
        userIds,
        isVolunteer: true
      });
      return true;
    } catch (error) {
      console.error('Error adding volunteers to community:', error);
      return false;
    }
  },

  async getMyCommunitiesPage(pageSize: number = 10, page: number = 1): Promise<{ communities: Community[]; totalCount: number; totalPages: number }> {
    try {
      const response = await api.get<any>(`/communities/my-communities?pageSize=${pageSize}&page=${page}`);
      const data = response.data?.data || response.data;
      
      if (data?.communities && Array.isArray(data.communities)) {
        return {
          communities: data.communities,
          totalCount: data.totalCount || 0,
          totalPages: data.totalPages || 1
        };
      }
      
      if (Array.isArray(data)) {
        return {
          communities: data,
          totalCount: data.length || 0,
          totalPages: 1
        };
      }
      
      return { communities: [], totalCount: 0, totalPages: 1 };
    } catch (error) {
      console.error('Error fetching my communities:', error);
      return { communities: [], totalCount: 0, totalPages: 1 };
    }
  },

  async getAllApprovedCommunitiesPage(pageSize: number = 10, page: number = 1): Promise<{ communities: Community[]; totalCount: number; totalPages: number }> {
    try {
      const response = await api.get<any>(`/communities?status=approved&pageSize=${pageSize}&page=${page}`);
      const data = response.data?.data || response.data;
      
      if (data?.communities && Array.isArray(data.communities)) {
        return {
          communities: data.communities,
          totalCount: data.totalCount || 0,
          totalPages: data.totalPages || 1
        };
      }
      
      if (Array.isArray(data)) {
        return {
          communities: data,
          totalCount: data.length || 0,
          totalPages: 1
        };
      }
      
      return { communities: [], totalCount: 0, totalPages: 1 };
    } catch (error) {
      console.error('Error fetching approved communities:', error);
      return { communities: [], totalCount: 0, totalPages: 1 };
    }
  },

  async getTodaysUpdates(): Promise<{
    date: string;
    events: any[];
    totalCount: number;
  }> {
    try {
      const response = await api.get('/community-events/today');
      const data = response.data?.data;
      return {
        date: data?.date || new Date().toISOString().split('T')[0],
        events: Array.isArray(data?.events) ? data.events : [],
        totalCount: data?.totalCount || 0
      };
    } catch (error) {
      console.error('Error fetching today\'s updates:', error);
      return {
        date: new Date().toISOString().split('T')[0],
        events: [],
        totalCount: 0
      };
    }
  }
};
