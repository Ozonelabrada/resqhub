import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Badge } from 'primereact/badge';
import { Chip } from 'primereact/chip';
import { Image } from 'primereact/image';
import { Galleria } from 'primereact/galleria';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import type { UserReport } from '../../../../../types/personalHub';

export interface NewsFeedItem extends UserReport {
  user: {
    id: string;
    fullName: string;
    username: string;
    profilePicture?: string;
    isVerified?: boolean;
  };
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
}

export const NewsFeed: React.FC<NewsFeedProps> = ({
  items,
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
  const toast = useRef<Toast>(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleCards(prev => new Set(prev.add(entry.target.id)));
            }, index * 100);
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
        toast.current?.show({ severity: 'info', summary: 'Removed from saved items' });
      } else {
        newSet.add(itemId);
        toast.current?.show({ severity: 'success', summary: 'Saved to your items' });
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
    toast.current?.show({ severity: 'success', summary: 'Contact request sent!' });
    setShowContactModal(false);
  };

  const shareItem = (platform: string) => {
    toast.current?.show({ severity: 'success', summary: `Shared on ${platform}!` });
    setShowShareModal(false);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'lost': return { border: 'border-l-4 border-red-400', badge: '#E74C3C', label: 'LOST', bg: '' };
      case 'found': return { border: 'border-l-4 border-green-400', badge: '#27AE60', label: 'FOUND', bg: '' };
      case 'reunited': return { border: 'border-l-4 border-yellow-400', badge: '#FFB347', label: 'REUNITED ✨', bg: 'bg-yellow-50' };
      default: return { border: '', badge: '#ccc', label: 'POST', bg: '' };
    }
  };

  const galleriaItemTemplate = (item: any) => (
    <img src={item.itemImageSrc} alt="Item" style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
  );

  const galleriaThumbnailTemplate = (item: any) => (
    <img src={item.thumbnailImageSrc} alt="Thumbnail" style={{ width: '60px', height: '40px', objectFit: 'cover' }} />
  );

  return (
    <>
      <style>{`
        @keyframes slide-down {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
      <Toast ref={toast} />
      <div className="space-y-6">
        {items.map((item, index) => {
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
            >
              <Card
                className={`rounded-3xl border-none shadow-sm overflow-hidden transition-all duration-500 hover:shadow-lg hover:-translate-y-1 ${
                  style.border
                } ${style.bg || 'bg-white'} ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
            
            {/* Item Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Avatar image={item.user.profilePicture} size="large" shape="circle" />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-800 text-sm">{item.user.fullName}</span>
                    {item.user.isVerified && <i className="pi pi-verified text-blue-500 text-xs"></i>}
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{item.timeAgo} • {item.location}</p>
                </div>
              </div>
                <Badge 
                  value={style.label} 
                  style={{ backgroundColor: style.badge }} 
                  className={`px-3 py-1 font-bold transition-all duration-300 ${
                    item.status === 'lost' ? 'animate-pulse' : item.status === 'found' ? 'shadow-lg' : 'animate-bounce'
                  }`} 
                />
            </div>

              {/* Special Reunited Success Story */}
              {item.status === 'reunited' && (
                <div className="mx-4 mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="pi pi-star-fill text-yellow-500"></i>
                    <span className="font-bold text-yellow-800">Success Story</span>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">
                    "Thanks to the amazing community, I got my lost item back! Faith in humanity restored 💚"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-yellow-600">32 people celebrated this reunion</span>
                    <Button 
                      icon="pi pi-heart" 
                      className="p-button-text p-button-sm text-yellow-600 hover:text-yellow-700" 
                      label="👏 Celebrate" 
                    />
                  </div>
                </div>
              )}

              {/* Optimized Image size (16:9 Aspect Ratio) */}
            <div className="relative w-full aspect-video overflow-hidden bg-slate-100">
              {item.images && item.images.length > 0 ? (
                item.images.length === 1 ? (
                  <Image 
                    src={item.images[0]} 
                    alt={item.title} 
                    preview 
                    className="w-full h-full" 
                    imageClassName="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                  />
                ) : (
                  <Galleria 
                    value={item.images.map(img => ({ itemImageSrc: img, thumbnailImageSrc: img }))} 
                    item={galleriaItemTemplate} 
                    thumbnail={galleriaThumbnailTemplate} 
                    showThumbnails={false} 
                    showIndicators 
                    changeItemOnIndicatorHover 
                    circular 
                    autoPlay 
                    transitionInterval={3000} 
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <i className="pi pi-image text-gray-400 text-4xl"></i>
                </div>
              )}
            </div>

            {/* Post Details */}
            <div className="p-5">
              <h2 className="text-xl font-black text-slate-900 mb-2 leading-tight">{item.title}</h2>
              <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-3">
                {expandedItems.has(item.id) ? item.description : item.description.length > 150 ? `${item.description.substring(0, 150)}...` : item.description}
                {item.description.length > 150 && (
                  <button onClick={() => toggleExpanded(item.id)} className="text-blue-600 hover:text-blue-800 ml-1 font-medium">
                    {expandedItems.has(item.id) ? 'Show less' : 'Read more'}
                  </button>
                )}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span>📍 {item.location}</span>
                <span>📅 {item.date}</span>
                <span>🏷️ {item.category}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Chip label={item.category} className="text-xs font-bold bg-slate-100 text-slate-500" />
                {item.reward.amount > 0 && (
                  <Chip label={`Reward: $${item.reward.amount}`} icon="pi pi-gift" className="text-xs font-bold bg-green-50 text-green-700 border border-green-100" />
                )}
              </div>

              {/* Comments Section */}
              {commentsOpen && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg animate-slide-down">
                  <div className="space-y-3 mb-3">
                    {/* Mock comments */}
                    <div className="flex gap-2">
                      <Avatar image="https://i.pravatar.cc/150?u=comment1" shape="circle" />
                      <div>
                        <span className="font-medium text-sm">Sarah M.</span>
                        <p className="text-sm text-gray-600">I saw something similar yesterday!</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <InputTextarea 
                      value={newComment} 
                      onChange={(e) => setNewComment(e.target.value)} 
                      placeholder="Add a comment..." 
                      rows={2} 
                      className="flex-1" 
                    />
                    <Button label="Post" className="p-button-sm" />
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex gap-4">
                  <button 
                    className="flex items-center gap-1 text-slate-400 hover:text-blue-500 transition-colors" 
                    onClick={() => toggleComments(item.id)}
                  >
                    <i className="pi pi-comment text-sm"></i> 
                    <span className="text-xs font-bold">{item.description || 0}</span>
                  </button>
                  <button 
                    className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors" 
                    onClick={() => handleContact(item)}
                  >
                    <i className="pi pi-bell text-sm"></i> 
                    <span className="text-xs font-bold">I can help</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    icon={`pi pi-bookmark${isSaved ? '' : '-fill'}`} 
                    className={`p-button-text p-button-sm transition-all duration-300 ${isSaved ? 'text-blue-600' : 'text-slate-400'}`} 
                    onClick={() => toggleSaved(item.id)} 
                  />
                  <Button 
                    label="Share" 
                    icon="pi pi-share-alt" 
                    className="p-button-text text-blue-600 font-bold" 
                    onClick={() => handleShare(item)}
                  />
                </div>
              </div>
            </div>
          </Card>
            </div>
        );
      })}
      </div>

      {/* Contact Modal */}
      <Dialog 
        header="Contact Information" 
        visible={showContactModal} 
        onHide={() => setShowContactModal(false)}
        className="w-full max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Your contact information will be shared with the item owner to help reunite the item.
          </p>
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <InputTextarea 
              placeholder="Tell them how you can help..." 
              rows={3} 
              className="w-full" 
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button label="Cancel" className="p-button-text" onClick={() => setShowContactModal(false)} />
            <Button label="Send" onClick={submitContact} />
          </div>
        </div>
      </Dialog>

      {/* Share Modal */}
      <Dialog 
        header="Share this item" 
        visible={showShareModal} 
        onHide={() => setShowShareModal(false)}
        className="w-full max-w-sm"
      >
        <div className="grid grid-cols-2 gap-3">
          <Button 
            label="Facebook" 
            icon="pi pi-facebook" 
            className="p-button-outlined" 
            onClick={() => shareItem('Facebook')} 
          />
          <Button 
            label="Twitter" 
            icon="pi pi-twitter" 
            className="p-button-outlined" 
            onClick={() => shareItem('Twitter')} 
          />
          <Button 
            label="WhatsApp" 
            icon="pi pi-whatsapp" 
            className="p-button-outlined" 
            onClick={() => shareItem('WhatsApp')} 
          />
          <Button 
            label="Copy Link" 
            icon="pi pi-link" 
            className="p-button-outlined" 
            onClick={() => shareItem('Link')} 
          />
        </div>
      </Dialog>
    </>
  );
};