import { useState, useEffect, useCallback } from 'react';
import { CommunityService } from '../services/communityService';
import type { Community, CommunityPost, CommunityMember } from '../types/community';
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
      if (updatedCommunity && user) {
        const currentUserMember = membersData.find((m: CommunityMember) => String(m.id) === String(user.id));
        const isAdmin = currentUserMember?.role === 'admin' || updatedCommunity.isAdmin;
        const isMember = !!currentUserMember || updatedCommunity.isMember;
        
        updatedCommunity = {
          ...updatedCommunity,
          isAdmin,
          isMember
        };
      }

      setCommunity(updatedCommunity);
      setPosts(Array.isArray(postsData) ? postsData : []);
      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch (err) {
      setError('Failed to fetch community details');
      setPosts([]);
      setMembers([]);
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

  return { community, posts, members, loading, error, join, leave, refresh: fetchDetail };
};
