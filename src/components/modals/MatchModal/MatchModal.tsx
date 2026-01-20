import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  Button,
  Spinner,
  Badge,
  Avatar
} from '../../ui';
import { 
  Search, 
  CheckCircle2, 
  Plus, 
  AlertCircle,
  ArrowRight,
  MapPin,
  Calendar,
  Layers,
  Link as LinkIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ReportsService, type LostFoundItem } from '../../../services/reportsService';
import { ReportMatchService } from '../../../services/reportMatchService';
import { useAuth } from '../../../context/AuthContext';
import { cn } from '../../../lib/utils';
import { formatCurrencyPHP } from '../../../utils/formatter';
import { CreateReportModal } from '../ReportModal/CreateReportModal';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: any; // NewsFeedItem or LostFoundItem
}

export const MatchModal: React.FC<MatchModalProps> = ({ isOpen, onClose, report }) => {
  const { t } = useTranslation();
  const { isAuthenticated, openLoginModal } = useAuth();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<LostFoundItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && report) {
      fetchCandidates();
    }
  }, [isOpen, report]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      // Find opposite type
      const oppositeType = String(report.status).toLowerCase() === 'found' ? 'lost' : 'found';
      
      // Fetch reports of opposite type that might match
      const results = await ReportsService.getReports({
        reportType: oppositeType,
        pageSize: 10,
        status: 'active'
      });
      
      // Filter candidates (simple heuristic for now: same category or similar title)
      // Realistic matching would happen on backend
      const filtered = results.filter(item => item.id !== report.id);
      setCandidates(filtered);
    } catch (error) {
      console.error('Error fetching match candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSelect = async (candidateId: number) => {
    try {
      // 1. Create the match link
      const createRes = await ReportMatchService.createMatch(report.id, candidateId);
      
      if (createRes.success) {
        const matchId = createRes.data?.id;
        
        // 2. Automatically update status to 'confirmed' as per requirement
        if (matchId) {
          await ReportMatchService.updateMatchStatus(matchId, 'confirmed', 'Match initiated from search');
        }
        
        (window as any).showToast?.('success', 'Match Request Sent', 'Waiting for confirmation from the owner.');
      } else {
        (window as any).showToast?.('error', 'Match Failed', createRes.message || 'Could not initiate match.');
      }
    } catch (error) {
      console.error('Match selection error:', error);
      (window as any).showToast?.('error', 'Match Failed', 'An unexpected error occurred.');
    } finally {
      onClose();
    }
  };

  const handleCreateProofPost = () => {
    if (!isAuthenticated) return openLoginModal();
    setIsCreateModalOpen(true);
  };

  const oppositeTypeLabel = report.status === 'found' ? 'Lost' : 'Found';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[600px] bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="p-8 pb-4">
            <DialogHeader className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                  <Layers size={24} />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black text-slate-900">Possible Matches</DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium">
                    Link this report to an existing {oppositeTypeLabel.toLowerCase()} report
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selected Report</p>
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                  {report.images?.[0] ? (
                    <img src={report.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Layers size={20} />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-slate-900">{report.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={cn(
                      "text-[9px] font-black uppercase px-2 py-0 border-none",
                      report.status === 'found' ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
                    )}>
                      {report.status}
                    </Badge>
                    <span className="text-xs text-slate-400">{report.location}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto px-1 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Spinner size="lg" className="text-teal-600 mb-4" />
                  <p className="text-slate-400 font-bold">Scanning for matches...</p>
                </div>
              ) : candidates.length > 0 ? (
                candidates.map((candidate) => (
                  <div 
                    key={candidate.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50 transition-all group flex items-center gap-4"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      {candidate.images?.[0]?.imageUrl ? (
                        <img src={candidate.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Layers size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h5 className="font-black text-slate-900 truncate">{candidate.title}</h5>
                        {candidate.rewardDetails && (
                          <span className="text-[10px] font-black text-emerald-600 whitespace-nowrap">
                            Reward Available
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-bold">
                        <span className="flex items-center gap-1.5 shrink-0">
                          <MapPin size={12} className="text-orange-400" />
                          {candidate.location}
                        </span>
                        <span className="flex items-center gap-1.5 truncate">
                          <Calendar size={12} className="text-teal-400" />
                          {new Date(candidate.dateCreated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black"
                      onClick={() => handleMatchSelect(candidate.id)}
                    >
                      Match
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                    <Search size={32} />
                  </div>
                  <h5 className="text-slate-800 font-black">No candidates found</h5>
                  <p className="text-slate-400 text-sm font-medium px-8 mt-1">
                    We couldn't find any current {oppositeTypeLabel.toLowerCase()} reports that match.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 pt-4 bg-slate-50/50 border-t border-slate-100">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-6 bg-white rounded-[2rem] border border-teal-100 shadow-sm w-full">
                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={24} />
                </div>
                <h5 className="text-slate-900 font-black">Don't see your report?</h5>
                <p className="text-slate-500 text-sm font-medium mt-1 mb-4 leading-relaxed">
                  If this is your item but you haven't posted a {oppositeTypeLabel.toLowerCase()} report yet, create one now to claim it.
                </p>
                <Button 
                   onClick={handleCreateProofPost}
                   className="w-full h-12 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black shadow-lg shadow-teal-100"
                >
                  <Plus size={18} className="mr-2" />
                  Create {oppositeTypeLabel} Report
                  <ArrowRight size={16} className="ml-auto" />
                </Button>
              </div>
              
              <button 
                onClick={onClose}
                className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
              >
                Close and search manually
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateReportModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialType={oppositeTypeLabel}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchCandidates();
        }}
      />
    </>
  );
};
