import api from '../api/client';
import { ENDPOINTS } from '../api/endpoint';
import type {
  Announcement,
  CreateAnnouncementRequest,
  AnnouncementListParams,
  AnnouncementListResponse,
} from '../types/admin';

export class AnnouncementsService {
  /**
   * Get active announcements (for all users, with optional audience filter)
   * Fallback endpoint for offline users
   */
  static async getActiveAnnouncements(params?: { targetAudience?: string }): Promise<Announcement[]> {
    try {
      const response = await api.get(ENDPOINTS.ANNOUNCEMENTS.ACTIVE, { params });
      const data = response.data.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch active announcements:', error);
      throw error;
    }
  }

  /**
   * Create a new announcement (admin and community admins)
   */
  static async createAnnouncement(data: CreateAnnouncementRequest): Promise<Announcement> {
    try {
      const response = await api.post(ENDPOINTS.ANNOUNCEMENTS.CREATE, data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to create announcement:', error);
      throw error;
    }
  }

  /**
   * Update an announcement
   */
  static async updateAnnouncement(
    id: string,
    data: Partial<CreateAnnouncementRequest>
  ): Promise<Announcement> {
    try {
      const response = await api.put(ENDPOINTS.ANNOUNCEMENTS.UPDATE(id), data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to update announcement:', error);
      throw error;
    }
  }

  /**
   * Delete an announcement
   */
  static async deleteAnnouncement(id: string): Promise<void> {
    try {
      await api.delete(ENDPOINTS.ANNOUNCEMENTS.DELETE(id));
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      throw error;
    }
  }
}

export default AnnouncementsService;
