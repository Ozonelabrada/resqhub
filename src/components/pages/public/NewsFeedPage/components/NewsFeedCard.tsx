import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  MoreHorizontal, 
  CheckCircle, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Award,
  Send
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import {
  Button,
  Card,
  Input,
  Badge,
  Avatar
} from '@/components/ui';
import { cn } from "@/lib/utils";
import type { NewsFeedItem } from '../../PersonalHubPage/personalHub/NewsFeed';

interface NewsFeedCardProps {
  item: NewsFeedItem;
  onProfileClick?: (user: any) => void;
  onCommunityClick?: (communityName: string) => void;
}

const NewsFeedCard: React.FC<NewsFeedCardProps> = ({ item, onProfileClick, onCommunityClick }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, openLoginModal } = useAuth();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'lost': return { label: t('newsfeed.lost'), color: 'bg-orange-50 text-orange-600 border-orange-100 font-black' };
      case 'found': return { label: t('newsfeed.found'), color: 'bg-emerald-50 text-emerald-600 border-emerald-100 font-black' };
      case 'reunited': return { label: t('newsfeed.reunited'), color: 'bg-teal-50 text-teal-600 border-teal-100 font-black' };
      default: return { label: status, color: 'bg-gray-50 text-gray-600 border-gray-100' };
    }
  };

  const status = getStatusDisplay(item.status);

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
    if (onCommunityClick) onCommunityClick(item.communityName || 'Green Valley Residents');
  };

  return (
    <Card 
      className="group bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div 
        onClick={() => navigate(`/item/${item.id}`)}
        className="flex flex-col md:flex-row cursor-pointer"
      >
        {/* Image Container */}
        <div className="relative w-full md:w-[28rem] h-64 md:h-80 overflow-hidden bg-gray-100 border-r border-gray-50">
          {item.images && item.images.length > 0 ? (
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
                item.images.map((img, idx) => (
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
                    {item.images.slice(1).map((img, idx) => (
                      <img key={idx} src={img} alt="" className="w-full h-full object-cover" />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
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
              ${item.reward.amount} {t('common.reward')}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-8 flex flex-col">
          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="flex-1">
              <h3 className="text-2xl font-black text-slate-900 leading-none group-hover:text-teal-600 transition-colors uppercase tracking-tight mb-2">
                {item.title}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-slate-500 font-bold text-xs">
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
            <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-slate-400">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <p className="text-slate-600 line-clamp-2 text-base mt-2 leading-relaxed mb-8">
            {item.description}
          </p>

          <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
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
                     {item.communityName || 'Green Valley'}
                   </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
               <button 
                onClick={(e) => handleAction(e, () => setIsLiked(!isLiked))}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs transition-all",
                    isLiked ? "bg-orange-50 text-orange-600" : "text-slate-400 hover:bg-gray-50 hover:text-orange-500"
                )}
               >
                 <ThumbsUp className={cn("w-4 h-4", isLiked && "fill-current")} />
                 <span>24</span>
               </button>
               <button 
                onClick={(e) => handleAction(e, () => setIsCommentsOpen(!isCommentsOpen))}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs transition-all",
                    isCommentsOpen ? "bg-teal-50 text-teal-600" : "text-slate-400 hover:bg-gray-50 hover:text-teal-500"
                )}
               >
                 <MessageSquare className="w-4 h-4" />
                 <span>8</span>
               </button>
               <button 
                onClick={(e) => handleAction(e, () => {})}
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
        <div className="border-t border-gray-50 bg-gray-50/30 p-8 animate-in slide-in-from-top-2 duration-300">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex gap-4">
              <Avatar className="w-10 h-10 border-2 border-white shadow-sm flex-shrink-0" />
              <div className="flex-1 relative">
                <Input 
                   placeholder="Add a helpful comment..." 
                   value={commentText}
                   onChange={(e) => setCommentText(e.target.value)}
                   className="pr-12 py-6 rounded-2xl border-gray-200 bg-white shadow-sm font-medium"
                />
                <Button 
                   size="icon" 
                   className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 w-10 transition-transform active:scale-90"
                   disabled={!commentText.trim()}
                   onClick={() => {
                     if (!isAuthenticated) {
                       openLoginModal();
                       return;
                     }
                     // Send comment logic here
                   }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mock Threads */}
            <div className="space-y-6 pt-2">
               {[1, 2].map(i => (
                 <div key={i} className="flex gap-4 group">
                   <Avatar className="w-8 h-8 flex-shrink-0" />
                   <div className="flex-1 space-y-2">
                     <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-black text-slate-900 tracking-tight">Community Member {i}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">2h ago</span>
                       </div>
                       <p className="text-sm text-slate-600 leading-relaxed">
                         I think I saw something similar near the central park yesterday! {i === 1 ? "Hope you find it soon." : "Check the security office."}
                       </p>
                     </div>
                     <div className="flex items-center gap-4 px-2">
                       <button className="text-[10px] font-black text-slate-400 hover:text-teal-600 uppercase tracking-widest">Reply</button>
                       <button className="text-[10px] font-black text-slate-400 hover:text-orange-600 uppercase tracking-widest">Helpful (3)</button>
                     </div>
                     
                     {i === 1 && (
                       <div className="ml-8 pt-4 border-l-2 border-gray-100 pl-4 space-y-4">
                         <div className="flex gap-3">
                           <Avatar className="w-6 h-6 flex-shrink-0" />
                           <div className="flex-1">
                             <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                               <p className="text-xs text-slate-600">Thanks for the tip! I'll check there today.</p>
                             </div>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
               ))}
            </div>
            
            <Button variant="ghost" className="w-full py-4 text-xs font-bold text-slate-400 hover:text-teal-600 uppercase tracking-widest">
                Load more comments
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default NewsFeedCard;
