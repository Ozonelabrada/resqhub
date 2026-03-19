import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Badge, 
  Spinner,
  Tabs,
  TabList,
  TabTrigger,
  Avatar,
  Input
} from '../../ui';
import { 
  Users, 
  Inbox,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminService } from '../../../services';
import type { CommunitySummary, AdminAction } from '@/types/admin';

const CommunityManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<CommunitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'members' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [minMembers, setMinMembers] = useState('');

  // Normalize status to lowercase for case-insensitive comparison
  const normalizeStatus = (status: string): string => status?.toLowerCase().trim() || '';

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: communities.length,
      active: communities.filter(c => normalizeStatus(c.status) === 'approved').length,
      pending: communities.filter(c => normalizeStatus(c.status) === 'pending').length,
      archived: communities.filter(c => normalizeStatus(c.status) === 'denied').length,
      totalMembers: communities.reduce((sum, c) => sum + (c.membersCount || 0), 0),
    };
  }, [communities]);

  useEffect(() => {
    fetchCommunities();
  }, [activeTab, searchQuery]);

  // Filter and sort communities
  const filteredAndSortedCommunities = useMemo(() => {
    let filtered = communities;

    // Apply member count filter
    if (minMembers) {
      const min = parseInt(minMembers);
      filtered = filtered.filter(c => (c.membersCount || 0) >= min);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'members':
          comparison = (a.membersCount || 0) - (b.membersCount || 0);
          break;
        case 'date':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [communities, searchQuery, sortBy, sortOrder, minMembers]);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      // For 'live' tab, fetch 'approved' communities
      let statusParam: 'pending' | 'approved' | 'disabled' | 'denied' | 'all' = 'all';
      
      if (activeTab === 'live') {
        // Fetch approved communities
        statusParam = 'approved';
      } else if (activeTab === 'pending' || activeTab === 'disabled' || activeTab === 'denied') {
        statusParam = activeTab as 'pending' | 'disabled' | 'denied';
      }
      
      const response = await AdminService.getCommunities({ 
        status: statusParam,
        query: searchQuery.trim() || undefined
      });
      // Safety check for data structure
      // Handle response.data (if service returns whole body) or response (if service returns inner data)
      const dataObj = response.data || response;
      let items = Array.isArray(dataObj.items) ? dataObj.items : (Array.isArray(dataObj) ? dataObj : []);
      
      // Normalize status for all items to lowercase for consistent filtering
      items = items.map(item => ({
        ...item,
        status: item.status ? item.status.toLowerCase().trim() : 'inactive'
      }));
      
      setCommunities(items);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
      setCommunities([]);
    } finally {
      // Ensure loading is ALWAYS disabled
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleQuickAction = async (communityId: string | number, action: 'approve' | 'deny') => {
    try {
      const id = String(communityId);
      
      if (action === 'approve') {
        const approveAction: AdminAction = {
          type: 'approve',
          notifyUser: true
        };
        await AdminService.approveCommunity(id, approveAction);
      } else {
        const rejectAction: AdminAction = {
          type: 'reject',
          reason: 'Rejected by admin',
          notifyUser: true
        };
        await AdminService.rejectCommunity(id, rejectAction);
      }
      fetchCommunities();
    } catch (error) {
      console.error(`Failed to ${action} community:`, error);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-8">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-teal-50 to-teal-100/50 border-teal-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-600 mb-1">Total Communities</p>
                <p className="text-3xl font-black text-teal-900">{stats.total}</p>
              </div>
              <Users className="text-teal-400 opacity-50" size={32} />
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Active</p>
                <p className="text-3xl font-black text-green-900">{stats.active}</p>
              </div>
              <CheckCircle className="text-green-400 opacity-50" size={32} />
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 mb-1">Pending</p>
                <p className="text-3xl font-black text-amber-900">{stats.pending}</p>
              </div>
              <Clock className="text-amber-400 opacity-50" size={32} />
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Members</p>
                <p className="text-3xl font-black text-slate-900">{stats.totalMembers.toLocaleString()}</p>
              </div>
              <TrendingUp className="text-slate-400 opacity-50" size={32} />
            </div>
          </Card>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between">
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Search communities by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12 rounded-xl border-slate-200 focus:border-teal-300 focus:ring-teal-100"
                    />
                </div>
                <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
                    {filteredAndSortedCommunities.length} communities shown
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'members' | 'date')}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="date">Recently Created</option>
                    <option value="name">Community Name</option>
                    <option value="members">Member Count</option>
                  </select>
                  <button
                    onClick={toggleSortOrder}
                    className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
                    title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                  >
                    <ArrowUpDown size={18} className="text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Min Members</label>
                <Input
                  type="number"
                  placeholder="Filter by minimum members..."
                  value={minMembers}
                  onChange={(e) => setMinMembers(e.target.value)}
                  className="h-10 rounded-lg border-slate-200 focus:border-teal-300"
                />
              </div>
            </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 inline-flex mb-8">
            <TabList className="bg-transparent border-none gap-2">
                    <TabTrigger value="live" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all">
                        Approved & Active
                    </TabTrigger>
                    <TabTrigger value="pending" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all">
                        Pending Requests
                    </TabTrigger>
                    <TabTrigger value="denied" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all">
                        Archive
                    </TabTrigger>
                </TabList>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                    <Spinner size="lg" className="mb-4 text-teal-600" />
                    <p className="text-slate-400 font-bold">Scanning database...</p>
                </div>
            ) : communities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Inbox className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">Queue is Empty</h3>
                    <p className="text-slate-400 font-medium">No communities found in this category.</p>
                </div>
            ) : filteredAndSortedCommunities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Filter className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">No Results</h3>
                    <p className="text-slate-400 font-medium">Try adjusting your filters or search query.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                    {filteredAndSortedCommunities.map(item => (
                        <Card key={item.id} className="group border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden flex flex-col transition-all hover:translate-y-[-4px]">
                            <div className="p-8 pb-4">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-teal-50 flex items-center justify-center">
                                        <Users className="text-teal-600" size={32} />
                                    </div>
                                    <Badge className={cn(
                                        "border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase",
                                        normalizeStatus(item.status) === 'pending' ? "bg-amber-100 text-amber-700" :
                                        normalizeStatus(item.status) === 'approved' || normalizeStatus(item.status) === 'active' ? "bg-green-100 text-green-700" :
                                        normalizeStatus(item.status) === 'denied' || normalizeStatus(item.status) === 'archived' ? "bg-red-100 text-red-700" :
                                        "bg-slate-100 text-slate-700"
                                    )}>
                                        {normalizeStatus(item.status) === 'approved' ? 'Active' : item.status || 'inactive'}
                                    </Badge>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2 truncate" title={item.name}>{item.name}</h3>
                                <p className="text-slate-500 font-medium text-sm line-clamp-3 mb-6 leading-relaxed">
                                    {normalizeStatus(item.status) === 'approved' || normalizeStatus(item.status) === 'active' ? 'This community is currently live and active.' : `This community is currently ${normalizeStatus(item.status) || 'inactive'}.`}
                                </p>
                                
                                <div className="space-y-4 pt-6 border-t border-slate-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl border border-white shadow-sm font-bold bg-slate-100 flex items-center justify-center text-[10px] text-slate-500">
                                                {item.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400">{(item.membersCount || 0).toLocaleString()} Members</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase">
                                          {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto p-4 bg-slate-50/50 flex items-center gap-2 border-t border-slate-50">
                                {activeTab === 'pending' ? (
                                  <>
                                    <Button 
                                      onClick={() => handleQuickAction(item.id, 'approve')}
                                      className="flex-1 h-10 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-all"
                                    >
                                      Approve
                                    </Button>
                                    <Button 
                                      onClick={() => handleQuickAction(item.id, 'deny')}
                                      className="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all"
                                    >
                                      Deny
                                    </Button>
                                  </>
                                ) : (
                                  <Button 
                                    onClick={() => navigate(`/admin/communities/${item.id}`)}
                                    className="flex-1 h-12 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-black transition-all"
                                  >
                                    Manage
                                  </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </Tabs>
    </div>
  );
};

export default CommunityManagementPage;
