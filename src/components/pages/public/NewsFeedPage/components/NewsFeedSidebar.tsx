import React, { useEffect, useState } from 'react';
import { 
  Home, 
  PlusCircle, 
  Bookmark, 
  ShieldAlert,
  MessageSquare
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  Badge,
  Logo,
  Avatar
} from '../../../../ui';
import { cn } from "@/lib/utils";
import { MessagesService } from '@/services/messagesService';

interface NewsFeedSidebarProps {
  isAuthenticated: boolean;
  openLoginModal: () => void;
  navigate: (path: string) => void;
  currentView?: string;
  onViewChange?: (view: 'feed' | 'messages') => void;
  onPostClick?: () => void;
}

const NewsFeedSidebar: React.FC<NewsFeedSidebarProps> = ({ 
  isAuthenticated, 
  openLoginModal, 
  navigate,
  currentView = 'feed',
  onViewChange,
  onPostClick
}) => {
  const { t } = useTranslation();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUnread = async () => {
        try {
          const count = await MessagesService.getUnreadCount();
          setUnreadCount(count);
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      };

      fetchUnread();
      
      // Refresh every minute
      const interval = setInterval(fetchUnread, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  return (
    <aside className="hidden lg:flex lg:col-span-2 flex-col space-y-6 sticky top-0 h-full overflow-y-auto pr-2 custom-scrollbar no-scrollbar py-6">
    
      {/* User Profile Summary */}
      {isAuthenticated ? (
        <Card className="p-6 border-none shadow-sm bg-white rounded-[2rem] overflow-hidden relative group cursor-pointer" onClick={() => navigate('/profile')}>
          <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-teal-500 to-emerald-500" />
          <div className="relative pt-4 flex flex-col items-center">
            <div className="relative">
              <Avatar className="w-16 h-16 border-4 border-white shadow-lg" />
              <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            </div>
            <p className="text-sm font-black text-slate-800 mt-2">Community Hero</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Scout Level 12</p>
          </div>
        </Card>
      ) : (
        <Card className="p-8 border-none shadow-sm bg-teal-600 text-white rounded-[2rem] overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="font-black text-lg mb-1">Join the Mission</h3>
            <p className="text-teal-50 text-xs mb-4 opacity-90 leading-relaxed">Help your neighbors find what they've lost.</p>
            <Button 
              onClick={() => openLoginModal()}
              className="w-full py-5 bg-white text-teal-600 hover:bg-teal-50 font-black rounded-xl shadow-lg transition-all text-sm"
            >
              Sign Up Free
            </Button>
          </div>
        </Card>
      )}

      {/* Sidebar Navigation */}
      <nav className="space-y-1">
        <h4 className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">{t('common.navigation')}</h4>
        <Button 
          variant="ghost" 
          onClick={() => onViewChange?.('feed')}
          className={cn(
            "w-full justify-start py-6 rounded-2xl font-bold transition-all border-none",
            currentView === 'feed' ? "text-teal-600 bg-teal-50 shadow-sm" : "text-slate-500 hover:bg-gray-50 hover:text-teal-600 group"
          )}
        >
          <Home className={cn("w-5 h-5 mr-3", currentView === 'feed' ? "text-teal-600" : "text-slate-400 group-hover:text-teal-600")} />
          {t('common.news_feed')}
        </Button>
        <Button 
          variant="ghost"
          onClick={() => navigate('/communities')}
          className="w-full justify-start py-6 rounded-2xl text-slate-500 hover:bg-gray-50 hover:text-teal-600 font-bold group transition-all border-none"
        >
          <div className="w-5 h-5 mr-3 flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-400 group-hover:text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          Communities
        </Button>
        <Button 
          variant="ghost"
          onClick={() => onViewChange?.('messages')}
          className={cn(
            "w-full justify-start py-6 rounded-2xl font-bold transition-all relative border-none",
            currentView === 'messages' ? "text-teal-600 bg-teal-50 shadow-sm" : "text-slate-500 hover:bg-gray-50 hover:text-teal-600 group"
          )}
        >
          <MessageSquare className={cn("w-5 h-5 mr-3", currentView === 'messages' ? "text-teal-600" : "text-slate-400 group-hover:text-teal-600")} />
          Messages
          {unreadCount > 0 && (
            <Badge className="absolute right-4 bg-orange-500 text-white border-none font-black text-[10px] px-1.5 h-5">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
        <Button onClick={() => navigate('/profile')} variant="ghost" className="w-full justify-start py-6 rounded-2xl text-slate-500 hover:bg-gray-50 hover:text-teal-600 font-bold group border-none">
          <PlusCircle className="w-5 h-5 mr-3 text-slate-400 group-hover:text-teal-600" />
          {t('common.my_reports')}
        </Button>
      </nav>

      {/* Trending Categories */}
      <div className="pt-2">
        <h4 className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Quick Filter</h4>
        <div className="flex flex-wrap gap-2 px-2">
          {['Electronics', 'Pets', 'Wallets', 'Keys', 'Bags'].map(cat => (
            <Badge key={cat} variant="secondary" className="px-3 py-1.5 rounded-xl cursor-pointer bg-white border-none shadow-sm hover:bg-teal-50 hover:text-teal-600 transition-colors text-[11px] font-bold text-slate-400">
              {cat}
            </Badge>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default NewsFeedSidebar;
