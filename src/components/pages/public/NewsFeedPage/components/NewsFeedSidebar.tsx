import React from 'react';
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

interface NewsFeedSidebarProps {
  isAuthenticated: boolean;
  openLoginModal: () => void;
  navigate: (path: string) => void;
  currentView?: string;
  onViewChange?: (view: 'feed' | 'messages') => void;
}

const NewsFeedSidebar: React.FC<NewsFeedSidebarProps> = ({ 
  isAuthenticated, 
  openLoginModal, 
  navigate,
  currentView = 'feed',
  onViewChange
}) => {
  const { t } = useTranslation();

  return (
    <aside className="hidden lg:flex lg:col-span-2 flex-col space-y-6 sticky top-24 h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
      {/* ... previous content ... */}
      {/* User Profile Summary */}
      {isAuthenticated ? (
        <Card className="p-6 border-none shadow-sm bg-white rounded-[2rem] overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-teal-500 to-emerald-500" />
          <div className="relative pt-8 flex flex-col items-center">
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-white shadow-lg" />
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            </div>
            <p className="text-sm font-black text-slate-800 mt-2">Community Hero</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Level 12 Scout</p>
          </div>
        </Card>
      ) : (
        <Card className="p-8 border-none shadow-sm bg-teal-600 text-white rounded-[2rem] overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="font-black text-xl mb-2">New Here?</h3>
            <p className="text-teal-50 text-sm mb-6 opacity-90">Join SHERRA to start helping your community reunite lost items.</p>
            <Button 
              onClick={() => openLoginModal()}
              className="w-full py-6 bg-white text-teal-600 hover:bg-teal-50 font-black rounded-2xl shadow-xl transition-all"
            >
              Create Account
            </Button>
          </div>
          <Logo className="absolute -right-8 -bottom-8 w-32 h-32 opacity-10" light />
        </Card>
      )}

      {/* Sidebar Navigation */}
      <nav className="space-y-2">
        <h4 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{t('common.navigation')}</h4>
        <Button 
          variant="ghost" 
          onClick={() => onViewChange?.('feed')}
          className={cn(
            "w-full justify-start py-4 rounded-2xl font-bold transition-all",
            currentView === 'feed' ? "text-teal-600 bg-teal-50 shadow-sm" : "text-slate-600 hover:bg-gray-100 hover:text-teal-600 group"
          )}
        >
          <Home className={cn("w-5 h-5 mr-3", currentView === 'feed' ? "text-teal-600" : "text-slate-400 group-hover:text-teal-600")} />
          {t('common.news_feed')}
        </Button>
        <Button 
          variant="ghost"
          onClick={() => onViewChange?.('messages')}
          className={cn(
            "w-full justify-start py-4 rounded-2xl font-bold transition-all relative",
            currentView === 'messages' ? "text-teal-600 bg-teal-50 shadow-sm" : "text-slate-600 hover:bg-gray-100 hover:text-teal-600 group"
          )}
        >
          <MessageSquare className={cn("w-5 h-5 mr-3", currentView === 'messages' ? "text-teal-600" : "text-slate-400 group-hover:text-teal-600")} />
          Messages
          <Badge className="absolute right-4 bg-orange-500 text-white border-none font-black text-[10px] px-1.5 h-5">2</Badge>
        </Button>
        <Button onClick={() => navigate('/hub')} variant="ghost" className="w-full justify-start py-4 rounded-2xl text-slate-600 hover:bg-gray-100 hover:text-teal-600 font-bold group">
          <PlusCircle className="w-5 h-5 mr-3 text-slate-400 group-hover:text-teal-600" />
          {t('common.my_reports')}
        </Button>
        <Button variant="ghost" className="w-full justify-start py-4 rounded-2xl text-slate-600 hover:bg-gray-100 hover:text-teal-600 font-bold group">
          <Bookmark className="w-5 h-5 mr-3 text-slate-400 group-hover:text-teal-600" />
          {t('common.saved_items')}
        </Button>
        <Button variant="ghost" className="w-full justify-start py-4 rounded-2xl text-slate-600 hover:bg-gray-100 hover:text-teal-600 font-bold group">
          <ShieldAlert className="w-5 h-5 mr-3 text-slate-400 group-hover:text-teal-600" />
          {t('common.safety_center')}
        </Button>
      </nav>

      {/* Trending Categories */}
      <div className="pt-6">
        <h4 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Categories</h4>
        <div className="flex flex-wrap gap-2 px-2">
          {['Electronics', 'Pets', 'Wallets', 'Keys', 'Bags', 'Docs'].map(cat => (
            <Badge key={cat} variant="secondary" className="px-3 py-1.5 rounded-xl cursor-not-allowed hover:bg-slate-200 transition-colors">
              {cat}
            </Badge>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default NewsFeedSidebar;
