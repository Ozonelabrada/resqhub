import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  Button,
  Badge,
  Spinner,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '../../ui';
import { Modal } from '../../ui/Modal/Modal';
import { ShieldAlert, CheckCircle2, XCircle, Clock, Eye, MessageSquare, FileText, ChevronRight, AlertTriangle, UserPlus, Check, X, MessageCircle } from 'lucide-react';
import { ReportAbuseService, type ReportAbuseResponse } from '@/services/reportAbuseService';
import { ReportsService } from '@/services/reportsService';
import { CommentsService } from '@/services/commentsService';
import { CommunityService } from '@/services/communityService';
import { MessagesService } from '@/services/messagesService';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/utils/formatter';
import type { JoinRequest } from '@/types/community';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface ModerationOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId?: string | number;
}

const ModerationOverviewModal: React.FC<ModerationOverviewModalProps> = ({ isOpen, onClose, communityId }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'abuse' | 'joins'>('abuse');
  const [reports, setReports] = useState<ReportAbuseResponse[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportAbuseResponse | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchReports = async () => {
    try {
      const data = await ReportAbuseService.getAllReports({ communityId });
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch abuse reports:', error);
      setReports([]);
    }
  };

  const fetchJoinRequests = async () => {
    if (!communityId) return;
    try {
      const data = await CommunityService.getJoinRequests(Number(communityId));
      setJoinRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch join requests:', error);
      setJoinRequests([]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchReports(), fetchJoinRequests()]);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, communityId]);

  const handleApproveRequest = async (requestId: number) => {
    setProcessingId(requestId);
    try {
      const success = await CommunityService.approveJoinRequest(requestId);
      if (success) {
        toast.success('Member approved');
        await fetchJoinRequests();
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    setProcessingId(requestId);
    try {
      const success = await CommunityService.rejectJoinRequest(requestId);
      if (success) {
        toast.success('Request rejected');
        await fetchJoinRequests();
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleDirectChat = async (userId: string, userName: string) => {
    try {
      const result = await MessagesService.sendMessage({
        directMessageReceiverId: userId,
        content: `Halo ${userName}, I'm the moderator of the community. I'd like to ask a few questions about your join request.`,
        isGroupMessage: false
      });
      if (result) {
        toast.success('Conversation started');
        onClose();
        navigate('/messages');
      }
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const handleUpdateStatus = async (report: ReportAbuseResponse, newStatus: 'Rejected' | 'Closed') => {
    setProcessingId(report.id);
    try {
      const result = await ReportAbuseService.updateStatus(report.id, newStatus);
      
      if (result.success) {
        if (newStatus === 'Closed') {
          // If Closed, mark the actual content as abusive
          if (report.reportId) {
            await ReportsService.markAsAbusive(report.reportId);
          } else if (report.commentId) {
            await CommentsService.markAsAbusive(report.commentId);
          }
        }
        
        // Refresh list
        await fetchReports();
        if (selectedReport?.id === report.id) {
          setSelectedReport(null);
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>;
      case 'Under Review': return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Reviewing</Badge>;
      case 'Resolved': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Resolved</Badge>;
      case 'Rejected': return <Badge className="bg-slate-100 text-slate-600 border-slate-200">Rejected</Badge>;
      case 'Closed': return <Badge className="bg-rose-100 text-rose-700 border-rose-200">Closed (Removed)</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="xl"
      className="p-0 border-none rounded-[2.5rem] bg-slate-50 overflow-hidden"
    >
      <div className="flex h-[80vh]">
        {/* Sidebar: List of Reports */}
        <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-50 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Moderation</h2>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('abuse')}
                className={cn(
                  "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  activeTab === 'abuse' ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Abuse ({reports.length})
              </button>
              <button 
                onClick={() => setActiveTab('joins')}
                className={cn(
                  "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  activeTab === 'joins' ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Joins ({joinRequests.filter(r => r.status === 'Pending').length})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full py-10">
                <Spinner size="md" className="text-teal-600" />
                <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">Loading...</p>
              </div>
            ) : activeTab === 'abuse' ? (
              !Array.isArray(reports) || reports.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm font-bold text-slate-400 italic">No reports found.</p>
                </div>
              ) : (
                reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl transition-all border group",
                      selectedReport?.id === report.id 
                        ? "bg-teal-50 border-teal-100 shadow-sm" 
                        : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        #{report.id} • {report.reportId ? 'Report' : 'Comment'}
                      </span>
                      {getStatusBadge(report.status)}
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">{report.reason}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mb-3">{report.details}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <Clock size={12} />
                      {formatDistanceToNow(new Date(report.dateCreated), { addSuffix: true })}
                    </div>
                  </button>
                ))
              )
            ) : (
              /* Join Requests in Sidebar */
              joinRequests.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm font-bold text-slate-400 italic">No join requests.</p>
                </div>
              ) : (
                joinRequests.map((request) => (
                  <div
                    key={request.id}
                    className="w-full p-4 rounded-2xl bg-white border border-slate-100 hover:border-teal-200 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500">
                        {request.userFullName?.charAt(0) || request.userName?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{request.userFullName}</h4>
                        <p className="text-[10px] font-bold text-slate-400">@{request.userName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleDirectChat(request.userId, request.userFullName)}
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest gap-1 border-slate-100"
                      >
                         <MessageCircle size={12} /> Chat
                      </Button>
                      <Button
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={!!processingId}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 px-0 rounded-lg border-slate-100 text-rose-500 hover:bg-rose-50"
                      >
                        {processingId === request.id ? <Spinner size="sm" /> : <X size={14} />}
                      </Button>
                      <Button
                        onClick={() => handleApproveRequest(request.id)}
                        disabled={!!processingId}
                        size="sm"
                        className="h-8 w-8 px-0 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        {processingId === request.id ? <Spinner size="sm" /> : <Check size={14} />}
                      </Button>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Main Content: Details */}
        <div className="flex-1 overflow-y-auto bg-slate-50 relative">
          {activeTab === 'abuse' ? (
            selectedReport ? (
              <div className="p-8 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{selectedReport.reason}</h3>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(selectedReport.status)}
                      <span className="text-sm text-slate-400 font-medium">
                        Reported by User <b>@{selectedReport.user.username}</b>
                      </span>
                    </div>
                  </div>
                  
                  {selectedReport.status === 'Pending' && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        className="rounded-xl border-slate-200 font-bold hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all"
                        onClick={() => handleUpdateStatus(selectedReport, 'Rejected')}
                        disabled={!!processingId}
                      >
                        {processingId === selectedReport.id ? <Spinner size="sm" /> : <XCircle className="mr-2 w-4 h-4" />}
                        Reject
                      </Button>
                      <Button 
                        className="rounded-xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-200 transition-all hover:bg-slate-800"
                        onClick={() => handleUpdateStatus(selectedReport, 'Closed')}
                        disabled={!!processingId}
                      >
                        {processingId === selectedReport.id ? <Spinner size="sm" /> : <CheckCircle2 className="mr-2 w-4 h-4" />}
                        Close & Remove Post
                      </Button>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Report Details</h4>
                  <p className="text-slate-700 font-medium leading-relaxed italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    "{selectedReport.details || 'No additional details provided.'}"
                  </p>
                </div>

                {/* Reported Content Preview */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reported Content</h4>
                  
                  {selectedReport.reportId ? (
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                      <div className="flex justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <FileText size={20} className="text-slate-400" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900">Post #{selectedReport.reportId}</p>
                            <p className="text-xs text-slate-400 font-medium italic">Referenced Item</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-teal-600 font-bold" onClick={() => window.open(`/item/${selectedReport.reportId}`, '_blank')}>
                          <Eye size={16} className="mr-2" />
                          View Full Post
                        </Button>
                      </div>
                      {/* Simplified Preview of the Post if available in the report object */}
                      {selectedReport.report && (
                         <div className="border-t border-slate-50 pt-4 mt-4">
                            <h5 className="font-black text-lg text-slate-800 mb-1">{selectedReport.report.title}</h5>
                            <p className="text-sm text-slate-500 line-clamp-3">{selectedReport.report.description}</p>
                         </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                      <div className="flex justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <MessageSquare size={20} className="text-slate-400" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900">Comment #{selectedReport.commentId}</p>
                            <p className="text-xs text-slate-400 font-medium italic">Referenced Comment</p>
                          </div>
                        </div>
                      </div>
                      {/* Simplified Preview of the Comment if available in the report object */}
                      {selectedReport.comment ? (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-slate-700 font-medium">"{selectedReport.comment.comment}"</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tight">By: {selectedReport.comment.user?.username || 'Unknown'}</p>
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                           <AlertTriangle size={24} className="text-slate-300 mx-auto mb-2" />
                           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Content Metadata Missing</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {selectedReport.status === 'Closed' && (
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3 text-rose-700">
                    <CheckCircle2 size={18} />
                    <p className="text-sm font-bold">This content has been marked as abusive and is hidden from the platform.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6">
                  <ShieldAlert className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Select a Report</h3>
                <p className="text-slate-500 font-medium max-w-[300px]">
                  Review reported content to keep the community safe.
                </p>
              </div>
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white">
              <div className="w-24 h-24 bg-teal-50 rounded-[2rem] flex items-center justify-center mb-6 text-teal-600 shadow-xl shadow-teal-500/10">
                <UserPlus size={48} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Member Verification</h3>
              <p className="text-slate-500 font-medium max-w-md mx-auto">
                Review and manage users who want to join your community. Use the direct chat option to verify their identity if needed.
              </p>
              
              <div className="mt-12 grid grid-cols-2 gap-6 w-full max-w-lg">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <p className="text-4xl font-black text-slate-900 mb-2">{joinRequests.filter(r => r.status === 'Pending').length}</p>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending Requests</p>
                </div>
                <div className="bg-teal-50 p-8 rounded-[2.5rem] border border-teal-100 shadow-sm">
                  <p className="text-4xl font-black text-teal-700 mb-2">{joinRequests.filter(r => r.status === 'Approved').length}</p>
                  <p className="text-xs font-black text-teal-600 uppercase tracking-widest">Total Approved</p>
                </div>
              </div>
              
              <div className="mt-12 p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 w-full max-w-lg">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Quick Tip</p>
                <p className="text-sm text-slate-600 font-medium italic">
                  "Verifying members through direct chat helps prevent spam and ensures high-quality community interactions."
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModerationOverviewModal;
