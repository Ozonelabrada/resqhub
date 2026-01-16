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
  ShieldAlert
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
import type { NewsFeedItem } from '@/types/personalHub';
import { ReactionsService } from '@/services/reactionsService';
import { ReportsService, type LostFoundItem } from '@/services/reportsService';
import CommentSection from '@/components/features/comments/CommentSection';
import ReportAbuseModal from '@/components/modals/ReportAbuseModal';
import EditReportModal from '@/components/modals/ReportModal/EditReportModal';

import { formatCurrencyPHP } from '@/utils/formatter';

interface NewsFeedCardProps {
  item: NewsFeedItem;
  onProfileClick?: (user: any) => void;
  onCommunityClick?: (communityName: string) => void;
}

const NewsFeedCard: React.FC<NewsFeedCardProps> = ({ item, onProfileClick, onCommunityClick }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if ((item as any).isAbusive) return null;

  const { isAuthenticated, user, openLoginModal } = useAuth();
  const menuRef = React.useRef<MenuRef>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(item.isReacted || false);
  const [reportReactionsCount, setReportReactionsCount] = useState(item.reactionsCount || 0);
  const [totalCommentsCount, setTotalCommentsCount] = useState(item.commentsCount || 0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMatchesOpen, setIsMatchesOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const isOwner = user?.id && String(item.user?.id) === String(user.id);

  const menuModel: MenuItem[] = isOwner ? [
    {
      label: 'Update Report',
      icon: <Edit2 size={14} className="text-teal-600" />,
      command: () => {
        setIsEditModalOpen(true);
      }
    },
    {
      label: 'Delete Report',
      icon: <Trash2 size={14} className="text-rose-500" />,
      command: async () => {
        if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
          try {
            await ReportsService.deleteReport(Number(item.id));
            (window as any).showToast?.('success', 'Report Deleted', 'Your report has been removed.');
            // Ideally trigger a refresh in parent
            window.location.reload(); 
          } catch (error) {
            (window as any).showToast?.('error', 'Delete Failed', 'Could not delete report. Please try again.');
          }
        }
      }
    }
  ] : [
    {
      label: 'Report Abuse',
      icon: <ShieldAlert size={14} className="text-orange-600" />,
      command: () => {
        if (!isAuthenticated) return openLoginModal();
        setIsReportModalOpen(true);
      }
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

  const handleOpenMatch = (e: React.MouseEvent, matchReportId: number | string) => {
    e.stopPropagation();
    // Navigate to matched report detail and include candidateFor query param
    navigate(`/reports/${matchReportId}?candidateFor=${item.id}`);
  };

  const handleAction = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    callback();
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
      className="group bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div 
        onClick={() => navigate(`/reports/${item.id}`)}
        className="flex flex-col md:flex-row cursor-pointer"
      >
        {/* Image Container */}
        <div className="relative w-full md:w-[28rem] h-64 md:h-80 min-h-[16rem] md:min-h-[20rem] overflow-hidden bg-gray-100 border-r border-gray-50">
          {item.images && item.images.length > 0 ? (<>

          {/* Possible Matches */}
          {Array.isArray((item as any).possibleMatches) && (item as any).possibleMatches.length > 0 && (
            <div className="p-4 border-t border-slate-50 bg-slate-50">
              <button
                onClick={(e) => { e.stopPropagation(); setIsMatchesOpen(prev => !prev); }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white shadow-sm hover:shadow-md"
              >
                <span className="text-sm font-black text-slate-700">Possible Matches ({(item as any).possibleMatches.length})</span>
                {isMatchesOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {isMatchesOpen && (
                <div className="mt-3 space-y-2">
                  {((item as any).possibleMatches as Array<any>).map((match, idx) => (
                    <button
                      key={idx}
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
            <div className={cn(
              "w-full h-full grid gap-0.5",
              item.images.length === 1 ? "grid-cols-1" : 
              item.images.length === 2 ? "grid-cols-2" :
              "grid-cols-2" 
            )}>
              {item.images.length === 1 ? (
                <img 
                  loading="lazy"
                  src={item.images[0]} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              ) : item.images.length === 2 ? (
                item.images.map((img: string, idx: number) => (
                  <img key={idx} src={img} alt="" className="w-full h-full object-cover" />
                ))
              ) : (
                <>
                  <div className="h-full">
                    <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className={cn(
                    "grid gap-0.5 h-full",
                    item.images.length === 3 ? "grid-rows-2" : 
                    item.images.length === 4 ? "grid-rows-3" : 
                    "grid-cols-2 grid-rows-2"
                  )}>
                    {item.images.slice(1).map((img: string, idx: number) => (
                      <img key={idx} src={img} alt="" className="w-full h-full object-cover" />
                    ))}
                  </div>
                </>
              )}
            </div>
          </>) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 p-4 text-center">
              <Plus className="w-10 h-10 mb-2 opacity-20" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-black">No Image</span>
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className={cn("border shadow-md px-4 py-1.5 font-black uppercase text-[10px] tracking-widest rounded-full", status.color)}>
                {status.label}
            </Badge>
          </div>
          {item.reward?.amount > 0 && (
            <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg flex items-center gap-1.5 border border-orange-500">
              <Award className="w-3.5 h-3.5" />
              {formatCurrencyPHP(item.reward.amount)} {t('common.reward')}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-8 flex flex-col">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <h3 className="text-2xl font-black text-slate-900 leading-none group-hover:text-teal-600 transition-colors uppercase tracking-tight">
                {item.title}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-slate-500 font-bold text-xs mt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  {item.location}
                </span>
                <span className="text-slate-200">|</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-500" />
                  {item.timeAgo}
                </span>
              </div>
            </div>
            
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  menuRef.current?.toggle(e);
                }}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-slate-400"
              >
                <MoreHorizontal size={20} />
              </button>
              <Menu ref={menuRef} model={menuModel} popup className="w-48" />
            </div>
          </div>

          <div className="mt-3 mb-6">
            {isDescriptionExpanded ? (
              <p className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap break-words">
                {item.description}
              </p>
            ) : (
              <p className="text-slate-600 text-base leading-relaxed line-clamp-2">
                {item.description}
              </p>
            )}
            {item.description && item.description.length > 100 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescriptionExpanded(!isDescriptionExpanded);
                }}
                className="text-teal-600 font-black text-sm mt-2 hover:text-teal-700 transition-colors"
              >
                {isDescriptionExpanded ? 'See Less' : 'See More'}
              </button>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group/avatar cursor-pointer" onClick={handleProfileClick}>
                <Avatar 
                  src={item.user?.profilePicture} 
                  alt={item.user?.fullName}
                  className="w-10 h-10 border-2 border-white shadow-md ring-1 ring-slate-100 group-hover/avatar:ring-teal-200 transition-all"
                />
                {item.user?.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full border-2 border-white p-0.5 shadow-sm">
                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <div className="cursor-pointer" onClick={handleProfileClick}>
                <p className="text-sm font-black text-slate-900 leading-none hover:text-teal-600 transition-colors">{item.user?.fullName || t('common.anonymous')}</p>
                <div className="flex items-center gap-2 mt-1">
                   <p className="text-[11px] font-bold text-slate-400">@{item.user?.username || 'user'}</p>
                   <span className="w-1 h-1 bg-slate-200 rounded-full" />
                   <button 
                     onClick={handleCommunityClick}
                     className="text-[11px] font-black text-teal-600 hover:text-teal-700 underline decoration-teal-200 underline-offset-2"
                   >
                     {item.communityName || ''}
                   </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
               <button 
                onClick={handleReportReaction}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs transition-all",
                    isLiked ? "bg-rose-50 text-rose-600" : "text-slate-400 hover:bg-gray-50 hover:text-rose-500"
                )}
               >
                 <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                 <span>{reportReactionsCount}</span>
               </button>
               <button 
                onClick={(e) => handleAction(e, () => setIsCommentsOpen(!isCommentsOpen))}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs transition-all",
                    isCommentsOpen ? "bg-teal-50 text-teal-600" : "text-slate-400 hover:bg-gray-50 hover:text-teal-500"
                )}
               >
                 <MessageSquare className="w-4 h-4" />
                 <span>{totalCommentsCount}</span>
               </button>
               <button 
                onClick={handleShare}
                className="p-2 text-slate-400 hover:text-teal-500 transition-colors rounded-xl hover:bg-teal-50"
               >
                 <Share2 className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Comments Section */}
      {isCommentsOpen && (
        <div className="border-t border-gray-50 bg-gray-50/30 p-4 md:p-6 animate-in slide-in-from-top-2 duration-300">
          <div className="max-w-3xl mx-auto">
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
        targetId={item.id}
        targetType="report"
      />

      <EditReportModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        report={item as any}
        onSuccess={() => {
          // Ideally we'd refresh the feed or update the item state
          window.location.reload();
        }}
      />
    </Card>
  );
};

export default NewsFeedCard;
