import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Badge, 
  Spinner,
  Tabs,
  TabList,
  TabTrigger,
  Avatar
} from '../../ui';
import { 
  Users, 
  CheckCircle2, 
  XCircle,
  Eye,
  Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminService } from '../../../services';
import type { CommunitySummary } from '@/types/admin';

const CommunityManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<CommunitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchCommunities();
  }, [activeTab]);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const response = await AdminService.getCommunities({ 
        status: (activeTab === 'pending' || activeTab === 'active' || activeTab === 'disabled' || activeTab === 'rejected') 
          ? activeTab 
          : 'all'
      });
      // Safety check for data structure
      // Handle response.data (if service returns whole body) or response (if service returns inner data)
      const dataObj = response.data || response;
      const items = Array.isArray(dataObj.items) ? dataObj.items : (Array.isArray(dataObj) ? dataObj : []);
      setCommunities(items);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
      setCommunities([]);
    } finally {
      // Ensure loading is ALWAYS disabled
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleStatusUpdate = async (id: string | number, status: 'approved' | 'rejected') => {
    try {
      const response = status === 'approved' 
        ? await AdminService.approveCommunity(String(id), {
            type: 'approve',
            reason: `Community has been approved by admin.`,
            notifyUser: true
          })
        : await AdminService.rejectCommunity(id, {
            type: 'reject',
            reason: `Community has been rejected by admin.`,
            notifyUser: true
          });

      if (response.succeeded) {
        setCommunities(communities.filter(c => c.id !== id));
        (window as any).showToast?.('success', 'Status Updated', `Community has been ${status}.`);
      } else {
        (window as any).showToast?.('error', 'Update Failed', response.message || 'Could not update community status.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      (window as any).showToast?.('error', 'Error', 'An error occurred while updating status.');
    }
  };

  return (
    <div className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 inline-flex mb-8">
                <TabList className="bg-transparent border-none gap-2">
                    <TabTrigger value="pending" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all">
                        Pending Requests
                    </TabTrigger>
                    <TabTrigger value="active" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all">
                        Live Communities
                    </TabTrigger>
                    <TabTrigger value="rejected" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all">
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
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                    {communities.map(item => (
                        <Card key={item.id} className="group border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden flex flex-col transition-all hover:translate-y-[-4px]">
                            <div className="p-8 pb-4">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-teal-50 flex items-center justify-center">
                                        <Users className="text-teal-600" size={32} />
                                    </div>
                                    <Badge className={cn(
                                        "border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase",
                                        item.status === 'pending' ? "bg-amber-100 text-amber-700" :
                                        (item.status === 'active' || item.isActive) ? "bg-green-100 text-green-700" :
                                        "bg-red-100 text-red-700"
                                    )}>
                                        {item.status || (item.isActive ? 'active' : 'inactive')}
                                    </Badge>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2 truncate" title={item.name}>{item.name}</h3>
                                <p className="text-slate-500 font-medium text-sm line-clamp-3 mb-6 leading-relaxed">
                                    {item.isActive ? 'This community is currently live and active.' : 'This community is currently inactive or pending review.'}
                                </p>
                                
                                <div className="space-y-4 pt-6 border-t border-slate-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl border border-white shadow-sm font-bold bg-slate-100 flex items-center justify-center text-[10px] text-slate-500">
                                                {item.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-600">ID: {item.id}</span>
                                                <span className="text-[10px] font-bold text-slate-400">{item.membersCount} Members</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase">
                                          {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto p-4 bg-slate-50/50 flex items-center gap-2 border-t border-slate-50">
                                <Button 
                                    variant="ghost" 
                                    className="w-12 h-12 rounded-2xl font-black text-blue-500 hover:bg-blue-50 p-0"
                                    onClick={() => navigate(`/admin/communities/${item.id}`)}
                                >
                                    <Eye size={20} />
                                </Button>
                                {item.status === 'pending' && (
                                  <>
                                    <Button 
                                        onClick={() => handleStatusUpdate(item.id, 'rejected')}
                                        variant="ghost" 
                                        className="w-12 h-12 rounded-2xl font-black text-rose-500 hover:bg-rose-50 hover:text-rose-600 p-0"
                                    >
                                        <XCircle size={22} />
                                    </Button>
                                    <Button 
                                        onClick={() => handleStatusUpdate(item.id, 'approved')}
                                        className="flex-1 h-12 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black shadow-lg shadow-teal-100"
                                    >
                                        <CheckCircle2 size={18} className="mr-2" />
                                        Approve
                                    </Button>
                                  </>
                                )}
                                {item.status !== 'pending' && (
                                  <Button 
                                      onClick={() => navigate(`/admin/communities/${item.id}`)}
                                      className="flex-1 h-12 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-black"
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
