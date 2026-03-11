import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PartyPopper, ArrowRight, ExternalLink, MapPin, Clock, Heart, Share2, Eye } from 'lucide-react';
import { Card, Button, StatusBadge, Grid, Container } from '../../../../ui';
import { useTranslation } from 'react-i18next';

interface SuccessStory {
  id: number;
  title: string;
  location: string;
  timeAgo: string;
  type: 'lost' | 'found';
  image: string;
  description?: string;
  views?: number;
  likes?: number;
  category?: string;
}

interface SuccessStoriesSectionProps {
  recentSuccesses: SuccessStory[];
  loading?: boolean;
}

const SuccessStoriesSection: React.FC<SuccessStoriesSectionProps> = ({
  recentSuccesses,
  loading = false
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [likedStories, setLikedStories] = useState<Set<number>>(new Set());

  const handleLike = (storyId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedStories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storyId)) {
        newSet.delete(storyId);
      } else {
        newSet.add(storyId);
      }
      return newSet;
    });
  };

  const handleShare = (story: SuccessStory, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: `Check out this success story: ${story.title}`,
        url: `${window.location.origin}/success-stories/${story.id}`
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/success-stories/${story.id}`);
    }
  };

  const renderSuccessCard = (item: SuccessStory) => {
    const isLiked = likedStories.has(item.id);

    return (
      <Card
        key={item.id}
        className="group h-full border-none shadow-xl rounded-[2rem] bg-white overflow-hidden hover:scale-[1.02] hover:shadow-2xl transition-all duration-500 cursor-pointer"
        onClick={() => navigate(`/success-stories/${item.id}`)}
      >
        <div className="relative">
          {/* Image Container */}
          <div className="relative overflow-hidden">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Overlay Actions */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <button
                onClick={(e) => handleLike(item.id, e)}
                className={`p-2 rounded-full backdrop-blur-sm border transition-all duration-200 ${
                  isLiked
                    ? 'bg-red-500 border-red-400 text-white'
                    : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                }`}
              >
                <Heart size={16} className={isLiked ? 'fill-current' : ''} />
              </button>
              <button
                onClick={(e) => handleShare(item, e)}
                className="p-2 rounded-full bg-white/20 border border-white/30 text-white hover:bg-white/30 backdrop-blur-sm transition-all duration-200"
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <StatusBadge
                status={item.type === 'lost' ? 'lost' : 'found'}
                className="shadow-lg"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Category */}
            {item.category && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold mb-3">
                {item.category}
              </div>
            )}

            {/* Title */}
            <h4 className="text-xl font-black text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
              {item.title}
            </h4>

            {/* Description */}
            {item.description && (
              <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                <MapPin size={12} />
                {item.location}
              </div>
              <div className="flex items-center gap-1 text-slate-300 text-xs font-black uppercase tracking-widest">
                <Clock size={10} />
                {item.timeAgo}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-slate-400 text-xs">
                {item.views && (
                  <div className="flex items-center gap-1">
                    <Eye size={12} />
                    {item.views}
                  </div>
                )}
                {item.likes !== undefined && (
                  <div className="flex items-center gap-1">
                    <Heart size={12} className={isLiked ? 'text-red-500 fill-current' : ''} />
                    {item.likes + (isLiked ? 1 : 0)}
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 font-bold group/btn transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/success-stories/${item.id}`);
              }}
            >
              {t('home.success.read_story')}
              <ArrowRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Card className="h-full border-none shadow-xl rounded-[2rem] bg-white overflow-hidden">
      <div className="animate-pulse">
        <div className="h-48 bg-slate-200"></div>
        <div className="p-6">
          <div className="h-4 bg-slate-200 rounded-full mb-3 w-1/3"></div>
          <div className="h-6 bg-slate-200 rounded-lg mb-3"></div>
          <div className="h-4 bg-slate-200 rounded mb-4"></div>
          <div className="flex justify-between mb-4">
            <div className="h-3 bg-slate-200 rounded w-1/4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/4"></div>
          </div>
          <div className="h-8 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="bg-slate-900 py-24 relative overflow-hidden">
      {/* Enhanced Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute top-[50%] left-[50%] w-[20%] h-[20%] bg-purple-500 rounded-full blur-[80px] animate-pulse delay-500"></div>
      </div>

      <Container size="full" className="relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-6 animate-fade-in">
              <PartyPopper size={16} className="animate-bounce" />
              {t('home.success.tag')}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 animate-slide-up">
              {t('home.success.title')}
            </h2>
            <p className="text-slate-400 text-lg font-medium animate-slide-up delay-100">
              {t('home.success.subtitle')}
            </p>
          </div>

          <Button
            variant="ghost"
            className="text-white border-white/20 hover:bg-white/10 hover:border-white/40 rounded-2xl px-8 h-14 font-bold transition-all duration-300 hover:scale-105 animate-fade-in delay-200"
            onClick={() => navigate('/success-stories')}
          >
            {t('home.success.view_all')}
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* <Grid cols={3} gap={8} className="animate-fade-in delay-300">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <LoadingSkeleton key={index} />
              ))
            : recentSuccesses.map((item) => renderSuccessCard(item))
          }
        </Grid> */}

        {/* Empty State */}
        {!loading && recentSuccesses.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-full mb-4">
              <PartyPopper size={32} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Success Stories Yet</h3>
            <p className="text-slate-400">Be the first to share your success story!</p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default SuccessStoriesSection;

// Custom animations and utilities
const styles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slide-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }

  .animate-slide-up {
    animation: slide-up 0.8s ease-out forwards;
  }

  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }
  .delay-300 { animation-delay: 0.3s; }
  .delay-500 { animation-delay: 0.5s; }
  .delay-1000 { animation-delay: 1s; }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}