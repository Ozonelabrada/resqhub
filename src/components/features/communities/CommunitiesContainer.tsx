import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCommunities } from '@/hooks/useCommunities';
import { Card, Button, Spinner, Input, Badge } from '@/components/ui';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { 
  Users, 
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
  Edit3
} from 'lucide-react';
import { CommunityService, StoreService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { Community } from '@/types/community';
import { CreateCommunityModal } from '../../modals';

interface UserStore {
  id: string | number;
  name: string;
  description: string;
  bannerImage: string;
  avatar: string;
  contactInfo?: string;
  communitiesJoined: string[]; // IDs of communities this store is active in
  itemsCount: number;
  isVerified?: boolean;
}

const MOCK_USER_STORES: UserStore[] = [
  {
    id: 1,
    name: "My Emergency Gear",
    description: "Personal store for disaster preparedness items.",
    bannerImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
    avatar: "https://i.pravatar.cc/150?u=my-store-1",
    contactInfo: "+63 912 345 6789",
    communitiesJoined: ['1', '2'],
    itemsCount: 15
  }
];

export const CommunitiesContainer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { communities: hookCommunities, loading: communitiesLoading, refresh } = useCommunities();
  const { isAuthenticated, openLoginModal, user } = useAuth();
  
  // Local state for communities (to handle search results)
  const [communities, setCommunities] = useState<Community[]>([]);
  const [view, setView] = useState<'list' | 'store-application'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [joiningId, setJoiningId] = useState<string | number | null>(null);

  const joinedCommunities = communities.filter(c => c.isMember);

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
    contactInfo: ''
  });

  // Application State
  const [applyingStoreId, setApplyingStoreId] = useState<string | number | null>(null);
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([]);
  const [applicationDataMap, setApplicationDataMap] = useState<Record<string, { businessPermitUrl: string, location: string }>>({});
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

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
      setLoading(false);
    }
  }, [hookCommunities, communities.length]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Search communities when debounced query changes
  useEffect(() => {
    const searchCommunities = async () => {
      if (debouncedSearchQuery.trim()) {
        setLoading(true);
        try {
          const searchResults = await CommunityService.searchCommunities(debouncedSearchQuery.trim());
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

  const filteredCommunities = communities;

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
        contactInfo: newStoreData.contactInfo
      };

      const result = await StoreService.createStore(payload);
      
      const newStore: UserStore = {
        id: result?.id || `store-${Date.now()}`,
        name: newStoreData.name,
        description: newStoreData.description,
        bannerImage: payload.bannerUrl,
        avatar: newStoreData.avatar || `https://i.pravatar.cc/150?u=${newStoreData.name}`,
        contactInfo: newStoreData.contactInfo,
        communitiesJoined: [],
        itemsCount: 0
      };
      
      setMyStores([...myStores, newStore]);
      setNewStoreData({ name: '', description: '', bannerImage: '', avatar: '', contactInfo: '' });
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
      const payload = {
        name: newStoreData.name,
        description: newStoreData.description,
        bannerUrl: newStoreData.bannerImage,
        contactInfo: newStoreData.contactInfo
      };

      await StoreService.updateStore(editingStoreId, payload);
      
      setMyStores(myStores.map(s => s.id === editingStoreId ? {
        ...s,
        ...newStoreData
      } : s));
      
      setNewStoreData({ name: '', description: '', bannerImage: '', avatar: '', contactInfo: '' });
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

  const startEditing = (store: UserStore) => {
    setNewStoreData({
      name: store.name,
      description: store.description,
      bannerImage: store.bannerImage,
      avatar: store.avatar,
      contactInfo: store.contactInfo || ''
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
      <Card className="flex flex-col h-[calc(100vh-140px)] border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden animate-in slide-in-from-right duration-500 relative">
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
          <div className="max-w-5xl mx-auto space-y-10">
            {/* Store Application Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="col-span-1 bg-teal-600 rounded-[2rem] p-8 text-white space-y-4 shadow-xl shadow-teal-900/10">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Info size={24} />
                  </div>
                  <h3 className="text-xl font-black uppercase">Sell in Communities</h3>
                  <p className="text-teal-50 text-sm font-medium leading-relaxed">
                    Once you create a store, you can apply to list it in any community where you're a member. Each community has its own trade market.
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
                          setNewStoreData({ name: '', description: '', bannerImage: '', avatar: '', contactInfo: '' });
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
                        <div className="space-y-1.5">
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
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Banner Image URL</label>
                          <Input 
                            value={newStoreData.bannerImage}
                            onChange={e => setNewStoreData({...newStoreData, bannerImage: e.target.value})}
                            placeholder="https://images.unsplash.com/..." 
                            className="h-12 rounded-xl border-none bg-white shadow-sm"
                          />
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
                        <Card key={store.id} className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
                          <div className="flex items-start gap-6">
                            <Avatar shape="square" className="w-20 h-20 rounded-3xl border-4 border-slate-50 shadow-lg">
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
                                    <div className="flex flex-col gap-4 mt-4 w-full p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                                       <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                             <PlusCircle size={14} className="text-teal-600" />
                                             <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Expand to Communities</span>
                                          </div>
                                          {selectedCommunityIds.length > 0 && applyingStoreId === store.id && (
                                             <Badge className="bg-teal-600 text-white border-none text-[9px] font-black uppercase px-2 py-0.5">
                                                {selectedCommunityIds.length} Pending
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
                                                                Business Permit <span className="text-rose-500">*</span>
                                                             </label>
                                                             <Input 
                                                               value={applicationDataMap[cid]?.businessPermitUrl || ''}
                                                               onChange={e => setApplicationDataMap({
                                                                 ...applicationDataMap,
                                                                 [cid]: { ...applicationDataMap[cid], businessPermitUrl: e.target.value }
                                                               })}
                                                               placeholder="URL to permit" 
                                                               className="h-9 text-[11px] rounded-lg border-slate-100 bg-slate-50/50"
                                                             />
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
    <Card className="flex flex-col h-[calc(100vh-140px)] border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative">
      <div className="p-4 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 shrink-0 text-decoration-none">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('common.communities', 'Communities')}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Join local groups to stay updated and help others in your area.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-50 p-2 pr-4 rounded-2xl border border-slate-100">
             <Button 
                onClick={() => setView('store-application')}
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white font-black h-10 px-4 rounded-xl transition-all flex items-center gap-2 group"
             >
                <StoreIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Apply to Sale</span>
             </Button>
             <div className="flex flex-col leading-none">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stores</span>
                <span className="text-sm font-black text-slate-900">{myStores.length} Active</span>
             </div>
          </div>

          <div className="relative group w-64">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-gray-50 rounded-xl border border-transparent group-focus-within:bg-white group-focus-within:border-slate-100 transition-all overflow-hidden px-3">
              <Search className="text-slate-400 w-4 h-4" />
              <Input 
                placeholder={t('communities.search_placeholder', 'Search communities by name or description...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none focus-visible:ring-0 h-10 text-slate-800 text-sm font-medium bg-transparent"
              />
            </div>
          </div>

          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold h-10 px-4 rounded-xl shadow-lg shadow-teal-100 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('communities.create', 'Create')}</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        {communitiesLoading || loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" />
            <p className="mt-4 text-slate-500 font-medium">Loading communities...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-4 md:gap-6">
            {filteredCommunities.map((community, idx) => (
              <Card 
                key={community.id || (community as any)._id || idx}
                className="group border border-slate-100 rounded-[2rem] overflow-hidden bg-white hover:shadow-2xl hover:shadow-teal-100/30 transition-all duration-500 cursor-pointer flex flex-col h-full"
                onClick={() => navigate(`/community/${community.id || (community as any)._id}`)}
              >
                <div className="h-32 relative overflow-hidden shrink-0">
                  {community.banner || community.imageUrl ? (
                    <img src={community.banner || community.imageUrl || undefined} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600" />
                  )}
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                  
                  {isAuthenticated && community.isMember && (
                    <Badge className="absolute top-3 left-3 bg-emerald-500 text-white font-black uppercase text-[8px] tracking-widest px-2 py-0.5 border-none shadow-sm">
                      Joined
                    </Badge>
                  )}

                  {community.tagline && (
                    <Badge className="absolute top-3 right-3 bg-white/20 backdrop-blur-md border-white/30 text-white font-black uppercase text-[8px] tracking-widest px-2 py-0.5">
                      {community.tagline}
                    </Badge>
                  )}
                  <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
                </div>
                
                <div className="p-3 md:p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-teal-600">
                      <MapPin size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{community.location || 'Local Community'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 mb-3">
                    {(community.logo || community.imageUrl) && (
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-50">
                        <img src={community.logo || community.imageUrl || undefined} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h3 className="text-base font-black text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2 leading-tight">
                      {community.name}
                    </h3>
                  </div>
                  
                  <p className="text-slate-500 text-[11px] leading-relaxed mb-4 md:mb-6 line-clamp-3 font-medium flex-1">
                    {community.description || 'No description available for this community.'}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-slate-50 mt-auto">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users size={12} />
                      <span className="text-[11px] font-bold text-slate-500">{community.memberCount || community.membersCount || 0} Members</span>
                    </div>
                    
                    {isAuthenticated && community.isMember ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-0 h-auto hover:bg-transparent text-teal-600 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all"
                      >
                        Visit Hub
                        <ArrowRight size={14} />
                      </Button>
                    ) : (
                      <Button 
                        onClick={(e) => handleJoin(e, community.id)}
                        disabled={joiningId === community.id}
                        size="sm"
                        className={cn(
                          "h-8 rounded-lg px-4 text-[10px] font-black uppercase tracking-widest transition-all",
                          "bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-100",
                          joiningId === community.id && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {joiningId === community.id ? (
                          <Spinner size="xs" className="border-white" />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <UserPlus size={12} strokeWidth={3} />
                            Request to Join
                          </div>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {filteredCommunities.length === 0 && !communitiesLoading && !loading && (
              <div className="col-span-full py-20 text-center">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-slate-200 w-10 h-10" />
                </div>
                <h3 className="text-slate-400 font-bold text-xl">No communities found</h3>
                <p className="text-slate-400">Try a different search term or create your own community.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateCommunityModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={async () => {
          setIsCreateModalOpen(false);
          await refresh();
          // The useEffect will update local communities when hookCommunities changes
        }}
      />
    </Card>
  );
};