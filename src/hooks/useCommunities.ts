import { useState, useEffect, useCallback } from 'react';
import { CommunityService } from '../services/communityService';
import type { Community, CommunityPost, CommunityMember } from '../types/community';

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
      setCommunity(communityData);
      setPosts(Array.isArray(postsData) ? postsData : []);
      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch (err) {
      setError('Failed to fetch community details');
      setPosts([]);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

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
