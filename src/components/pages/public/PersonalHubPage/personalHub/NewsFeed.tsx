import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Button, 
  Avatar, 
  Spinner, 
  StatusBadge, 
  Badge, 
  ImageGallery, 
  Textarea, 
  Modal, 
  Toast, 
  type ToastRef
} from '../../../../ui';
import { 
  CheckCircle, 
  Star, 
  Heart, 
  MapPin, 
  Calendar, 
  Tag, 
  Gift, 
  MessageSquare, 
  Bell, 
  Bookmark, 
  Share2, 
  Image as ImageIcon,
  Facebook,
  Twitter,
  Link as LinkIcon
} from 'lucide-react';
import type { UserReport } from '../../../../../types/personalHub';

export interface NewsFeedItem extends UserReport {
  user: {
    id: string;
    fullName: string;
    username: string;
    profilePicture?: string;
    isVerified?: boolean;
  };
  communityName?: string;
  timeAgo: string;
  status: 'lost' | 'found' | 'reunited';
}

interface NewsFeedProps {
  items: NewsFeedItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onItemClick?: (item: NewsFeedItem) => void;
  onContactClick?: (item: NewsFeedItem) => void;
  onWatchClick?: (item: NewsFeedItem) => void;
  onProfileClick?: (userId: string) => void;
  onCommentClick?: (item: NewsFeedItem) => void;
  onShareClick?: (item: NewsFeedItem) => void;
  className?: string;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({
  items,
  onItemClick,
  className = ""
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [commentSections, setCommentSections] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState('');
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const toast = useRef<ToastRef>(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCards(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [items]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const toggleSaved = (itemId: string) => {
    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
        toast.current?.show({ severity: 'info', summary: 'Removed', detail: 'Removed from saved items' });
      } else {
        newSet.add(itemId);
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Saved to your items' });
      }
      return newSet;
    });
  };

  const toggleComments = (itemId: string) => {
    setCommentSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleContact = (item: NewsFeedItem) => {
    setActiveItem(item.id);
    setShowContactModal(true);
  };

  const handleShare = (item: NewsFeedItem) => {
    setActiveItem(item.id);
    setShowShareModal(true);
  };

  const submitContact = () => {
    toast.current?.show({ severity: 'success', summary: 'Sent', detail: 'Contact request sent!' });
    setShowContactModal(false);
  };

  const shareItem = (platform: string) => {
    toast.current?.show({ severity: 'success', summary: 'Shared', detail: `Shared on ${platform}!` });
    setShowShareModal(false);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'lost': return { border: 'border-l-4 border-red-400', variant: 'danger' as const, label: 'LOST', bg: '' };
      case 'found': return { border: 'border-l-4 border-green-400', variant: 'success' as const, label: 'FOUND', bg: '' };
      case 'reunited': return { border: 'border-l-4 border-teal-400', variant: 'primary' as const, label: 'REUNITED ✨', bg: 'bg-teal-50' };
      default: return { border: '', variant: 'secondary' as const, label: 'POST', bg: '' };
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <div className={`space-y-6 ${className}`}>
        {items.map((item) => {
          const style = getStatusStyles(item.status);
          const isVisible = visibleCards.has(item.id);
          const isSaved = savedItems.has(item.id);
          const commentsOpen = commentSections.has(item.id);

          return (
            <div
              key={item.id}
              id={item.id}
              ref={(el) => {
                if (el) cardRefs.current.set(item.id, el);
              }}
              className={`transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <Card
                className={`rounded-3xl border-none shadow-sm overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                  style.border
                } ${style.bg || 'bg-white'}`}
                onClick={() => onItemClick?.(item)}
              >
            
            {/* Item Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Avatar image={item.user.profilePicture} size="large" shape="circle" />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-800 text-sm">{item.user.fullName}</span>
                    {item.user.isVerified && <CheckCircle size={14} className="text-teal-500" />}
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{item.timeAgo} • {item.location}</p>
                </div>
              </div>
                <StatusBadge 
                  status={item.status}
                  className={`px-3 py-1 font-bold transition-all duration-300 ${
                    item.status === 'lost' ? 'animate-pulse' : item.status === 'found' ? 'shadow-sm' : 'animate-bounce'
                  }`} 
                />
            </div>

              {/* Special Reunited Success Story */}
              {item.status === 'reunited' && (
                <div className="mx-4 mb-4 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={16} className="text-teal-500 fill-teal-500" />
                    <span className="font-bold text-teal-800">Success Story</span>
                  </div>
                  <p className="text-sm text-teal-700 mb-3 italic">
                    "Thanks to the amazing community, I got my lost item back! Faith in humanity restored 💚"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-teal-600">32 people celebrated this reunion</span>
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="text-teal-600 hover:text-teal-700" 
                    >
                      <Heart size={14} className="mr-1" /> Celebrate
                    </Button>
                  </div>
                </div>
              )}

              {/* Optimized Image size (16:9 Aspect Ratio) */}
            <div className="relative w-full aspect-video overflow-hidden bg-slate-100">
              {item.images && item.images.length > 0 ? (
                <ImageGallery images={item.images} className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <ImageIcon size={48} className="text-gray-400" />
                </div>
              )}
            </div>

            {/* Post Details */}
            <div className="p-5">
              <h2 className="text-xl font-black text-slate-900 mb-2 leading-tight">{item.title}</h2>
              <div className="text-slate-600 text-sm leading-relaxed mb-3">
                {expandedItems.has(item.id) ? item.description : item.description.length > 150 ? `${item.description.substring(0, 150)}...` : item.description}
                {item.description.length > 150 && (
                  <button onClick={() => toggleExpanded(item.id)} className="text-teal-600 hover:text-teal-800 ml-1 font-medium underline-offset-4 hover:underline">
                    {expandedItems.has(item.id) ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1"><MapPin size={12} /> {item.location}</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> {item.date}</span>
                <span className="flex items-center gap-1"><Tag size={12} /> {item.category}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                  {item.category}
                </Badge>
                {item.reward.amount > 0 && (
                  <Badge 
                    variant="success" 
                    className="text-[10px] uppercase tracking-wider flex items-center gap-1"
                  >
                    <Gift size={10} />
                    Reward: ${item.reward.amount}
                  </Badge>
                )}
              </div>

              {/* Comments Section */}
              {commentsOpen && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-3 mb-3">
                    {/* Mock comments */}
                    <div className="flex gap-2">
                      <Avatar image="https://i.pravatar.cc/150?u=comment1" size="normal" shape="circle" />
                      <div className="bg-white p-2 rounded-lg shadow-sm flex-1">
                        <span className="font-bold text-xs text-slate-800">Sarah M.</span>
                        <p className="text-xs text-gray-600">I saw something similar yesterday near the park!</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Textarea 
                      value={newComment} 
                      onChange={(e) => setNewComment(e.target.value)} 
                      placeholder="Add a comment..." 
                      rows={1} 
                      className="text-sm" 
                    />
                    <Button size="sm" className="self-end">Post</Button>
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex gap-4">
                  <button 
                    className="flex items-center gap-1.5 text-slate-400 hover:text-teal-600 transition-colors" 
                    onClick={() => toggleComments(item.id)}
                  >
                    <MessageSquare size={18} /> 
                    <span className="text-xs font-bold">12</span>
                  </button>
                  <button 
                    className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors" 
                    onClick={() => handleContact(item)}
                  >
                    <Bell size={18} /> 
                    <span className="text-xs font-bold">I can help</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className={`transition-all duration-300 ${isSaved ? 'text-teal-600' : 'text-slate-400'}`} 
                    onClick={() => toggleSaved(item.id)} 
                  >
                    <Bookmark size={18} className={isSaved ? 'fill-teal-600' : ''} />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="text-teal-600 font-bold" 
                    onClick={() => handleShare(item)}
                  >
                    <Share2 size={18} className="mr-1" /> Share
                  </Button>
                </div>
              </div>
            </div>
          </Card>
            </div>
          );
        })}
      </div>

      {/* Contact Modal */}
      <Modal 
        isOpen={showContactModal} 
        onClose={() => setShowContactModal(false)}
        title="Contact Information"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Your contact information will be shared with the item owner to help reunite the item.
          </p>
          <Textarea 
            label="Message"
            placeholder="Tell them how you can help..." 
            rows={3} 
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowContactModal(false)}>Cancel</Button>
            <Button onClick={submitContact}>Send Message</Button>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)}
        title="Share this item"
        size="sm"
      >
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline"
            className="flex flex-col items-center gap-2 py-4"
            onClick={() => shareItem('Facebook')} 
          >
            <Facebook size={24} className="text-blue-600" />
            <span>Facebook</span>
          </Button>
          <Button 
            variant="outline"
            className="flex flex-col items-center gap-2 py-4"
            onClick={() => shareItem('Twitter')} 
          >
            <Twitter size={24} className="text-sky-400" />
            <span>Twitter</span>
          </Button>
          <Button 
            variant="outline"
            className="flex flex-col items-center gap-2 py-4"
            onClick={() => shareItem('WhatsApp')} 
          >
            <MessageSquare size={24} className="text-green-500" />
            <span>WhatsApp</span>
          </Button>
          <Button 
            variant="outline"
            className="flex flex-col items-center gap-2 py-4"
            onClick={() => shareItem('Link')} 
          >
            <LinkIcon size={24} className="text-gray-600" />
            <span>Copy Link</span>
          </Button>
        </div>
      </Modal>
    </>
  );
};