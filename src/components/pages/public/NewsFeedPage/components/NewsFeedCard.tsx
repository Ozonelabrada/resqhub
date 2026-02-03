import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  MoreHorizontal, 
  CheckCircle, 
  ChevronDown,
  ChevronUp,
  MessageSquare, 
  Share2, 
  Award,
  Send,
  Heart,
  Edit2,
  Trash2,
  ShieldAlert,
  Handshake,
  Clock,
  Search
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  Badge,
  Avatar,
  Menu,
} from '@/components/ui';
import type { MenuRef, MenuItem } from '@/components/ui/Menu/Menu';
import { cn } from "@/lib/utils";
import type { NewsFeedItem, PossibleMatch } from '@/types/personalHub';
import { ReactionsService } from '@/services/reactionsService';
import { ReportsService, type LostFoundItem } from '@/services/reportsService';
import { ReportMatchService } from '@/services/reportMatchService';
import CommentSection from '@/components/features/comments/CommentSection';
import ReportAbuseModal from '@/components/modals/ReportAbuseModal';
import EditReportModal from '@/components/modals/ReportModal/EditReportModal';
import { MatchModal } from '@/components/modals/MatchModal/MatchModal';
import { MatchManagementModal } from '@/components/modals/MatchModal/MatchManagementModal';
import { MatchSuccessModal } from '@/components/modals/MatchModal/MatchSuccessModal';
import { ImageViewerModal } from '@/components/modals/ImageViewerModal';
import { formatCurrencyPHP } from '@/utils/formatter';
import { showToast, getWindowExt } from '@/types/window';
import { safeStopPropagation, extractSyntheticEvent } from '@/types/events';
import type { MenuCommandEvent } from '@/types/events';

interface NewsFeedCardProps {
  item: NewsFeedItem;
  onProfileClick?: (user: NewsFeedItem['user']) => void;
  onCommunityClick?: (communityName: string) => void;
  onReportUpdate?: () => void;
}

const NewsFeedCard: React.FC<NewsFeedCardProps> = ({ item, onProfileClick, onCommunityClick, onReportUpdate }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (item.isAbusive) return null;

  const { isAuthenticated, user, openLoginModal } = useAuth();
  const menuRef = React.useRef<MenuRef>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(item.isReacted || false);
  const [reportReactionsCount, setReportReactionsCount] = useState(item.reactionsCount || 0);
  const [totalCommentsCount, setTotalCommentsCount] = useState(item.commentsCount || 0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMatchesOpen, setIsMatchesOpen] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  // Controls the searchable Match modal (opened when there are no precomputed matches)
  const [isMatchSearchOpen, setIsMatchSearchOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [existingMatch, setExistingMatch] = useState<any>(null);
  const [isShowingExistingMatch, setIsShowingExistingMatch] = useState(false);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [matchToVerify, setMatchToVerify] = useState<any>(null);
  const [selectedMatchForVerification, setSelectedMatchForVerification] = useState<PossibleMatch | null>(null);
  // Match status tracking for User 2 (Found report owner)
  const [matchStatus, setMatchStatus] = useState<'pending' | 'confirmed' | 'resolved' | 'dismissed' | null>(null);
  const [existingMatchId, setExistingMatchId] = useState<number | null>(null);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [isResolvedModalOpen, setIsResolvedModalOpen] = useState(false);
  const [isNoMatchesModalOpen, setIsNoMatchesModalOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  // Ensure boolean result to avoid union types like '' | 0 leaking through
  const isOwner = !!user?.id && String(item.user?.id) === String(user.id);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageViewerOpen(true);
  };

  const handleMenuCommandEdit = (e: MenuCommandEvent): void => {
    safeStopPropagation(e);
    setIsEditModalOpen(true);
  };

  const handleMenuCommandDelete = async (e: MenuCommandEvent): Promise<void> => {
    safeStopPropagation(e);
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        await ReportsService.deleteReport(Number(item.id));
        showToast('success', 'Report Deleted', 'Your report has been removed.');
        window.location.reload();
      } catch (error) {
        console.error('Delete failed:', error);
        showToast('error', 'Delete Failed', 'Could not delete report. Please try again.');
      }
    }
  };

  const handleMenuCommandAbuse = (e: MenuCommandEvent): void => {
    safeStopPropagation(e);
    if (!isAuthenticated) return openLoginModal();
    setIsReportModalOpen(true);
  };

  const menuModel: MenuItem[] = isOwner ? [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: (() => handleMenuCommandEdit({} as MenuCommandEvent)) as () => void
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      command: (() => handleMenuCommandDelete({} as MenuCommandEvent)) as () => void
    }
  ] : [
    {
      label: 'Report Abuse',
      icon: 'pi pi-exclamation-circle',
      command: (() => handleMenuCommandAbuse({} as MenuCommandEvent)) as () => void
    }
  ];

  useEffect(() => {
    if (item.isReacted !== undefined) {
      setIsLiked(item.isReacted);
    }
  }, [item.isReacted]);

  useEffect(() => {
    if (item.reactionsCount !== undefined) {
      setReportReactionsCount(item.reactionsCount);
    }
  }, [item.reactionsCount]);

  useEffect(() => {
    if (item.commentsCount !== undefined) {
      setTotalCommentsCount(item.commentsCount);
    }
  }, [item.commentsCount]);

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'lost': return { label: t('newsfeed.lost'), color: 'bg-orange-50 text-orange-600 border-orange-100 font-black' };
      case 'found': return { label: t('newsfeed.found'), color: 'bg-emerald-50 text-emerald-600 border-emerald-100 font-black' };
      case 'reunited': return { label: t('newsfeed.reunited'), color: 'bg-teal-50 text-teal-600 border-teal-100 font-black' };
      default: return { label: status, color: 'bg-gray-50 text-gray-600 border-gray-100' };
    }
  };

  const status = getStatusDisplay(item.status);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/item/${item.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleOpenMatch = async (e: React.MouseEvent, matchReportId: number | string) => {
    e.stopPropagation();
    
    // Validate both report IDs
    const sourceReportId = Number(item.id);
    const targetReportId = Number(matchReportId);
    
    if (!sourceReportId || sourceReportId === 0) {
      showToast('error', 'Error', 'Source report ID is invalid');
      return;
    }
    
    if (!targetReportId || targetReportId === 0) {
      showToast('error', 'Error', 'Target report ID is invalid');
      return;
    }
    
    setIsLoadingMatch(true);
    try {
      // Fetch the target report (the possible match)
      const targetReport = await ReportsService.getReportById(targetReportId);
      if (!targetReport) {
        showToast('error', 'Error', 'Could not load the matched report');
        return;
      }

      // Check if there's already a saved match between these two reports
      const matchResult = await ReportMatchService.getMatchesForReport(sourceReportId);
      
      if (matchResult.success && matchResult.data && matchResult.data.length > 0) {
        // Check if any existing match is for this specific targetReport
        const existingMatchForThisReport = matchResult.data.find(
          m => m.targetReportId === targetReportId || m.sourceReportId === targetReportId
        );

        if (existingMatchForThisReport) {
          // Normalize incoming entry to unified shape
          const normalized = normalizeMatchEntry(existingMatchForThisReport);
          if (normalized && normalized.status.toLowerCase() === 'confirmed') {
            setExistingMatch(normalized);
            setIsShowingExistingMatch(true);
            return;
          }
          // If it's not confirmed (e.g., pending), continue to allow creating/managing a match
        }
      }

      // No existing match - create the match first, then open MatchManagementModal for verification
      const createResult = await ReportMatchService.createMatch(sourceReportId, targetReportId);
      if (!createResult.success) {
        showToast('error', 'Error', 'Could not create match request');
        return;
      }

      // Use the real match data from the API
      const realMatch = {
        id: createResult.data?.id,
        sourceReport: item,
        targetReport: targetReport,
        actedByUser: targetReport.user,
        status: 'confirmed' // Match is created as confirmed, now needs owner verification
      };
      setMatchToVerify(realMatch);
      setIsMatchModalOpen(true);
    } catch (error) {
      console.error('Error checking matches:', error);
      showToast('error', 'Error', 'Could not load match information');
    } finally {
      setIsLoadingMatch(false);
    }
  };

  const handleOpenMatchButton = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      setIsLoadingMatch(true);

      // Path 1: Report already has a confirmed matchId - Open management modal
      if (item.matchId) {
        try {
          const matchDetailsRes = await ReportMatchService.getMatchById(item.matchId);
          if (matchDetailsRes.success && matchDetailsRes.data) {
            const matchData = matchDetailsRes.data;
            
            // Normalize the match data to the expected format for MatchManagementModal
            const normalizedMatch = {
              id: matchData.match?.id || matchData.id,
              sourceReport: matchData.reportDetails || null,
              targetReport: matchData.matchReportDetails || null,
              actedByUser: matchData.actedByUser || null,
              status: matchData.match?.status || matchData.status || 'confirmed'
            };

            setMatchToVerify(normalizedMatch);
            setIsMatchModalOpen(true);
            return;
          }
        } catch (error) {
          console.error('Error fetching match details:', error);
          showToast('error', 'Error', 'Could not load match details');
          return;
        }
      }

      // Path 2: No matchId - Find possible matches
      // First check if preloaded matches exist
      if (item.possibleMatches && item.possibleMatches.length > 0) {
        setIsMatchesOpen(true);
        return;
      }

      // Otherwise open searchable match modal to find candidates
      setIsMatchSearchOpen(true);
      setIsMatchesOpen(false);

    } catch (err) {
      console.error('Error in match button handler:', err);
      showToast('error', 'Error', 'Could not process match request');
    } finally {
      setIsLoadingMatch(false);
    }
  };

  const handleAction = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    callback();
  };

  const getMatchId = (matchObj: any): number | null => {
    if (!matchObj) return null;
    const id = matchObj.matchId || matchObj.match?.id || matchObj.id || matchObj.match?.matchId || matchObj.match_report_id;
    if (id === undefined || id === null) return null;
    const num = Number(id);
    return Number.isFinite(num) && num > 0 ? num : null;
  };

  const normalizeMatchEntry = (entry: any) => {
    if (!entry) return null;

    // Case: response with structure { match: {...}, reportDetails, matchReportDetails }
    if (entry.match || entry.reportDetails || entry.matchReportDetails) {
      const matchObj = entry.match || {};
      const matchId = matchObj.id ?? matchObj.matchId ?? null;
      return {
        id: matchId !== null ? Number(matchId) : null,
        matchId: matchId !== null ? Number(matchId) : null,
        status: (matchObj.status || '').toString(),
        sourceReport: entry.reportDetails || entry.sourceReport || null,
        targetReport: entry.matchReportDetails || entry.targetReport || null,
        match: matchObj
      };
    }

    // Case: flat match object (previous format)
    const id = entry.id ?? entry.match?.id ?? entry.matchId ?? null;
    return {
      id: id !== null ? Number(id) : null,
      matchId: id !== null ? Number(id) : null,
      status: (entry.status || entry.match?.status || '').toString(),
      sourceReport: entry.sourceReport || null,
      targetReport: entry.targetReport || null,
      match: entry.match || null
    };
  };

  const handleResolveExistingMatch = async () => {
    if (!existingMatch) return;
    const matchId = getMatchId(existingMatch);
    if (!matchId) {
      showToast('error', 'Error', 'Match ID not found');
      return;
    }

    if (!confirm('Are you sure you want to mark this match as resolved? This will close the match.')) return;

    setIsLoadingMatch(true);
    try {
      const res = await ReportMatchService.updateMatchStatus(matchId, 'Resolved', 'I found that the match is true and correct.');
      if (res.success) {
        (window as any).showToast?.('success', 'Match Resolved', 'The match has been marked resolved.');
        setIsShowingExistingMatch(false);
        setExistingMatch(null);
        if (onReportUpdate) onReportUpdate();
      } else {
        (window as any).showToast?.('error', 'Resolve Failed', res.message || 'Could not resolve the match');
      }
    } catch (err) {
      console.error('Error resolving match:', err);
      (window as any).showToast?.('error', 'Resolve Failed', 'An unexpected error occurred');
    } finally {
      setIsLoadingMatch(false);
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (onProfileClick) onProfileClick(item.user);
  };

  const handleCommunityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (onCommunityClick) onCommunityClick(item.communityName || '');
  };

  const handleReportReaction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return openLoginModal();
    if (!item.id || !user?.id) return;

    // Optimistic UI
    const originalIsLiked = isLiked;
    const originalCount = reportReactionsCount;
    
    setIsLiked(!originalIsLiked);
    setReportReactionsCount((prev: number) => originalIsLiked ? prev - 1 : prev + 1);

    try {
      if (originalIsLiked) {
        await ReactionsService.removeReportReaction(Number(item.id), String(user.id));
      } else {
        await ReactionsService.addReportReaction(Number(item.id), String(user.id), 'heart');
      }
    } catch (error) {
      setIsLiked(originalIsLiked);
      setReportReactionsCount(originalCount);
      console.error('Failed to react to report:', error);
    }
  };

  return (
    <Card 
      className="group bg-white border border-gray-100 rounded-2xl md:rounded-[2.5rem] overflow-visible shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col w-full"
    >
      <div 
        className="flex flex-col md:flex-row w-full"
      >
        {/* Image Container - Professional Collage Layout */}
        {item.images && item.images.length > 0 && (
          <div className="relative w-full md:w-[28rem] h-32 sm:h-40 md:h-56 lg:h-64 overflow-hidden bg-gray-100 border-b md:border-b-0 md:border-r border-gray-50">
            
            {/* Dynamic Collage Grid */}
            <div className="w-full h-full grid grid-cols-2 grid-rows-3 gap-0.5">
              {item.images.length === 1 ? (
                // 1 Image: Full container
                <img 
                  loading="lazy"
                  src={item.images[0]} 
                  alt={item.title}
                  onClick={() => handleImageClick(item.images[0])}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 col-span-2 row-span-3 cursor-pointer" 
                />
              ) : item.images.length === 2 ? (
                // 2 Images: Side-by-side full height
                item.images.map((img: string, idx: number) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt="" 
                    onClick={() => handleImageClick(img)}
                    className="w-full h-full object-cover col-span-1 row-span-3 cursor-pointer" 
                  />
                ))
              ) : item.images.length === 3 ? (
                // 3 Images: Enhanced layout - Large main image + 2 stacked images
                <>
                  <img 
                    src={item.images[0]} 
                    alt="" 
                    onClick={() => handleImageClick(item.images[0])}
                    className="w-full h-full object-cover row-span-3 col-span-1 cursor-pointer hover:brightness-110 transition-all duration-300" 
                  />
                  <img 
                    src={item.images[1]} 
                    alt="" 
                    onClick={() => handleImageClick(item.images[1])}
                    className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300" 
                  />
                  <img 
                    src={item.images[2]} 
                    alt="" 
                    onClick={() => handleImageClick(item.images[2])}
                    className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300" 
                  />
                  <div className="col-span-1 row-span-1"></div>
                </>
              ) : item.images.length === 4 ? (
                // 4 Images: Enhanced 2x2 balanced grid with hover effects
                <>
                  <img 
                    src={item.images[0]} 
                    alt="" 
                    onClick={() => handleImageClick(item.images[0])}
                    className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300" 
                  />
                  <img 
                    src={item.images[1]} 
                    alt="" 
                    onClick={() => handleImageClick(item.images[1])}
                    className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300" 
                  />
                  <img 
                    src={item.images[2]} 
                    alt="" 
                    onClick={() => handleImageClick(item.images[2])}
                    className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300" 
                  />
                  <img 
                    src={item.images[3]} 
                    alt="" 
                    onClick={() => handleImageClick(item.images[3])}
                    className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300" 
                  />
                  <div className="col-span-2 row-span-1"></div>
                </>
              ) : item.images.length === 5 ? (
                // 5 Images: Optimized layout - Large main + 2x2 secondary images
                <>
                  <img 
                    src={item.images[0]} 
                    alt="" 
                    onClick={() => handleImageClick(item.images[0])}
                    className="w-full h-full object-cover row-span-3 col-span-1 cursor-pointer hover:brightness-110 transition-all duration-300" 
                  />
                  <img 
                    src={item.images[1]} 
                    alt="" 
                    onClick={() => handleImageClick(item.images[1])}
                    className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300" 
                  />
                  <img 
                    src={item.images[2]} 
                    alt="" 
                    onClick={() => handleImageClick(item.images[2])}
                    className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300" 
                  />
                  <img 
                    src={item.images[3]} 
                    alt="" 
                    onClick={() => handleImageClick(item.images[3])}
                    className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300" 
                  />
                  <img 
                    src={item.images[4]} 
                    alt="" 
                    onClick={() => handleImageClick(item.images[4])}
                    className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300" 
                  />
                </>
              ) : (
                // 6+ Images: Large prominent first image + 2x2 grid + additional images with count overlay
                <>
                  <img 
                    src={item.images[0]} 
                    alt="" 
                    onClick={() => handleImageClick(item.images[0])}
                    className="w-full h-full object-cover row-span-2 col-span-1 cursor-pointer hover:brightness-110 transition-all duration-300" 
                  />
                  <img 
                    src={item.images[1]} 
                    alt="" 
                    onClick={() => handleImageClick(item.images[1])}
                    className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300" 
                  />
                  <img 
                    src={item.images[2]} 
                    alt="" 
                    onClick={() => handleImageClick(item.images[2])}
                    className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300" 
                  />
                  <img 
                    src={item.images[3]} 
                    alt="" 
                    onClick={() => handleImageClick(item.images[3])}
                    className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300" 
                  />
                  <div className="relative w-full h-full object-cover col-span-1 row-span-1 overflow-hidden bg-gray-200 cursor-pointer" onClick={() => handleImageClick(item.images[4])}>
                    <img 
                      src={item.images[4]} 
                      alt="" 
                      className="w-full h-full object-cover hover:brightness-110 transition-all duration-300" 
                    />
                    {item.images.length > 5 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/40 transition-all duration-300">
                        <span className="text-white font-black text-2xl">+{item.images.length - 5}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Badges - Top Overlay */}
            <div className="absolute top-4 left-4 flex gap-2 z-20 pointer-events-none">
              <Badge className={cn("border shadow-md px-4 py-1.5 font-black uppercase text-[10px] tracking-widest rounded-full", status.color)}>
                {status.label}
              </Badge>
              {item.matchId && (
                <Badge className="border shadow-md px-4 py-1.5 font-black uppercase text-[10px] tracking-widest rounded-full bg-emerald-50 text-emerald-600 border-emerald-100">
                  Possible Match
                </Badge>
              )}
            </div>

            {/* Reward Badge - Top Right */}
            {item.reward?.amount > 0 && (
              <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg flex items-center gap-1.5 border border-orange-500 z-20 pointer-events-none">
                <Award className="w-3.5 h-3.5" />
                {formatCurrencyPHP(item.reward.amount)} {t('common.reward')}
              </div>
            )}
          </div>
        )}

        {/* Possible Matches - Moved Outside Image Container */}
        {isOwner && item.possibleMatches && item.possibleMatches.length > 0 && item.images && item.images.length > 0 && (
          <div className="p-4 border-t border-slate-50 bg-slate-50">
            <button
              onClick={(e) => { e.stopPropagation(); setIsMatchesOpen(prev => !prev); }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white shadow-sm hover:shadow-md"
            >
              <span className="text-sm font-black text-slate-700">Possible Matches ({item.possibleMatches.length})</span>
              {isMatchesOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {isMatchesOpen && (
              <div className="mt-3 space-y-2">
                {item.possibleMatches.map((match: PossibleMatch, idx: number) => (
                  <button
                    key={`${match.id}-${idx}`}
                    onClick={(e) => handleOpenMatch(e, match.reportId || match.id)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-white/90 hover:bg-teal-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div className="truncate">
                      <div className="text-sm font-black text-slate-800 truncate">{match.name || match.username || 'Unknown'}</div>
                      <div className="text-xs text-slate-400 truncate">{match.title || match.description || ''}</div>
                    </div>
                    <div className="text-xs text-teal-600 font-black">View</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 md:p-8 flex flex-col">
          <div className="flex justify-between items-start gap-2 w-full">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg md:text-2xl font-black text-slate-900 leading-snug group-hover:text-teal-600 transition-colors uppercase tracking-tight break-words">
                {item.title}
              </h3>
              <div className="flex flex-wrap items-center gap-1 text-slate-500 font-bold text-[8px] sm:text-[9px] md:text-xs mt-1 min-w-0">
                <span className="flex items-center gap-0.5 flex-shrink-0">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4 text-orange-500 flex-shrink-0" />
                  <span className="truncate">{item.location}</span>
                </span>
                <span className="text-slate-300 flex-shrink-0">•</span>
                <span className="flex items-center gap-0.5 flex-shrink-0">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4 text-teal-500 flex-shrink-0" />
                  <span className="flex-shrink-0">{item.timeAgo}</span>
                </span>
              </div>
            </div>
            
            <div className="relative flex-shrink-0 ml-1">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  menuRef.current?.toggle(e);
                }}
                className="p-1 sm:p-1.5 hover:bg-gray-50 rounded-lg md:rounded-xl transition-colors text-slate-400 flex-shrink-0"
              >
                <MoreHorizontal size={16} className="md:w-5 md:h-5" />
              </button>
              <Menu ref={menuRef} model={menuModel} popup className="w-48" />
            </div>
          </div>

          <div className="mt-1.5 sm:mt-2 md:mt-3 mb-2 sm:mb-3 md:mb-6">
            {isDescriptionExpanded ? (
              <p className="text-slate-600 text-[11px] sm:text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
                {item.description}
              </p>
            ) : (
              <p className="text-slate-600 text-[11px] sm:text-sm md:text-base leading-relaxed line-clamp-3">
                {item.description}
              </p>
            )}
            {item.description && item.description.length > 100 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescriptionExpanded(!isDescriptionExpanded);
                }}
                className="text-teal-600 font-black text-[9px] sm:text-xs md:text-sm mt-1.5 hover:text-teal-700 transition-colors inline-block"
              >
                {isDescriptionExpanded ? 'See Less' : 'See More'}
              </button>
            )}
          </div>

          <div className="mt-auto pt-1.5 sm:pt-2 md:pt-4 border-t border-gray-50 flex flex-col w-full">
            {/* User Info Section */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 pb-1.5 sm:pb-2 md:pb-3 min-w-0">
              <div className="relative group/avatar cursor-pointer flex-shrink-0" onClick={handleProfileClick}>
                <Avatar 
                  src={item.user?.profilePicture} 
                  alt={item.user?.fullName}
                  className="w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 border-2 border-white shadow-md ring-1 ring-slate-100 group-hover/avatar:ring-teal-200 transition-all"
                />
                {item.user?.isVerified && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-teal-500 rounded-full border-2 border-white p-0.5 shadow-sm">
                    <CheckCircle className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              <div className="cursor-pointer min-w-0 flex-1" onClick={handleProfileClick}>
                <p className="text-[9px] sm:text-xs md:text-sm font-black text-slate-900 leading-tight hover:text-teal-600 transition-colors truncate">{item.user?.fullName || t('common.anonymous')}</p>
                <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5 min-w-0">
                   <p className="text-[7px] sm:text-[8px] md:text-[11px] font-bold text-slate-400 flex-shrink-0">@{item.user?.username || 'user'}</p>
                   <span className="w-0.5 h-0.5 bg-slate-200 rounded-full flex-shrink-0" />
                   <button 
                     onClick={handleCommunityClick}
                     className="text-[7px] sm:text-[8px] md:text-[11px] font-black text-teal-600 hover:text-teal-700 underline decoration-teal-200 underline-offset-0.5 truncate flex-shrink"
                   >
                     {item.communityName || ''}
                   </button>
                </div>
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="flex items-center gap-1 w-full flex-wrap justify-start">
               <button 
                onClick={handleReportReaction}
                className={cn(
                    "flex items-center gap-0.5 px-1.5 sm:px-2 md:px-4 py-0.5 sm:py-1 md:py-2 rounded-md sm:rounded-lg md:rounded-2xl font-black text-[8px] sm:text-[9px] md:text-xs transition-all whitespace-nowrap",
                    isLiked ? "bg-rose-50 text-rose-600" : "text-slate-400 hover:bg-gray-50 hover:text-rose-500"
                )}
               >
                 <Heart className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0", isLiked && "fill-current")} />
                 <span className="min-w-max">{reportReactionsCount}</span>
               </button>
               <button 
                onClick={(e) => handleAction(e, () => setIsCommentsOpen(!isCommentsOpen))}
                className={cn(
                    "flex items-center gap-0.5 px-1.5 sm:px-2 md:px-4 py-0.5 sm:py-1 md:py-2 rounded-md sm:rounded-lg md:rounded-2xl font-black text-[8px] sm:text-[9px] md:text-xs transition-all whitespace-nowrap",
                    isCommentsOpen ? "bg-teal-50 text-teal-600" : "text-slate-400 hover:bg-gray-50 hover:text-teal-500"
                )}
               >
                 <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                 <span className="min-w-max">{totalCommentsCount}</span>
               </button>
               {/* Possible Matches - Only visible to report owner */}
               {isOwner && (
                 <button 
                  onClick={handleOpenMatchButton}
                  disabled={item.status === 'reunited'}
                  className={cn(
                    "flex items-center gap-0.5 px-1.5 sm:px-2 md:px-4 py-0.5 sm:py-1 md:py-2 rounded-md sm:rounded-lg md:rounded-2xl font-black text-[8px] sm:text-[9px] md:text-xs transition-all whitespace-nowrap",
                    item.status === 'reunited'
                      ? "text-slate-200 cursor-not-allowed bg-slate-50" 
                      : "text-slate-400 hover:bg-orange-50 hover:text-orange-600"
                  )}
                  title={item.status === 'reunited' ? "Report already resolved" : "Find a match for this item"}
                 >
                   <Handshake className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                   <span className="min-w-max">Match</span>
                 </button>
               )}
               <button 
                onClick={handleShare}
                className="p-0.5 sm:p-1 md:p-2 text-slate-400 hover:text-teal-500 transition-colors rounded-md sm:rounded-lg md:rounded-xl hover:bg-teal-50 flex-shrink-0"
               >
                 <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Comments Section */}
      {isCommentsOpen && (
        <div className="border-t border-gray-50 bg-gray-50/30 p-2 sm:p-3 md:p-4 lg:p-6 animate-in slide-in-from-top-2 duration-300 w-full overflow-x-hidden">
          <div className="max-w-3xl mx-auto w-full overflow-hidden">
            <CommentSection 
              itemId={Number(item.id)} 
              itemType={item.status === 'found' ? 'found' : 'lost'} 
              itemOwnerId={Number(item.user?.id) || 0} 
            />
          </div>
        </div>
      )}

      <ReportAbuseModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={Number(item.id || 0)}
        targetType="report"
      />

      <EditReportModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        report={item as unknown as LostFoundItem}
        onSuccess={() => {
          setIsEditModalOpen(false);
          // Refresh the newsfeed to show updated report
          if (onReportUpdate) {
            onReportUpdate();
          }
          showToast('success', 'Report Updated', 'Your report has been successfully updated.');
        }}
      />

      <MatchManagementModal
        isOpen={isMatchModalOpen}
        onClose={() => {
          setIsMatchModalOpen(false);
          setMatchToVerify(null);
        }}
        match={matchToVerify}
        onSuccess={() => {
          // Refresh match status for User 2 (report owner)
          if (matchToVerify?.id) {
            setExistingMatchId(matchToVerify.id);
            setMatchStatus('resolved');
          }
          if (onReportUpdate) {
            onReportUpdate();
          }
        }}
      />

      <MatchModal
        isOpen={isMatchSearchOpen}
        onClose={() => {
          setIsMatchSearchOpen(false);
        }}
        sourceReportId={Number(item.id)}
        sourceReportTitle={item.title}
        sourceReportImages={item.images}
        onMatchSelect={(targetReport) => {
          setIsMatchSearchOpen(false);
          // Optionally open the match management modal with the selected match
        }}
      />

      {/* Existing Match Success Modal */}
      {existingMatch && (
        <MatchSuccessModal
          isOpen={isShowingExistingMatch}
          onClose={() => {
            setIsShowingExistingMatch(false);
            setExistingMatch(null);
          }}
          onShare={() => {
            const message = t('match.share_message') || `Check out this matched item on ResQHub!`;
            if (navigator.share) {
              navigator.share({
                title: 'ResQHub - Matched Item',
                text: message,
                url: window.location.href
              }).catch(console.error);
            } else {
              navigator.clipboard.writeText(message);
              showToast('success', t('common.copied') || 'Copied', 'Message copied to clipboard!');
            }
          }}
          onBackToHub={() => {
            setIsShowingExistingMatch(false);
            setExistingMatch(null);
          }}
          itemTitle={existingMatch.sourceReport?.title || existingMatch.targetReport?.title || 'Item'}
          itemImage={existingMatch.sourceReport?.images?.[0] || existingMatch.targetReport?.images?.[0]}
          isOwner={isOwner}
          onResolve={handleResolveExistingMatch}
          resolveLoading={isLoadingMatch}
        />
      )}

      {/* Pending Match Modal - User 2 sees this when match is under review */}
      {isPendingModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setIsPendingModalOpen(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {t('match.pending_title') || 'Match Under Review'}
                </h3>
                <p className="text-slate-600 font-medium mt-2">
                  {t('match.pending_message') || 'This matched report is currently under review. Please wait for the response.'}
                </p>
              </div>
              <button
                onClick={() => setIsPendingModalOpen(false)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-2xl transition-colors"
              >
                {t('common.close') || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolved Match Modal - User 2 sees this when match is already resolved */}
      {isResolvedModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setIsResolvedModalOpen(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {t('match.resolved_status_title') || 'Match Completed'}
                </h3>
                <p className="text-slate-600 font-medium mt-2">
                  {t('match.resolved_status_message') || 'The match is already resolved. No further actions are allowed.'}
                </p>
              </div>
              <button
                onClick={() => setIsResolvedModalOpen(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl transition-colors"
              >
                {t('common.close') || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Matches Found Modal - User 2 sees this when no candidate matches exist */}
      {isNoMatchesModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setIsNoMatchesModalOpen(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {t('match.no_matches_title') || 'No Matches Found'}
                </h3>
                <p className="text-slate-600 font-medium mt-3 leading-relaxed">
                  {t('match.no_matches_message') || 'No matching reports found yet. Try searching manually to find a match.'}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsNoMatchesModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3 rounded-2xl transition-colors"
                >
                  {t('common.close') || 'Close'}
                </button>
                <button
                  onClick={() => {
                    setIsNoMatchesModalOpen(false);
                    setIsMatchSearchOpen(true);
                  }}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-black py-3 rounded-2xl transition-colors"
                >
                  {t('match.search_manually') || 'Search'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      <ImageViewerModal 
        isOpen={isImageViewerOpen}
        imageUrl={selectedImageUrl}
        imageAlt={item.title}
        onClose={() => setIsImageViewerOpen(false)}
      />
    </Card>
  );
};

export default NewsFeedCard;
