import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCommunities } from '@/hooks/useCommunities';
import { Card, Button, Spinner, Input, Badge } from '@/components/ui';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { CommunityDetailModal } from '@/components/modals';
import { 
  Search, 
  Plus, 
  MapPin, 
  ArrowRight, 
  UserPlus, 
  ChevronRight, 
  Package, 
  Store as StoreIcon,
  ArrowLeft,
  Info,
  CheckCircle2,
  Trash2,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  Edit3,
  Users,
  Upload,
  X,
  UtensilsCrossed,
  Bike,
  Wrench,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import { CommunityService, StoreService } from '@/services';
import { uploadImageToCloudinary } from '@/services/cloudinaryService';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { Community } from '@/types/community';

interface UserStore {
  id: string | number;
  name: string;
  description: string;
  bannerImage: string;
  avatar: string;
  contactInfo?: string;
  category?: 'food' | 'rider' | 'services';
  communitiesJoined: string[]; // IDs of communities this store is active in
  itemsCount: number;
  isVerified?: boolean;
}

// Helper function to safely check if user is a member
const isCommunityMember = (community: Community): boolean => {
  // Handle boolean, string, null, undefined values
  if (typeof community.isMember === 'boolean') {
    return community.isMember;
  }
  if (typeof community.isMember === 'string') {
    return community.isMember.toLowerCase() === 'true';
  }
  return false;
};

// Helper function to check if member is approved
const isMemberApproved = (community: Community): boolean => {
  // Use currentUserIsApproved from API response if available, fall back to memberIsApproved
  return community.currentUserIsApproved === true || community.memberIsApproved === true;
};

export const CommunitiesContainer: React.FC<{ initialTab?: 'my-communities' | 'all-communities' }> = ({ initialTab = 'my-communities' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { communities: hookCommunities, loading: communitiesLoading, refresh } = useCommunities();
  const { isAuthenticated, openLoginModal, user } = useAuth();
  
  // Local state for communities (to handle search results)
  const [communities, setCommunities] = useState<Community[]>([]);
  const [view, setView] = useState<'list' | 'store-application'>('list');
  const [communitiesTab, setCommunitiesTab] = useState<'my-communities' | 'all-communities'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [joiningId, setJoiningId] = useState<string | number | null>(null);
  const [selectedCommunityForModal, setSelectedCommunityForModal] = useState<Community | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [myCommunitiesData, setMyCommunitiesData] = useState<Community[]>([]);
  const [allApprovedCommunities, setAllApprovedCommunities] = useState<Community[]>([]);
  const [myCommunitiesLoading, setMyCommunitiesLoading] = useState(false);
  const [allCommunitiesLoading, setAllCommunitiesLoading] = useState(false);
  // Removed trade-market state
  // const [communityItems, setCommunityItems] = useState<any[]>([]);
  // const [communityItemsLoading, setCommunityItemsLoading] = useState(false);

  const joinedCommunities = communities.filter(c => c.isMember);

  // Removed trade-market tab - no longer needed
  // Fetch community items when tab changes to trade-market - REMOVED
  // useEffect(() => {
  //   const fetchCommunityItems = async () => {
  //     if (communitiesTab !== 'trade-market' || !isAuthenticated) return;
  //     
  //     setCommunityItemsLoading(true);
  //     try {
  //       // For now, show placeholder/empty items from user's communities
  //       // This will be expanded when item listings API is available
  //       setCommunityItems([]);
  //     } catch (error) {
  //       console.error('Error fetching community items:', error);
  //       setCommunityItems([]);
  //     } finally {
  //       setCommunityItemsLoading(false);
  //     }
  //   };

  //   fetchCommunityItems();
  // }, [communitiesTab, isAuthenticated]);

  // Store Management State
  const [myStores, setMyStores] = useState<UserStore[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [showCreateStoreForm, setShowCreateStoreForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | number | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | number | null>(null);

  const [newStoreData, setNewStoreData] = useState({
    name: '',
    description: '',
    bannerImage: '',
    avatar: '',
    contactInfo: '',
    category: '' as 'food' | 'rider' | 'services' | ''
  });
  const [bannerUploadingId, setBannerUploadingId] = useState<string | number | null>(null);
  const [profileUploadingId, setProfileUploadingId] = useState<string | number | null>(null);

  // Application State
  const [applyingStoreId, setApplyingStoreId] = useState<string | number | null>(null);
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([]);
  const [applicationDataMap, setApplicationDataMap] = useState<Record<string, { businessPermitUrl: string, location: string, permitFileName?: string }>>({});
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  // Apply to Community from Communities List State


  const fetchUserStores = useCallback(async () => {
    if (!user?.id) return;
    
    setStoresLoading(true);
    try {
      const stores = await StoreService.getStoresByOwner(String(user.id));
      // Map API Store to UserStore interface
      const mappedStores: UserStore[] = stores.map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        bannerImage: s.bannerUrl || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
        avatar: s.avatarUrl || `https://i.pravatar.cc/150?u=${s.name}`,
        contactInfo: s.contactInfo,
        category: s.category,
        communitiesJoined: s.communitiesJoined || [], // Handle if API provides this
        itemsCount: s.itemsCount || 0,
        isVerified: s.isVerified
      }));
      setMyStores(mappedStores);
    } catch (error) {
      console.error('Error fetching user stores:', error);
      toast.error('Could not load your stores');
    } finally {
      setStoresLoading(false);
    }
  }, [user?.id]);

  // Initialize local communities state with hook data
  useEffect(() => {
    if (hookCommunities.length > 0 && communities.length === 0) {
      setCommunities(hookCommunities);
      console.log('🔍 Communities loaded:', hookCommunities.map(c => ({ id: c.id, name: c.name, isMember: c.isMember, memberIsApproved: c.memberIsApproved, status: c.status })));
      setLoading(false);
    }
  }, [hookCommunities, communities.length]);

  // Fetch user stores when entering store-application view
  useEffect(() => {
    if (view === 'store-application') {
      fetchUserStores();
    }
  }, [view, fetchUserStores]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch my communities when component mounts or when tab changes to 'my-communities'
  useEffect(() => {
    const fetchMyCommunitiesData = async () => {
      setMyCommunitiesLoading(true);
      try {
        const result = await CommunityService.getMyCommunitiesPage(10, 1);
        setMyCommunitiesData(result.communities);
      } catch (error) {
        console.error('Error fetching my communities:', error);
        setMyCommunitiesData([]);
      } finally {
        setMyCommunitiesLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchMyCommunitiesData();
    }
  }, [isAuthenticated]);

  // Fetch all approved communities
  useEffect(() => {
    const fetchAllApprovedCommunities = async () => {
      setAllCommunitiesLoading(true);
      try {
        const result = await CommunityService.getAllApprovedCommunitiesPage(10, 1);
        setAllApprovedCommunities(result.communities);
      } catch (error) {
        console.error('Error fetching all approved communities:', error);
        setAllApprovedCommunities([]);
      } finally {
        setAllCommunitiesLoading(false);
      }
    };

    fetchAllApprovedCommunities();
  }, []);

  // Search communities when debounced query changes
  useEffect(() => {
    const searchCommunities = async () => {
      if (debouncedSearchQuery.trim()) {
        setLoading(true);
        try {
          const searchResults = await CommunityService.searchCommunities(debouncedSearchQuery.trim());
          console.log('🔍 Search results:', searchResults.map(c => ({ id: c.id, name: c.name, isMember: c.isMember, memberIsApproved: c.memberIsApproved, status: c.status })));
          setCommunities(searchResults);
        } catch (error) {
          console.error('Error searching communities:', error);
          setCommunities([]);
        } finally {
          setLoading(false);
        }
      } else {
        // If no search query, use the hook communities
        setCommunities(hookCommunities);
        setLoading(communitiesLoading);
      }
    };

    searchCommunities();
  }, [debouncedSearchQuery, hookCommunities, communitiesLoading]);

  const handleJoin = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    setJoiningId(id);
    try {
      const success = await CommunityService.joinCommunity(String(id));
      if (success) {
        // Refresh both hook and local state
        await refresh();
        // The useEffect will update local communities when hookCommunities changes
      }
    } finally {
      setJoiningId(null);
    }
  };

  // Filter communities based on visibility rules and current tab:
  // - My Communities: show only communities user is a member of or created
  // - Browse Communities: show all approved communities (buttons will reflect status)
  const filteredCommunities = (() => {
    if (communitiesTab === 'my-communities') {
      // For my-communities, show only communities where user is a member or creator
      return myCommunitiesData.filter(community => {
        const isCreator = user?.id && community.createdBy === user.id;
        const isMember = isCommunityMember(community);
        return isCreator || isMember;
      });
    } else {
      // For all-communities, show all approved communities
      return allApprovedCommunities.filter(community => {
        const isApproved = community.status?.toLowerCase() === 'approved';
        const isSuspended = community.status?.toLowerCase() === 'suspended';
        return isApproved && !isSuspended;
      });
    }
  })();

  const handleCreateStore = async () => {
    if (!newStoreData.name || !user?.id) {
       toast.error('Store name and owner ID are required');
       return;
    }
    
    setIsCreating(true);
    try {
      const payload = {
        name: newStoreData.name,
        description: newStoreData.description,
        ownerId: String(user.id),
        bannerUrl: newStoreData.bannerImage || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
        profileUrl: newStoreData.avatar || `https://i.pravatar.cc/150?u=${newStoreData.name}`,
        contactInfo: newStoreData.contactInfo,
        category: newStoreData.category
      };

      const result = await StoreService.createStore(payload);
      
      const newStore: UserStore = {
        id: result?.id || `store-${Date.now()}`,
        name: newStoreData.name,
        description: newStoreData.description,
        bannerImage: payload.bannerUrl,
        avatar: payload.profileUrl,
        contactInfo: newStoreData.contactInfo,
        category: newStoreData.category as 'food' | 'rider' | 'services' | undefined,
        communitiesJoined: [],
        itemsCount: 0
      };
      
      setMyStores([...myStores, newStore]);
      setNewStoreData({ name: '', description: '', bannerImage: '', avatar: '', contactInfo: '', category: '' });
      setShowCreateStoreForm(false);
      toast.success('Store profile created successfully!');
    } catch (error) {
      toast.error('Failed to create store profile');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStore = async () => {
    if (!editingStoreId) return;
    
    setIsCreating(true);
    try {
      const payload: any = {
        name: newStoreData.name,
        description: newStoreData.description,
        contactInfo: newStoreData.contactInfo,
        category: newStoreData.category
      };

      // Only include bannerUrl if it's been updated (not empty)
      if (newStoreData.bannerImage) {
        payload.bannerUrl = newStoreData.bannerImage;
      }

      // Only include profileUrl if it's been updated (not empty)
      if (newStoreData.avatar) {
        payload.profileUrl = newStoreData.avatar;
      }

      await StoreService.updateStore(editingStoreId, payload);
      
      setMyStores(myStores.map(s => s.id === editingStoreId ? {
        ...s,
        name: newStoreData.name,
        description: newStoreData.description,
        bannerImage: newStoreData.bannerImage || s.bannerImage,
        avatar: newStoreData.avatar || s.avatar,
        contactInfo: newStoreData.contactInfo,
        category: newStoreData.category as 'food' | 'rider' | 'services' | undefined
      } : s));
      
      setNewStoreData({ name: '', description: '', bannerImage: '', avatar: '', contactInfo: '', category: '' });
      setEditingStoreId(null);
      setShowCreateStoreForm(false);
      toast.success('Store updated successfully!');
    } catch (error) {
      toast.error('Failed to update store');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteStore = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this store profile?')) return;
    
    setIsDeletingId(id);
    try {
      await StoreService.deleteStore(id);
      setMyStores(myStores.filter(s => s.id !== id));
      toast.success('Store deleted successfully');
    } catch (error) {
      toast.error('Failed to delete store');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setBannerUploadingId('new');
    
    try {
      const cloudinaryUrl = await uploadImageToCloudinary(file);
      setNewStoreData(prev => ({
        ...prev,
        bannerImage: cloudinaryUrl
      }));
      toast.success('Banner image uploaded successfully!');
    } catch (error) {
      console.error('Banner upload error:', error);
      toast.error('Failed to upload banner image');
    } finally {
      setBannerUploadingId(null);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setProfileUploadingId('new');
    
    try {
      const cloudinaryUrl = await uploadImageToCloudinary(file);
      setNewStoreData(prev => ({
        ...prev,
        avatar: cloudinaryUrl
      }));
      toast.success('Profile picture uploaded successfully!');
    } catch (error) {
      console.error('Profile upload error:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setProfileUploadingId(null);
    }
  };

  const startEditing = (store: UserStore) => {
    setNewStoreData({
      name: store.name,
      description: store.description,
      bannerImage: store.bannerImage,
      avatar: store.avatar,
      contactInfo: store.contactInfo || '',
      category: (store.category as 'food' | 'rider' | 'services' | '') || ''
    });
    setEditingStoreId(store.id);
    setShowCreateStoreForm(true);
  };

  const handleBatchApplyToCommunities = async () => {
    if (!applyingStoreId || selectedCommunityIds.length === 0) return;
    
    // Validate all required fields for each selected community
    const missingFields = selectedCommunityIds.some(cid => {
      const data = applicationDataMap[cid];
      return !data || !data.businessPermitUrl || !data.location;
    });

    if (missingFields) {
      toast.error('All fields (Permit URL & Location) are required for each community application');
      return;
    }

    setIsSubmittingBatch(true);
    let successCount = 0;
    const failedCommunities: string[] = [];

    try {
      await Promise.all(selectedCommunityIds.map(async (cid) => {
        try {
          const data = applicationDataMap[cid];
          const payload = {
            storeId: Number(applyingStoreId),
            communityId: Number(cid),
            businessPermitUrl: data.businessPermitUrl,
            location: data.location
          };
          await StoreService.applyStoreToCommunity(cid, payload);
          successCount++;
        } catch (err) {
          const comm = communities.find(c => String(c.id) === cid);
          failedCommunities.push(comm?.name || cid);
        }
      }));

      // Update local state for successful ones
      setMyStores(myStores.map(store => {
        if (store.id === applyingStoreId) {
          const successfulIds = selectedCommunityIds.filter(id => !failedCommunities.includes(id));
          return { 
            ...store, 
            communitiesJoined: [...store.communitiesJoined, ...successfulIds] 
          };
        }
        return store;
      }));

      if (failedCommunities.length > 0) {
        toast.error(`Failed to apply to: ${failedCommunities.join(', ')}`);
      }
      
      if (successCount > 0) {
        toast.success(`Successfully applied to ${successCount} communities!`);
      }

      // Reset application state
      setApplyingStoreId(null);
      setSelectedCommunityIds([]);
      setApplicationDataMap({});
    } catch (error) {
      toast.error('An error occurred while submitting applications');
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  if (view === 'store-application') {
    return (
      <Card className="flex flex-col h-[calc(100vh-140px)] border-none shadow-xl rounded-lg sm:rounded-[2.5rem] bg-white overflow-hidden animate-in slide-in-from-right duration-500 relative">
        <div className="p-8 border-b border-gray-100 flex items-center gap-6 shrink-0 bg-slate-50/50">
          <Button 
            onClick={() => setView('list')}
            variant="ghost" 
            className="w-12 h-12 rounded-2xl bg-white text-slate-500 hover:bg-slate-100 p-0 shadow-sm"
          >
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <StoreIcon className="text-teal-600" size={28} />
              Seller Hub
            </h2>
            <p className="text-slate-500 text-sm font-medium">Manage your stores and community presence.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="w-full space-y-10">
            {/* Store Application Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="col-span-1 bg-teal-600 rounded-[2rem] p-8 text-white space-y-4 shadow-xl shadow-teal-900/10">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Info size={24} />
                  </div>
                  <h3 className="text-xl font-black uppercase">Sell in Communities</h3>
                  <p className="text-teal-50 text-sm font-medium leading-relaxed">
                    Once you create a store, you can apply to list it in any community where you're a member.
                  </p>
                  <ul className="space-y-2 pt-2">
                    {['Verify your identity', 'List your items', 'Reach local buyers'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-bold">
                        <CheckCircle2 size={14} className="text-white" /> {item}
                      </li>
                    ))}
                  </ul>
               </div>

               <div className="md:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Your Stores</h3>
                    <div className="flex items-center gap-2">
                       <Button 
                          onClick={() => fetchUserStores()}
                          variant="ghost"
                          size="sm"
                          className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 p-0"
                          disabled={storesLoading}
                       >
                          <RefreshCw size={18} className={cn(storesLoading && "animate-spin")} />
                       </Button>
                       {!showCreateStoreForm && (
                         <Button 
                           onClick={() => setShowCreateStoreForm(true)}
                           className="bg-teal-600 hover:bg-teal-700 text-white font-bold h-10 px-4 rounded-xl shadow-lg shadow-teal-100 flex items-center gap-2"
                         >
                           <PlusCircle size={16} /> Create Store
                         </Button>
                       )}
                    </div>
                  </div>

                  {showCreateStoreForm ? (
                    <Card className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 space-y-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-black text-slate-800">
                          {editingStoreId ? 'Edit Store Profile' : 'New Store Profile'}
                        </h4>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setShowCreateStoreForm(false);
                          setEditingStoreId(null);
                          setNewStoreData({ name: '', description: '', bannerImage: '', avatar: '', contactInfo: '', category: '' });
                        }}>Cancel</Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Store Name</label>
                          <Input 
                            value={newStoreData.name}
                            onChange={e => setNewStoreData({...newStoreData, name: e.target.value})}
                            placeholder="e.g. Metro Rescue Supplies" 
                            className="h-12 rounded-xl border-none bg-white shadow-sm"
                          />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Store Category</label>
                          <div className="grid grid-cols-3 gap-3">
                            {/* Food Category */}
                            <button
                              onClick={() => setNewStoreData({...newStoreData, category: 'food'})}
                              className={cn(
                                "relative group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300",
                                newStoreData.category === 'food'
                                  ? "bg-orange-50 border-orange-400 shadow-lg shadow-orange-100"
                                  : "bg-slate-50 border-slate-200 hover:border-orange-300 hover:bg-orange-50/30"
                              )}
                            >
                              <div className={cn(
                                "p-3 rounded-xl transition-all",
                                newStoreData.category === 'food' 
                                  ? "bg-orange-500 text-white scale-110" 
                                  : "bg-orange-100 text-orange-500 group-hover:scale-110"
                              )}>
                                <UtensilsCrossed size={24} strokeWidth={2} />
                              </div>
                              <span className={cn(
                                "text-xs font-black uppercase tracking-widest transition-colors",
                                newStoreData.category === 'food' ? "text-orange-600" : "text-slate-600"
                              )}>
                                Food
                              </span>
                              {newStoreData.category === 'food' && (
                                <div className="absolute top-2 right-2 bg-orange-500 text-white p-1 rounded-full">
                                  <CheckCircle2 size={14} strokeWidth={3} />
                                </div>
                              )}
                            </button>

                            {/* Rider Category */}
                            <button
                              onClick={() => setNewStoreData({...newStoreData, category: 'rider'})}
                              className={cn(
                                "relative group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300",
                                newStoreData.category === 'rider'
                                  ? "bg-blue-50 border-blue-400 shadow-lg shadow-blue-100"
                                  : "bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30"
                              )}
                            >
                              <div className={cn(
                                "p-3 rounded-xl transition-all",
                                newStoreData.category === 'rider' 
                                  ? "bg-blue-500 text-white scale-110" 
                                  : "bg-blue-100 text-blue-500 group-hover:scale-110"
                              )}>
                                <Bike size={24} strokeWidth={2} />
                              </div>
                              <span className={cn(
                                "text-xs font-black uppercase tracking-widest transition-colors",
                                newStoreData.category === 'rider' ? "text-blue-600" : "text-slate-600"
                              )}>
                                Rider
                              </span>
                              {newStoreData.category === 'rider' && (
                                <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
                                  <CheckCircle2 size={14} strokeWidth={3} />
                                </div>
                              )}
                            </button>

                            {/* Services Category */}
                            <button
                              onClick={() => setNewStoreData({...newStoreData, category: 'services'})}
                              className={cn(
                                "relative group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300",
                                newStoreData.category === 'services'
                                  ? "bg-emerald-50 border-emerald-400 shadow-lg shadow-emerald-100"
                                  : "bg-slate-50 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                              )}
                            >
                              <div className={cn(
                                "p-3 rounded-xl transition-all",
                                newStoreData.category === 'services' 
                                  ? "bg-emerald-500 text-white scale-110" 
                                  : "bg-emerald-100 text-emerald-500 group-hover:scale-110"
                              )}>
                                <Wrench size={24} strokeWidth={2} />
                              </div>
                              <span className={cn(
                                "text-xs font-black uppercase tracking-widest transition-colors",
                                newStoreData.category === 'services' ? "text-emerald-600" : "text-slate-600"
                              )}>
                                Services
                              </span>
                              {newStoreData.category === 'services' && (
                                <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full">
                                  <CheckCircle2 size={14} strokeWidth={3} />
                                </div>
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Contact Info</label>
                          <Input 
                            value={newStoreData.contactInfo}
                            onChange={e => setNewStoreData({...newStoreData, contactInfo: e.target.value})}
                            placeholder="Phone or Email" 
                            className="h-12 rounded-xl border-none bg-white shadow-sm"
                          />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
                          <Input 
                            value={newStoreData.description}
                            onChange={e => setNewStoreData({...newStoreData, description: e.target.value})}
                            placeholder="What do you specialize in selling?" 
                            className="h-12 rounded-xl border-none bg-white shadow-sm"
                          />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Profile Picture</label>
                          <div className="relative">
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={handleProfileImageUpload}
                              disabled={profileUploadingId === 'new'}
                              className="hidden"
                              id="profile-upload"
                            />
                            {newStoreData.avatar ? (
                              <div className="relative group">
                                <div className="flex items-center justify-center h-32 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
                                  <img 
                                    src={newStoreData.avatar} 
                                    alt="Profile preview" 
                                    className="h-full w-auto object-contain"
                                  />
                                </div>
                                <button
                                  onClick={() => {
                                    setNewStoreData(prev => ({ ...prev, avatar: '' }));
                                    const input = document.getElementById('profile-upload') as HTMLInputElement;
                                    if (input) input.value = '';
                                  }}
                                  className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={14} />
                                </button>
                                <label
                                  htmlFor="profile-upload"
                                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                  <span className="text-white text-xs font-bold flex items-center gap-1">
                                    <Upload size={14} /> Change
                                  </span>
                                </label>
                              </div>
                            ) : (
                              <label
                                htmlFor="profile-upload"
                                className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all"
                              >
                                {profileUploadingId === 'new' ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <Spinner size="sm" />
                                    <span className="text-[10px] font-bold text-slate-500">Uploading...</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-2">
                                    <Upload size={24} className="text-slate-300" />
                                    <span className="text-[10px] font-bold text-slate-600">Click to upload or drag</span>
                                    <span className="text-[9px] text-slate-400">PNG, JPG, GIF up to 5MB</span>
                                  </div>
                                )}
                              </label>
                            )}
                          </div>
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Banner Image</label>
                          <div className="relative">
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={handleBannerImageUpload}
                              disabled={bannerUploadingId === 'new'}
                              className="hidden"
                              id="banner-upload"
                            />
                            {newStoreData.bannerImage ? (
                              <div className="relative group">
                                <img 
                                  src={newStoreData.bannerImage} 
                                  alt="Banner preview" 
                                  className="h-32 w-full object-cover rounded-lg border border-slate-100"
                                />
                                <button
                                  onClick={() => {
                                    setNewStoreData(prev => ({ ...prev, bannerImage: '' }));
                                    const input = document.getElementById('banner-upload') as HTMLInputElement;
                                    if (input) input.value = '';
                                  }}
                                  className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={14} />
                                </button>
                                <label
                                  htmlFor="banner-upload"
                                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                  <span className="text-white text-xs font-bold flex items-center gap-1">
                                    <Upload size={14} /> Change
                                  </span>
                                </label>
                              </div>
                            ) : (
                              <label
                                htmlFor="banner-upload"
                                className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all"
                              >
                                {bannerUploadingId === 'new' ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <Spinner size="sm" />
                                    <span className="text-[10px] font-bold text-slate-500">Uploading...</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-2">
                                    <Upload size={24} className="text-slate-300" />
                                    <span className="text-[10px] font-bold text-slate-600">Click to upload or drag</span>
                                    <span className="text-[9px] text-slate-400">PNG, JPG, GIF up to 5MB</span>
                                  </div>
                                )}
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={editingStoreId ? handleUpdateStore : handleCreateStore} 
                        disabled={isCreating}
                        className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-xl shadow-teal-100 uppercase tracking-widest text-xs italic disabled:opacity-50"
                      >
                        {isCreating ? <Spinner size="sm" className="mr-2 border-white" /> : null}
                        {editingStoreId ? 'Update Store Identity' : 'Initialize Identity'}
                      </Button>
                    </Card>
                  ) : storesLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                      <Spinner size="lg" className="text-teal-600" />
                      <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Loading your stores...</p>
                    </div>
                  ) : myStores.length === 0 ? (
                    <div className="py-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                      <StoreIcon className="mx-auto mb-4 text-slate-300" size={48} />
                      <p className="text-slate-400 font-bold">You don't have any stores yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {myStores.map(store => (
                        <Card key={store.id} className="overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col">
                          {/* Banner Image */}
                          <div className="relative h-32 bg-slate-100 overflow-hidden">
                            <img 
                              src={store.bannerImage} 
                              alt={store.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          </div>

                          <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-start gap-6">
                              <Avatar shape="square" className="w-20 h-20 rounded-3xl border-4 border-white shadow-lg -mt-14 relative z-10">
                                <img src={store.avatar} alt={store.name} />
                              </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">{store.name}</h4>
                                   {store.isVerified && (
                                      <Badge className="bg-teal-500 text-white border-none p-1 rounded-full">
                                         <CheckCircle2 size={10} fill="currentColor" />
                                      </Badge>
                                   )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                     variant="ghost" 
                                     size="sm" 
                                     onClick={() => navigate(`/store/${store.id}`)}
                                     className="flex items-center gap-1 px-3 h-8 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 text-[10px] font-black"
                                  >
                                     <ExternalLink size={14} />
                                     View Details
                                  </Button>
                                  <Button 
                                     variant="ghost" 
                                     size="sm" 
                                     onClick={() => startEditing(store)}
                                     className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 p-0"
                                  >
                                     <Edit3 size={14} />
                                  </Button>
                                  <Button 
                                     variant="ghost" 
                                     size="sm" 
                                     onClick={() => handleDeleteStore(store.id)}
                                     disabled={isDeletingId === store.id}
                                     className="w-8 h-8 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-100 p-0"
                                  >
                                     {isDeletingId === store.id ? <Spinner size="xs" /> : <Trash2 size={14} />}
                                  </Button>
                                  <div className="flex items-center gap-1.5 ml-2 text-slate-400">
                                    <Package size={14} />
                                    <span className="text-[10px] font-black">{store.itemsCount} Items</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-slate-500 mt-1">{store.description}</p>
                              
                              <div className="mt-6 pt-6 border-t border-slate-50 space-y-4">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Active in Communities</h5>
                                  <Badge className="bg-slate-100 text-slate-500 border-none font-black px-3 py-1 text-[9px]">
                                    {store.communitiesJoined.length} Communities
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {joinedCommunities.filter(c => store.communitiesJoined.includes(String(c.id))).map(c => (
                                    <Badge key={c.id} className="bg-teal-50 text-teal-600 border-none font-bold text-[10px] px-3 py-1.5 rounded-xl">
                                      {c.name}
                                    </Badge>
                                  ))}
                                  {joinedCommunities.filter(c => !store.communitiesJoined.includes(String(c.id))).length > 0 && (
                                    <div className="flex flex-col gap-4 mt-4 w-full p-6 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border-2 border-teal-200 shadow-sm">
                                       <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                             <StoreIcon size={16} className="text-teal-600" />
                                             <span className="text-[11px] font-black text-teal-900 uppercase tracking-wider">Register in Communities</span>
                                          </div>
                                          {selectedCommunityIds.length > 0 && applyingStoreId === store.id && (
                                             <Badge className="bg-teal-600 text-white border-none text-[9px] font-black uppercase px-3 py-1 rounded-lg">
                                                {selectedCommunityIds.length} Selected
                                             </Badge>
                                          )}
                                       </div>
                                       
                                       <div className="flex flex-wrap gap-2">
                                          {joinedCommunities
                                            .filter(c => !store.communitiesJoined.includes(String(c.id)))
                                            .map(c => {
                                              const isSelected = applyingStoreId === store.id && selectedCommunityIds.includes(String(c.id));
                                              return (
                                                <button
                                                  key={c.id}
                                                  onClick={() => {
                                                    setApplyingStoreId(store.id);
                                                    if (isSelected) {
                                                      setSelectedCommunityIds(prev => prev.filter(id => id !== String(c.id)));
                                                    } else {
                                                      setSelectedCommunityIds(prev => [...prev, String(c.id)]);
                                                      if (!applicationDataMap[String(c.id)]) {
                                                        setApplicationDataMap(prev => ({
                                                          ...prev,
                                                          [String(c.id)]: { businessPermitUrl: '', location: '' }
                                                        }));
                                                      }
                                                    }
                                                  }}
                                                  className={cn(
                                                    "px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                                                    isSelected 
                                                      ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200" 
                                                      : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"
                                                  )}
                                                >
                                                  {c.name}
                                                </button>
                                              );
                                            })
                                          }
                                       </div>

                                       {applyingStoreId === store.id && selectedCommunityIds.length > 0 && (
                                          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 mt-2">
                                             <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                {selectedCommunityIds.map(cid => {
                                                  const community = communities.find(c => String(c.id) === cid);
                                                  return (
                                                    <div key={cid} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
                                                       <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                                          <span className="text-xs font-black text-slate-900 uppercase italic tracking-tight">{community?.name}</span>
                                                          <RefreshCw size={12} className="text-slate-300" />
                                                       </div>
                                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                          <div className="space-y-1.5">
                                                             <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                                                                Upload Permit <span className="text-rose-500">*</span>
                                                             </label>
                                                             <div className="relative">
                                                               <input 
                                                                 type="file"
                                                                 accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                                 onChange={e => {
                                                                   const file = e.target.files?.[0];
                                                                   if (file) {
                                                                     const fileUrl = URL.createObjectURL(file);
                                                                     setApplicationDataMap({
                                                                       ...applicationDataMap,
                                                                       [cid]: { ...applicationDataMap[cid], businessPermitUrl: fileUrl, permitFileName: file.name }
                                                                     });
                                                                   }
                                                                 }}
                                                                 className="hidden"
                                                                 id={`permit-upload-${cid}`}
                                                               />
                                                               {applicationDataMap[cid]?.businessPermitUrl ? (
                                                                 <div className="h-10 border-2 border-dashed border-teal-300 rounded-lg bg-teal-50 flex items-center justify-between px-3">
                                                                   <div className="flex items-center gap-2">
                                                                     <CheckCircle2 size={14} className="text-teal-600" />
                                                                     <span className="text-[10px] font-bold text-teal-700 truncate">
                                                                       {(applicationDataMap[cid] as any)?.permitFileName || 'File selected'}
                                                                     </span>
                                                                   </div>
                                                                   <label
                                                                     htmlFor={`permit-upload-${cid}`}
                                                                     className="cursor-pointer text-teal-600 hover:text-teal-700 font-bold text-[9px] uppercase"
                                                                   >
                                                                     Change
                                                                   </label>
                                                                 </div>
                                                               ) : (
                                                                 <label
                                                                   htmlFor={`permit-upload-${cid}`}
                                                                   className="flex items-center justify-center h-10 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all"
                                                                 >
                                                                   <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                                                                     <Upload size={12} /> Select File
                                                                   </span>
                                                                 </label>
                                                               )}
                                                             </div>
                                                          </div>
                                                          <div className="space-y-1.5">
                                                             <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                                                                Location <span className="text-rose-500">*</span>
                                                             </label>
                                                             <Input 
                                                               value={applicationDataMap[cid]?.location || ''}
                                                               onChange={e => setApplicationDataMap({
                                                                 ...applicationDataMap,
                                                                 [cid]: { ...applicationDataMap[cid], location: e.target.value }
                                                               })}
                                                               placeholder="Stall #, Zone..." 
                                                               className="h-9 text-[11px] rounded-lg border-slate-100 bg-slate-50/50"
                                                             />
                                                          </div>
                                                       </div>
                                                    </div>
                                                  );
                                                })}
                                             </div>

                                             <div className="flex gap-2 pt-2">
                                                <Button 
                                                  onClick={handleBatchApplyToCommunities}
                                                  disabled={isSubmittingBatch}
                                                  className="flex-1 h-12 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl text-xs uppercase shadow-lg shadow-teal-100 italic"
                                                >
                                                  {isSubmittingBatch ? (
                                                     <Spinner size="sm" className="mr-2 border-white" />
                                                  ) : (
                                                     <RefreshCw size={14} className="mr-2" />
                                                  )}
                                                  Submit {selectedCommunityIds.length} {selectedCommunityIds.length === 1 ? 'Application' : 'Applications'}
                                                </Button>
                                                <Button 
                                                  variant="ghost"
                                                  onClick={() => {
                                                    setApplyingStoreId(null);
                                                    setSelectedCommunityIds([]);
                                                    setApplicationDataMap({});
                                                  }}
                                                  className="h-12 px-6 text-xs font-black uppercase text-slate-400"
                                                >
                                                  Clear
                                                </Button>
                                             </div>
                                          </div>
                                       )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-140px)] border-none shadow-xl rounded-lg sm:rounded-[2.5rem] bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative">
      <div className="px-3 md:px-8 py-3 md:py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6 shrink-0 text-decoration-none">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('common.communities', 'Communities')}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Join local groups to stay updated and help others in your area.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full">


          <div className="relative group w-full sm:flex-1 sm:w-64 min-w-0" role="search" aria-label={t('communities.search_placeholder', 'Search communities') }>
            <label htmlFor="community-search" className="sr-only">{t('communities.search_placeholder', 'Search communities by name or description...')}</label>
            <div className="relative flex items-center bg-gray-50 rounded-xl border border-transparent group-focus-within:bg-white group-focus-within:border-slate-100 transition-all overflow-hidden px-3 min-w-0">
              <Search className="text-slate-400 w-4 h-4" />
              <Input
                id="community-search"
                aria-label={t('communities.search_placeholder', 'Search communities by name or description...')}
                inputMode="search"
                placeholder={t('communities.search_placeholder', 'Search communities by name or description...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none h-10 text-slate-800 text-sm font-medium bg-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label={t('common.clear', 'Clear search')}
                  onClick={() => setSearchQuery('')}
                  className="ml-2 p-2 rounded-full text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-teal-500"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <Button 
            onClick={() => navigate('/communities/create')}
            size="sm"
            aria-label={t('communities.create', 'Apply for Community')}
            className="flex-shrink-0 w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold h-10 px-4 rounded-xl shadow-lg shadow-teal-100 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="inline text-sm font-bold">{t('communities.create', 'Apply for Community')}</span>
          </Button>
        </div>
      </div>

      {/* Communities Tab Navigation */}
      {isAuthenticated && (
        <div role="tablist" aria-label={t('communities.tabs', 'Communities tabs')} className="px-4 md:px-8 pb-4 border-b border-gray-100 flex items-center gap-2 sm:gap-3 flex-nowrap shrink-0 overflow-x-auto sticky top-16 z-30 bg-white/95 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none sm:top-auto">
          <Button 
            role="tab"
            aria-selected={communitiesTab === 'my-communities'}
            onClick={() => setCommunitiesTab('my-communities')}
            variant="ghost"
            className={cn(
              "px-3 sm:px-4 py-2 min-h-[44px] sm:min-h-0 rounded-xl font-bold text-sm transition-all border-b-2 whitespace-nowrap flex-shrink-0",
              communitiesTab === 'my-communities' 
                ? "border-teal-600 text-teal-600 bg-teal-50" 
                : "border-transparent text-slate-500 hover:text-teal-600"
            )}
          >
            <Users className="w-4 h-4 mr-2" />
            My Communities
          </Button>
          <Button 
            role="tab"
            aria-selected={communitiesTab === 'all-communities'}
            onClick={() => setCommunitiesTab('all-communities')}
            variant="ghost"
            className={cn(
              "px-3 sm:px-4 py-2 min-h-[44px] sm:min-h-0 rounded-xl font-bold text-sm transition-all border-b-2 whitespace-nowrap flex-shrink-0",
              communitiesTab === 'all-communities' 
                ? "border-teal-600 text-teal-600 bg-teal-50" 
                : "border-transparent text-slate-500 hover:text-teal-600"
            )}
          >
            <Plus className="w-4 h-4 mr-2" />
            Browse Communities
          </Button>

        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 md:p-8 custom-scrollbar">
        {(communitiesLoading || loading || myCommunitiesLoading || allCommunitiesLoading) ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" />
            <p className="mt-4 text-slate-500 font-medium">Loading communities...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-3 md:gap-6">
            {filteredCommunities.map((community, idx) => {
              return (
              <Card 
                key={community.id || (community as any)._id || idx}
                role="button"
                tabIndex={0}
                aria-label={`Open community ${community.name}`}
                className="group border border-slate-100 rounded-lg sm:rounded-[2rem] overflow-hidden bg-white hover:shadow-2xl hover:shadow-teal-100/30 transition-all duration-500 cursor-pointer flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                onClick={() => {
                  const isPending = community.status === 'pending' || community.status === 'Pending';
                  if (isPending) {
                    setSelectedCommunityForModal(community);
                    setIsDetailModalOpen(true);
                  } else {
                    navigate(`/community/${community.id || (community as any)._id}`);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const isPending = community.status === 'pending' || community.status === 'Pending';
                    if (isPending) {
                      setSelectedCommunityForModal(community);
                      setIsDetailModalOpen(true);
                    } else {
                      navigate(`/community/${community.id || (community as any)._id}`);
                    }
                  }
                }}
              >
                <div className="hidden sm:block h-32 relative overflow-hidden shrink-0">
                  {community.banner || community.imageUrl ? (
                    <img src={community.banner || community.imageUrl || undefined} alt={`${community.name} banner`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600" />
                  )}
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                  
                  {isAuthenticated && user?.id && community.createdBy === user.id && (
                    <Badge className="absolute top-3 left-3 bg-violet-500 text-white font-black uppercase text-[8px] tracking-widest px-2 py-0.5 border-none shadow-sm">
                      Your Community
                    </Badge>
                  )}

                  {isAuthenticated && isCommunityMember(community) && isMemberApproved(community) && !(user?.id && community.createdBy === user.id) && (
                    <Badge className="absolute top-3 left-3 bg-emerald-500 text-white font-black uppercase text-[8px] tracking-widest px-2 py-0.5 border-none shadow-sm">
                      Joined
                    </Badge>
                  )}

                  {/* Show "Pending Approval" badge if user is member but not approved AND not the creator */}
                  {isAuthenticated && isCommunityMember(community) && !isMemberApproved(community) && !(user?.id && community.createdBy === user.id) && (
                    <Badge className="absolute top-3 left-3 bg-amber-500 text-white font-black uppercase text-[8px] tracking-widest px-2 py-0.5 border-none shadow-sm">
                      Pending Approval
                    </Badge>
                  )}

                  {/* Show status badge if community is pending, suspended, denied, or disabled */}
                  {isAuthenticated && 
                    ['pending', 'suspended', 'denied', 'disabled'].includes(community.status?.toLowerCase() || '') && (
                    <Badge className={cn(
                      "absolute top-3 left-3 font-black uppercase text-[8px] tracking-widest px-2 py-0.5 border-none shadow-sm",
                      community.status?.toLowerCase() === 'pending' ? "bg-amber-500 text-white" :
                      community.status?.toLowerCase() === 'suspended' ? "bg-rose-500 text-white" :
                      "bg-red-500 text-white"
                    )}>
                      {community.status}
                    </Badge>
                  )}

                  {community.tagline && (
                    <Badge className="absolute top-3 right-3 bg-white/20 backdrop-blur-md border-white/30 text-white font-black uppercase text-[8px] tracking-widest px-2 py-0.5">
                      {community.tagline}
                    </Badge>
                  )}
                  <div className="hidden sm:block absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
                </div>
                
                <div className="p-2 md:p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    {/* top short label removed to avoid duplicate location display; full address appears in the card footer */}
                  </div>
                  
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-slate-50 bg-teal-50 flex items-center justify-center">
                        {community.logo ? (
                          <img src={community.logo} alt={`${community.name} logo`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-teal-100" />
                        )}
                      </div>
                      {isCommunityMember(community) && isMemberApproved(community) && (
                        <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-black text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2 leading-tight">
                          {community.name}
                        </h3>
                      </div>

                      {isCommunityMember(community) && isMemberApproved(community) && (
                        <span className="inline-flex items-center gap-2 mt-2 px-2 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                          Joined
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-slate-500 text-[11px] leading-relaxed mb-4 md:mb-6 line-clamp-3 font-medium flex-1">
                    {community.description || 'No description available for this community.'}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 md:pt-4 border-t border-slate-50 mt-auto">
                    <div className="flex items-center gap-3 text-slate-400 text-xs flex-1">
                      <div className="flex items-center gap-2">
                        <Users size={12} />
                        <span className="font-bold text-slate-500">{community.memberCount || community.membersCount || 0}</span>
                        <span className="text-[11px] text-slate-400 ml-1">Members</span>
                      </div>
                      <div className="flex items-center gap-2 max-w-full">
                        <MapPin size={12} />
                        <span className="text-[11px] font-medium text-slate-500 break-words line-clamp-2 max-w-full">{community.location || 'Local Community'}</span>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto">
                      {isAuthenticated && user?.id && community.createdBy === user.id ? (
                        <Button 
                          onClick={() => navigate(`/community/${community.id || (community as any)._id}`)}
                          size="sm"
                          className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-extrabold h-10 rounded-xl flex items-center justify-center gap-2"
                        >
                          <ArrowRight size={14} />
                          Visit Hub
                        </Button>
                      ) : isAuthenticated && isCommunityMember(community) && isMemberApproved(community) ? (
                        <Button 
                          onClick={() => navigate(`/community/${community.id || (community as any)._id}`)}
                          size="sm"
                          className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-extrabold h-10 rounded-xl flex items-center justify-center gap-2"
                        >
                          <ArrowRight size={14} />
                          Visit Hub
                        </Button>
                      ) : isAuthenticated && isCommunityMember(community) && !isMemberApproved(community) ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled
                          className="w-full sm:w-auto h-10 rounded-xl text-amber-600 font-extrabold bg-slate-50 opacity-60"
                        >
                          Waiting for Approval
                        </Button>
                      ) : !isAuthenticated ? (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openLoginModal();
                          }}
                          size="sm"
                          className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-extrabold h-10 rounded-xl"
                        >
                          Sign In
                        </Button>
                      ) : (
                        <Button 
                          onClick={(e) => handleJoin(e, community.id)}
                          disabled={joiningId === community.id}
                          size="sm"
                          className={cn(
                            "w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-extrabold h-10 rounded-xl",
                            joiningId === community.id && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {joiningId === community.id ? (
                            <Spinner size="xs" className="border-white" />
                          ) : (
                            <div className="flex items-center gap-1.5 justify-center">
                              <UserPlus size={12} strokeWidth={3} />
                              Request to Join
                            </div>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
              );
            })}

            {filteredCommunities.length === 0 && !communitiesLoading && !loading && !myCommunitiesLoading && !allCommunitiesLoading && (
              <div className="col-span-full py-20 text-center">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-slate-200 w-10 h-10" />
                </div>
                <h3 className="text-slate-400 font-bold text-xl">
                  {communitiesTab === 'my-communities' ? 'No communities yet' : 'No communities found'}
                </h3>
                <p className="text-slate-400">
                  {communitiesTab === 'my-communities' 
                    ? 'Join communities or create your own to get started.' 
                    : 'Try switching to "My Communities" to see your joined communities.'}
                </p>
                {communitiesTab === 'my-communities' && (
                  <Button 
                    onClick={() => setCommunitiesTab('all-communities')}
                    className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2 rounded-xl"
                  >
                    Browse Communities
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <CommunityDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCommunityForModal(null);
        }}
        community={selectedCommunityForModal}
      />


    </Card>
  );
};