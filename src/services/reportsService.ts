import api from '../api/client';

export interface LostFoundItem {
  id: number;
  title: string;
  category: string;
  location: string;
  date: string;
  status: 'lost' | 'found' | 'matched';
  reportedBy: string;
  image?: string;
  description?: string;
  contactInfo?: string;
  reward?: string;
  timeReported?: string;
  specificLocation?: string;
  itemColor?: string;
  itemBrand?: string;
  itemSize?: string;
  matchedWith?: number;
}

export const ReportsService = {
  async getReports(params?: { status?: string; page?: number; pageSize?: number }): Promise<LostFoundItem[]> {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.page) query.append('page', String(params.page));
      if (params?.pageSize) query.append('pageSize', String(params.pageSize));
      const url = `/reports${query.toString() ? '?' + query.toString() : ''}`;
      const response = await api.get<{ data: LostFoundItem[] }>(url);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }
};