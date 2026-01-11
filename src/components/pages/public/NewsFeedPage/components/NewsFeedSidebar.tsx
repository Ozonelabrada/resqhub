import React, { useEffect, useState } from 'react';
import { 
  Home, 
  MessageSquare,
  Info,
  ShieldAlert,
  Heart,
  Clock,
  ShieldCheck,
  Map,
  Bell,
  Settings,
  Megaphone,
  Calendar,
  BookOpen,
  Users,
  Lock,
  UserPlus,
  ShoppingBag,
  Search
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  Badge,
  Avatar
} from '../../../../ui';
import { cn } from "@/lib/utils";
import { MessagesService } from '@/services/messagesService';
import { useFeatureFlags } from '@/hooks';
import type { UserData } from '@/types/auth';

export type CommunityTabType = 'feed' | 'needs' | 'chat' | 'members' | 'about' | 'announcements' | 'events' | 'resources' | 'trade';

interface NewsFeedSidebarProps {
  isAuthenticated: boolean;
  user: UserData | null;
  openLoginModal: () => void;
  navigate: (path: string) => void;
  currentView?: string;
  onViewChange?: (view: 'feed' | 'messages' | 'communities') => void;
  className?: string;
  communityNav?: {
    activeTab: CommunityTabType;
    onTabChange: (tab: CommunityTabType) => void;
    communityName: string;
    memberCount: number;
    isMember?: boolean;
    isAdmin?: boolean;
    isModerator?: boolean;
  };
}

const NewsFeedSidebar: React.FC<NewsFeedSidebarProps> = ({ 
  isAuthenticated, 
  user,
  openLoginModal, 
  navigate,
  currentView = 'feed',
  onViewChange,
  className,
  communityNav
}) => {
  const { t } = useTranslation();
  const { isFeatureEnabled } = useFeatureFlags();
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
    <aside className={cn("flex flex-col space-y-6", className)}>
    
      {/* User Profile Summary - Hidden in Community context per user request */}
      {!communityNav && (
        <>
          {isAuthenticated ? (
            <Card className="p-6 border-none shadow-sm bg-white rounded-[2rem] overflow-hidden relative group cursor-pointer" onClick={() => navigate('/profile')}>
              <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-teal-500 to-emerald-500" />
              <div className="relative pt-4 flex flex-col items-center">
                <div className="relative">
                  <Avatar 
                    src={user?.profilePicture} 
                    className="w-16 h-16 border-4 border-white shadow-lg" 
                  />
                  {user?.emailVerified && (
                    <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                  )}
                </div>
                <p className="text-sm font-black text-slate-800 mt-2 truncate w-full text-center px-2">
                  {user?.name || user?.username || 'Community Hero'}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  {user?.email || 'Active Scout'}
                </p>
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
        </>
      )}

      {/* Sidebar Navigation */}
      <nav className="space-y-1">
        {!communityNav && (
          <>
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
              onClick={() => onViewChange?.('communities')}
              className={cn(
                "w-full justify-start py-6 rounded-2xl font-bold transition-all border-none",
                currentView === 'communities' ? "text-teal-600 bg-teal-50 shadow-sm" : "text-slate-500 hover:bg-gray-50 hover:text-teal-600 group"
              )}
            >
              <div className="w-5 h-5 mr-3 flex items-center justify-center">
                <svg className={cn("w-5 h-5", currentView === 'communities' ? "text-teal-600" : "text-slate-400 group-hover:text-teal-600")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              Communities
            </Button>
          </>
        )}
        
        {/* Community Specific Navigation */}
        {communityNav && (
          <div className="pt-4 mt-4 border-t border-slate-50 space-y-1 animate-in slide-in-from-left duration-300">
            <div className="px-4 mb-3 flex items-center justify-between">
              <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em]">{communityNav.communityName}</h4>
              {!communityNav.isMember && !communityNav.isAdmin && (
                <Badge variant="outline" className="text-[8px] uppercase tracking-tighter px-1.5 py-0 border-slate-200 text-slate-400">Visitor</Badge>
              )}
            </div>

            {/* In-Community Sidebar Search */}
            {communityNav.activeTab !== 'about' && (
              <div className="px-4 mb-4 relative group">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder={`Search ${communityNav.activeTab}...`}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-[10px] font-bold focus:ring-1 focus:ring-teal-500 transition-all outline-none"
                />
              </div>
            )}

            <Button 
              variant="ghost" 
              onClick={() => communityNav.onTabChange('feed')}
              className={cn(
                "w-full justify-start py-6 rounded-2xl font-bold transition-all border-none group",
                communityNav.activeTab === 'feed' ? "text-teal-600 bg-teal-50 shadow-sm" : "text-slate-500 hover:bg-gray-50 hover:text-teal-600"
              )}
            >
              <div className={cn("w-5 h-5 mr-3 flex items-center justify-center", communityNav.activeTab === 'feed' ? "text-teal-600" : "text-slate-400 group-hover:text-teal-600")}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              Feed Updates
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => communityNav.onTabChange('chat')}
              className={cn(
                "w-full justify-start py-6 rounded-2xl font-bold transition-all border-none group",
                communityNav.activeTab === 'chat' ? "text-teal-600 bg-teal-50 shadow-sm" : "text-slate-500 hover:bg-gray-50 hover:text-teal-600"
              )}
            >
              <MessageSquare className={cn("w-5 h-5 mr-3", communityNav.activeTab === 'chat' ? "text-teal-600" : "text-slate-400 group-hover:text-teal-600")} />
              Live Chat
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => communityNav.onTabChange('needs')}
              className={cn(
                "w-full justify-start py-6 rounded-2xl font-bold transition-all border-none group",
                communityNav.activeTab === 'needs' ? "text-teal-600 bg-teal-50 shadow-sm" : "text-slate-500 hover:bg-gray-50 hover:text-teal-600"
              )}
            >
              <div className={cn("w-5 h-5 mr-3 flex items-center justify-center", communityNav.activeTab === 'needs' ? "text-teal-600" : "text-slate-400 group-hover:text-teal-600")}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              Needs Board
            </Button>

            {(communityNav.isMember || communityNav.isAdmin) && (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => communityNav.onTabChange('trade')}
                  className={cn(
                    "w-full justify-start py-6 rounded-2xl font-bold transition-all border-none group",
                    communityNav.activeTab === 'trade' ? "text-teal-600 bg-teal-50 shadow-sm" : "text-slate-500 hover:bg-gray-50 hover:text-teal-600"
                  )}
                >
                  <ShoppingBag className={cn("w-5 h-5 mr-3", communityNav.activeTab === 'trade' ? "text-teal-600" : "text-slate-400 group-hover:text-teal-600")} />
                  Findr Trade
                </Button>

                <Button 
                  variant="ghost" 
                  onClick={() => communityNav.onTabChange('announcements')}
                  className={cn(
                    "w-full justify-start py-6 rounded-2xl font-bold transition-all border-none group",
                    communityNav.activeTab === 'announcements' ? "text-teal-600 bg-teal-50 shadow-sm" : "text-slate-500 hover:bg-gray-50 hover:text-teal-600"
                  )}
                >
                  <Megaphone className={cn("w-5 h-5 mr-3", communityNav.activeTab === 'announcements' ? "text-teal-600" : "text-slate-400 group-hover:text-teal-600")} />
                  Announcements
                </Button>

                <Button 
                  variant="ghost" 
                  onClick={() => communityNav.onTabChange('events')}
                  className={cn(
                    "w-full justify-start py-6 rounded-2xl font-bold transition-all border-none group",
                    communityNav.activeTab === 'events' ? "text-teal-600 bg-teal-50 shadow-sm" : "text-slate-500 hover:bg-gray-50 hover:text-teal-600"
                  )}
                >
                  <Calendar className={cn("w-5 h-5 mr-3", communityNav.activeTab === 'events' ? "text-teal-600" : "text-slate-400 group-hover:text-teal-600")} />
                  Events
                </Button>

                <Button 
                  variant="ghost" 
                  onClick={() => communityNav.onTabChange('members')}
                  className={cn(
                    "w-full justify-start py-6 rounded-2xl font-bold transition-all border-none group",
                    communityNav.activeTab === 'members' ? "text-teal-600 bg-teal-50 shadow-sm" : "text-slate-500 hover:bg-gray-50 hover:text-teal-600"
                  )}
                >
                  <Users className={cn("w-5 h-5 mr-3", communityNav.activeTab === 'members' ? "text-teal-600" : "text-slate-400 group-hover:text-teal-600")} />
                  Members
                </Button>

                <Button 
                  variant="ghost" 
                  onClick={() => communityNav.onTabChange('resources')}
                  className={cn(
                    "w-full justify-start py-6 rounded-2xl font-bold transition-all border-none group",
                    communityNav.activeTab === 'resources' ? "text-teal-600 bg-teal-50 shadow-sm" : "text-slate-500 hover:bg-gray-50 hover:text-teal-600"
                  )}
                >
                  <BookOpen className={cn("w-5 h-5 mr-3", communityNav.activeTab === 'resources' ? "text-teal-600" : "text-slate-400 group-hover:text-teal-600")} />
                  Resources
                </Button>
              </>
            )}

            <Button 
              variant="ghost" 
              onClick={() => communityNav.onTabChange('about')}
              className={cn(
                "w-full justify-start py-6 rounded-2xl font-bold transition-all border-none group",
                communityNav.activeTab === 'about' ? "text-teal-600 bg-teal-50 shadow-sm" : "text-slate-500 hover:bg-gray-50 hover:text-teal-600"
              )}
            >
              <Info className={cn("w-5 h-5 mr-3", communityNav.activeTab === 'about' ? "text-teal-600" : "text-slate-400 group-hover:text-teal-600")} />
              About
            </Button>
          </div>
        )}

        {isFeatureEnabled('messages') && !communityNav && (
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
        )}

        {!communityNav && isAuthenticated && (
          <>
            <h4 className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2 mt-4">Personal</h4>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/profile')}
              className="w-full justify-start py-6 rounded-2xl font-bold transition-all border-none text-slate-500 hover:bg-gray-50 hover:text-teal-600 group"
            >
              <Clock className="w-5 h-5 mr-3 text-slate-400 group-hover:text-teal-600" />
              My Activity
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/watchlist')}
              className="w-full justify-start py-6 rounded-2xl font-bold transition-all border-none text-slate-500 hover:bg-gray-50 hover:text-teal-600 group"
            >
              <Heart className="w-5 h-5 mr-3 text-slate-400 group-hover:text-teal-600" />
              Saved Items
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/settings')}
              className="w-full justify-start py-6 rounded-2xl font-bold transition-all border-none text-slate-500 hover:bg-gray-50 hover:text-teal-600 group"
            >
              <Settings className="w-5 h-5 mr-3 text-slate-400 group-hover:text-teal-600" />
              Settings
            </Button>
          </>
        )}

        {!communityNav && (
          <>
            <h4 className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2 mt-4">Resources</h4>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/safety-tips')}
              className="w-full justify-start py-6 rounded-2xl font-bold transition-all border-none text-slate-500 hover:bg-gray-50 hover:text-teal-600 group"
            >
              <ShieldCheck className="w-5 h-5 mr-3 text-slate-400 group-hover:text-teal-600" />
              Safety Center
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/map')}
              className="w-full justify-start py-6 rounded-2xl font-bold transition-all border-none text-slate-500 hover:bg-gray-50 hover:text-teal-600 group"
            >
              <Map className="w-5 h-5 mr-3 text-slate-400 group-hover:text-teal-600" />
              Global Map
            </Button>
          </>
        )}
      </nav>

      {/* Trending Categories - Hidden in Community context per user request */}
      {!communityNav && (
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
      )}

      {/* Community Impact Stats */}
      {!communityNav && (
        <Card className="p-6 border-none shadow-sm bg-slate-800 text-white rounded-[2rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative z-10">
            <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-4">Total Impact</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-2xl font-black text-white leading-none">1,284</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Found Items</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black text-orange-400 leading-none">92%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Return Rate</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>Monthly Goal</span>
                <span className="text-white">85%</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </div>
        </Card>
      )}
    </aside>
  );
};

export default NewsFeedSidebar;
