import { useState, useEffect, useCallback } from 'react';
import { CommunityService } from '../services/communityService';
import type { Community, CommunityPost, CommunityMember, JoinRequest } from '../types/community';
import { useAuth } from '../context/AuthContext';

export const useCommunities = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CommunityService.getCommunities();
      setCommunities(data);
    } catch (err) {
      setError('Failed to fetch communities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  return { communities, loading, error, refresh: fetchCommunities };
};

export const useCommunityDetail = (id: string | undefined) => {
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [communityData, postsData, membersData] = await Promise.all([
        CommunityService.getCommunityById(id),
        CommunityService.getCommunityPosts(id),
        CommunityService.getCommunityMembers ? CommunityService.getCommunityMembers(id) : Promise.resolve([])
      ]);

      // Calculate isAdmin if not provided by backend community object
      let updatedCommunity = communityData;
      let requestsData: JoinRequest[] = [];
      
      if (updatedCommunity && user) {
        const currentUserMember = membersData.find((m: CommunityMember) => String(m.id) === String(user.id));
        const isAdmin = currentUserMember?.role === 'admin' || updatedCommunity.isAdmin;
        const isModerator = currentUserMember?.role === 'moderator';
        const isMember = !!currentUserMember || updatedCommunity.isMember;
        
        updatedCommunity = {
          ...updatedCommunity,
          isAdmin,
          isModerator,
          isMember
        };

        // If admin or moderator, fetch join requests
        if (isAdmin || isModerator) {
          try {
            requestsData = await CommunityService.getJoinRequests(id);
          } catch (reqErr) {
            console.error('Failed to fetch join requests:', reqErr);
          }
        }
      }

      setCommunity(updatedCommunity);
      setPosts(Array.isArray(postsData) ? postsData : []);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setJoinRequests(requestsData);
    } catch (err) {
      setError('Failed to fetch community details');
      setPosts([]);
      setMembers([]);
      setJoinRequests([]);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const join = async () => {
    if (!id) return false;
    const success = await CommunityService.joinCommunity(id);
    if (success) fetchDetail();
    return success;
  };

  const leave = async () => {
    if (!id) return false;
    const success = await CommunityService.leaveCommunity(id);
    if (success) fetchDetail();
    return success;
  };

  const approveRequest = async (requestId: number) => {
    if (!id) return false;
    const success = await CommunityService.approveJoinRequest(id, requestId);
    if (success) fetchDetail();
    return success;
  };

  const rejectRequest = async (requestId: number) => {
    if (!id) return false;
    const success = await CommunityService.rejectJoinRequest(id, requestId);
    if (success) fetchDetail();
    return success;
  };

  return { 
    community, 
    posts, 
    members, 
    joinRequests, 
    loading, 
    error, 
    join, 
    leave, 
    approveRequest,
    rejectRequest,
    refresh: fetchDetail 
  };
};
