import React, { useState, useEffect } from 'react';
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
  MessageSquare, 
  Eye, 
  AlertCircle,
  TrendingUp,
  Inbox,
  Banknote,
  Container
} from 'lucide-react';
import { CommunityService } from '../../../services/communityService';
import type { Community } from '@/types/community';
import { SITE } from '@/constants/site';
import { formatCurrencyPHP } from '@/utils/formatter';

const CommunityManagementPage: React.FC = () => {
  const [pending, setPending] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await CommunityService.getPendingCommunities();
      setPending(data);
    } catch (error) {
      console.error('Failed to fetch pending communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    const success = await CommunityService.updateStatus(id, status);
    if (success) {
      setPending(pending.filter(c => c.id !== id));
      (window as any).showToast?.('success', 'Status Updated', `Community has been ${status}.`);
    } else {
      (window as any).showToast?.('error', 'Update Failed', 'Could not update community status.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <Container size="full" className="max-w-[1400px]">
        {/* Header Section */}
        <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Community Oversight</h1>
                    <p className="text-slate-500 font-medium">Review and manage community creation requests from {SITE.name} members.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Growth</p>
                            <p className="text-lg font-black text-slate-800">+12%</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Review</p>
                            <p className="text-lg font-black text-slate-800">{pending.length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <Banknote size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Earnings</p>
                            <p className="text-lg font-black text-slate-800">{formatCurrencyPHP(1420)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

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
            ) : pending.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Inbox className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">Queue is Empty</h3>
                    <p className="text-slate-400 font-medium">All pending communities have been processed.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pending.map(item => (
                        <Card key={item.id} className="group border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden flex flex-col transition-all hover:translate-y-[-4px]">
                            <div className="p-8 pb-4">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-teal-50 flex items-center justify-center">
                                        <Users className="text-teal-600" size={32} />
                                    </div>
                                    <Badge className="bg-amber-100 text-amber-700 border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase">
                                        Pending Review
                                    </Badge>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2 truncate">{item.name}</h3>
                                <p className="text-slate-500 font-medium text-sm line-clamp-3 mb-6 leading-relaxed">
                                    {item.description}
                                </p>
                                
                                <div className="space-y-4 pt-6 border-t border-slate-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8 rounded-xl border border-white shadow-sm">U</Avatar>
                                            <span className="text-xs font-bold text-slate-600">Requester ID: ...{item.id.slice(-4)}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase">2h ago</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto p-4 bg-slate-50/50 flex items-center gap-2 border-t border-slate-50">
                                <Button 
                                    variant="ghost" 
                                    className="w-12 h-12 rounded-2xl font-black text-blue-500 hover:bg-blue-50 p-0"
                                    onClick={() => (window as any).showToast?.('info', 'Chat Initiated', 'Redirecting to messaging...')}
                                >
                                    <MessageSquare size={20} />
                                </Button>
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
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </Tabs>
      </Container>
    </div>
  );
};

export default CommunityManagementPage;
