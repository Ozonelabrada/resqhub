import api from '../api/client';

export interface CreateStoreRequest {
  name: string;
  description: string;
  ownerId: string;
  bannerUrl: string;
  contactInfo: string;
}

export interface ApplyStoreToCommunityRequest {
  storeId: number;
  communityId: number;
  businessPermitUrl: string;
  location: string;
}

export interface UpdateStoreRequest extends Partial<CreateStoreRequest> {}

export interface Store {
  id: number;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  bannerUrl: string;
  isVerified: boolean;
  contactInfo: string;
  itemsCount: number;
  rate: number;
}

export interface StoreResponse {
  succeeded: boolean;
  data: {
    items: Store[];
    totalCount: number;
    page: number;
    pageSize: number;
  };
}

export const StoreService = {
  /**
   * Gets all stores with pagination
   */
  async getStores(page: number = 1, pageSize: number = 10) {
    try {
      const response = await api.get<StoreResponse>(`/Stores?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stores:', error);
      throw error;
    }
  },

  /**
   * Gets a specific store by ID
   */
  async getStoreById(id: number | string) {
    try {
      const response = await api.get<{ data: Store }>(`/Stores/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching store ${id}:`, error);
      throw error;
    }
  },

  /**
   * Gets stores owned by a specific user
   */
  async getStoresByOwner(ownerId: string) {
    try {
      const response = await api.get<{ data: Store[] }>(`/Stores/owner/${ownerId}`);
      // Based on the endpoint pattern, it might return a list directly or in a data property
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching stores for owner ${ownerId}:`, error);
      return [];
    }
  },

  /**
   * Creates a global store profile
   */
  async createStore(payload: CreateStoreRequest) {
    try {
      const response = await api.post('/Stores', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating store:', error);
      throw error;
    }
  },

  /**
   * Updates an existing store
   */
  async updateStore(id: number | string, payload: UpdateStoreRequest) {
    try {
      const response = await api.put(`/Stores/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating store ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a store
   */
  async deleteStore(id: number | string) {
    try {
      const response = await api.delete(`/Stores/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting store ${id}:`, error);
      throw error;
    }
  },

  /**
   * Applies a store to a specific community
   */
  async applyStoreToCommunity(communityId: string | number, payload: ApplyStoreToCommunityRequest) {
    try {
      const response = await api.post(`/communities/${communityId}/stores`, payload);
      return response.data;
    } catch (error) {
      console.error('Error applying store to community:', error);
      throw error;
    }
  }
};
