import React from 'react';
import { Card, Button, Avatar, ShadcnBadge as Badge } from '@/components/ui';
import { 
  Newspaper, 
  Clock, 
  User,
  MapPin,
  Plus,
  Share2,
  Heart,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Community' | 'Safety' | 'Events' | 'Infrastructure' | 'Social';
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  publishedAt: string;
  dateKey: string; // YYYY-MM-DD
  featured?: boolean;
  image?: string;
  likes: number;
  comments: number;
  location?: string;
}

export const SAMPLE_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'New Community Center Opening Next Month',
    excerpt: 'The long-awaited community center will finally open its doors to residents next month with state-of-the-art facilities...',
    content: 'The long-awaited community center will finally open its doors to residents next month with state-of-the-art facilities including a gym, library, and event spaces.',
    category: 'Infrastructure',
    author: { name: 'John Martinez', role: 'Community Manager' },
    publishedAt: '2 days ago',
    dateKey: '2026-01-12',
    featured: true,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
    likes: 342,
    comments: 28,
    location: 'Riverside Community'
  },
  {
    id: '2',
    title: 'Local Heroes: Meet Our Neighborhood Champions',
    excerpt: 'This month we spotlight the volunteers who make our community safer and stronger every single day...',
    content: 'This month we spotlight the volunteers who make our community safer and stronger every single day through their dedicated service.',
    category: 'Community',
    author: { name: 'Sarah Johnson', role: 'Content Creator' },
    publishedAt: '4 days ago',
    dateKey: '2026-01-13',
    featured: true,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
    likes: 521,
    comments: 45,
    location: 'Zone 4'
  },
  {
    id: '3',
    title: 'Safety Alert: Increased Police Presence',
    excerpt: 'In response to recent concerns, law enforcement will increase patrols in our area. Learn what this means for your safety...',
    content: 'In response to recent concerns, law enforcement will increase patrols in our area during evening and night hours.',
    category: 'Safety',
    author: { name: 'Chief Detective Lee', role: 'Safety Officer' },
    publishedAt: '5 days ago',
    dateKey: '2026-01-11',
    featured: false,
    likes: 287,
    comments: 31
  },
  {
    id: '4',
    title: 'Community Garden Expansion Complete',
    excerpt: 'We are thrilled to announce the successful completion of our community garden expansion project...',
    content: 'We are thrilled to announce the successful completion of our community garden expansion project, doubling our growing space.',
    category: 'Community',
    author: { name: 'Maria Santos', role: 'Environment Lead' },
    publishedAt: '1 week ago',
    dateKey: '2026-01-05',
    featured: false,
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&h=400&fit=crop',
    likes: 198,
    comments: 14,
    location: 'Green Valley'
  },
];

const getCategoryStyles = (category: NewsItem['category']) => {
  switch (category) {
    case 'Community': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' };
    case 'Safety': return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' };
    case 'Events': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' };
    case 'Infrastructure': return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' };
    case 'Social': return { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' };
    default: return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' };
  }
};

interface CommunityNewsProps {
  isAdmin?: boolean;
  onOpenNewsModal?: () => void;
}

export const CommunityNews: React.FC<CommunityNewsProps> = ({ 
  isAdmin, 
  onOpenNewsModal
}) => {
  const { t } = useTranslation();
  const featuredNews = SAMPLE_NEWS.filter(n => n.featured);
  const otherNews = SAMPLE_NEWS.filter(n => !n.featured);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-200">
                <Newspaper size={24} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">
                Community <span className="text-teal-600">News</span>
              </h2>
            </div>
            <p className="text-slate-500 font-medium max-w-lg">
              Stay informed with the latest news, updates, and stories from your community.
            </p>
          </div>

          {isAdmin && (
            <Button 
              onClick={onOpenNewsModal}
              className="h-14 px-8 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-xl shadow-teal-100 flex items-center gap-2"
            >
              <Plus size={20} className="stroke-[3px]" />
              NEW ARTICLE
            </Button>
          )}
        </div>
      </div>

      {/* Featured News Section */}
      {featuredNews.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-4">
            <div className="w-1 h-6 bg-teal-600 rounded-full" />
            <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">
              Featured <span className="text-teal-600">Stories</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredNews.map((news) => {
              const categoryStyle = getCategoryStyles(news.category);
              return (
                <Card 
                  key={news.id} 
                  className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl cursor-pointer"
                >
                  {/* Image Section */}
                  {news.image && (
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img 
                        src={news.image} 
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                      <Badge className={cn(categoryStyle.bg, categoryStyle.text, 'border', categoryStyle.border, 'absolute top-4 left-4 font-bold text-[10px] uppercase')}>
                        {news.category}
                      </Badge>
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-slate-600 text-sm font-medium line-clamp-2">
                        {news.excerpt}
                      </p>
                    </div>

                    {/* Author & Meta */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar 
                          src={news.author.avatar} 
                          className="w-8 h-8 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{news.author.name}</p>
                          <p className="text-[10px] text-slate-500">{news.publishedAt}</p>
                        </div>
                      </div>
                      {news.location && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <MapPin size={12} />
                          <span className="text-[10px] font-bold">{news.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Engagement Stats */}
                    <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                      <button className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition-colors">
                        <Heart size={14} />
                        <span className="text-xs font-bold">{news.likes}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-slate-500 hover:text-blue-500 transition-colors">
                        <MessageCircle size={14} />
                        <span className="text-xs font-bold">{news.comments}</span>
                      </button>
                      <button className="ml-auto p-2 hover:bg-teal-50 rounded-xl transition-colors">
                        <Share2 size={14} className="text-teal-400 hover:text-teal-600" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Other News Section */}
      {otherNews.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-4">
            <div className="w-1 h-6 bg-teal-600 rounded-full" />
            <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">
              Latest <span className="text-teal-600">Updates</span>
            </h3>
          </div>

          <div className="space-y-4">
            {otherNews.map((news) => {
              const categoryStyle = getCategoryStyles(news.category);
              return (
                <Card 
                  key={news.id} 
                  className="p-6 group border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl cursor-pointer"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    {news.image && (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                        <img 
                          src={news.image} 
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={cn(categoryStyle.bg, categoryStyle.text, 'border', categoryStyle.border, 'font-bold text-[10px] uppercase')}>
                            {news.category}
                          </Badge>
                        </div>
                        <h4 className="text-base font-black text-slate-900 line-clamp-2 group-hover:text-teal-600 transition-colors">
                          {news.title}
                        </h4>
                      </div>

                      <div className="flex items-center text-slate-500">
                        <Clock size={12} />
                        <span className="text-xs font-bold ml-1">{news.publishedAt}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Heart size={12} />
                        <span className="text-xs font-bold">{news.likes}</span>
                        <span className="mx-1">•</span>
                        <MessageCircle size={12} />
                        <span className="text-xs font-bold">{news.comments}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {SAMPLE_NEWS.length === 0 && (
        <Card className="p-20 text-center border-none shadow-sm rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100">
          <Newspaper size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-black text-slate-400 mb-2">{t('common.no_updates')}</h3>
          <p className="text-slate-400 font-medium max-w-md mx-auto">
            No news articles yet. Check back soon for updates from your community.
          </p>
        </Card>
      )}
    </div>
  );
};

export default CommunityNews;
