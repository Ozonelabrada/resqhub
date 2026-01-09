import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Settings, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Heart, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  Button, 
  Card, 
  Avatar, 
  Spinner 
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { CommunitySettingsModal, CreateReportModal } from '../../../modals';
import { cn } from '@/lib/utils';
import { useCommunityDetail } from '../../../../hooks/useCommunities';
import { CommunityChat } from '../../../features/messages/CommunityChat';

// Global Sidebar Component
import NewsFeedSidebar from '../NewsFeedPage/components/NewsFeedSidebar';
import type { CommunityTabType } from '../NewsFeedPage/components/NewsFeedSidebar';

import { CommunityFeed } from './components/CommunityFeed';
import { NeedsBoard } from './components/NeedsBoard';
import { ResourcesWidget } from './components/ResourcesWidget';
import { CommunityMembers } from './components/CommunityMembers';

const CommunityPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user, openLoginModal } = useAuth();
  
  // Get active tab from URL or default to 'feed'
  const activeTab = (searchParams.get('tab') as CommunityTabType) || 'feed';

  const { 
    community, 
    posts, 
    members, 
    loading, 
    join,
    refresh
  } = useCommunityDetail(id);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const safeMembers = Array.isArray(members) ? members : [];
  const isMember = community?.isMember || false;

  const handleJoin = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    await join();
  };

  const handleTabChange = (tab: CommunityTabType) => {
    setSearchParams({ tab });
  };

  if (loading || !community) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          {loading ? (
            <>
              <Spinner size="lg" className="mx-auto text-teal-600" />
              <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-xs">Loading Community</p>
            </>
          ) : (
            <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-xs">Community not found</p>
          )}
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <CommunityFeed 
            communityId={id!} 
            posts={posts || []} 
            isMember={isMember}
            isAdmin={community.isAdmin}
            onRefresh={refresh}
          />
        );
      case 'needs':
        return <NeedsBoard />;
      case 'chat':
        return (
          <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-100 h-[700px] animate-in fade-in duration-500">
            {isMember ? (
              <CommunityChat communityId={id!} communityName={community.name} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6 text-teal-600">
                  <ShieldCheck size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Members Only Chat</h3>
                <p className="text-slate-500 font-medium max-w-md mb-8">
                  Join {community.name} to participate in the live community discussion and connect with other members.
                </p>
                <Button onClick={handleJoin} className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-10 h-14 font-black">
                  Join Now to Chat
                </Button>
              </div>
            )}
          </div>
        );
      case 'members':
        return (
          <CommunityMembers 
            members={safeMembers} 
            isAdmin={community.isAdmin} 
          />
        );
      case 'about':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-sm">
                  <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-teal-600" />
                    Community Rules
                  </h4>
                  <ul className="space-y-4">
                    {Array.isArray(community.rules) && community.rules.length > 0 ? community.rules.map((rule, i) => (
                      <li key={i} className="flex gap-4">
                        <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</span>
                        <p className="text-sm text-slate-500 font-medium">{rule}</p>
                      </li>
                    )) : (
                      <li className="text-slate-400 italic text-sm">No rules specified.</li>
                    )}
                  </ul>
               </Card>

               <Card className="p-8 rounded-[2.5rem] bg-slate-900 text-white border-none shadow-sm relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="text-xl font-black mb-2">Success Metrics</h4>
                    <p className="text-slate-400 text-xs mb-6 font-medium">Tracking our impact in the neighborhood</p>
                    
                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <span className="text-xs font-black uppercase tracking-widest text-slate-500">Items Reunited</span>
                          <span className="text-xl font-black">128</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 w-[75%] rounded-full" />
                       </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl"></div>
               </Card>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- COMMUNITY HEADER: FULL WIDTH TOP SECTION --- */}
      <div className="w-full -mt-8 relative mb-12 md:mb-20">
        {/* Community Banner - Full Screen Width Background */}
        <div className="h-64 md:h-80 bg-slate-900 relative overflow-hidden text-white shadow-2xl">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500 rounded-full -mr-64 -mt-64 blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500 rounded-full -ml-48 -mb-48 blur-[100px]"></div>
          </div>
          
          {/* Banner content - Center Constrained */}
          <div className="h-full max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 flex items-end pb-12 md:pb-16">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 w-full relative z-10">
              {/* Profile Avatar / Logo - Overlapping Banner */}
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] md:rounded-[4rem] bg-white p-2 shadow-2xl z-20 -mb-20 md:-mb-28 border-4 border-white overflow-hidden flex items-center justify-center transition-transform hover:scale-105 duration-500">
                <div className="w-full h-full rounded-[2.2rem] md:rounded-[3.5rem] bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center text-4xl md:text-7xl font-black text-white">
                  {community.name?.charAt(0)}
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left mb-2 md:mb-4">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                  <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-md tracking-tight uppercase">{community.name}</h1>
                  <ShieldCheck className="text-emerald-400 fill-emerald-400/10 hidden md:block" size={40} />
                </div>
                <p className="text-teal-50 text-lg md:text-xl font-medium opacity-90 max-w-2xl line-clamp-1">{community.tagline}</p>
              </div>

              <div className="mb-4 md:mb-6 flex gap-3">
                {isMember ? (
                  <div className="flex gap-2">
                    {user?.role === 'admin' && (
                      <Button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 h-14 w-14 rounded-2xl flex items-center justify-center transition-all"
                      >
                        <Settings size={24} />
                      </Button>
                    )}
                    <Button 
                      onClick={() => setIsReportModalOpen(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-2xl px-8 font-black transition-all shadow-xl shadow-emerald-500/20"
                    >
                      <Plus className="mr-2 w-5 h-5" />
                      Create Post
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={handleJoin}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-2xl px-10 font-black shadow-xl shadow-emerald-500/30 transition-all active:scale-95"
                  >
                    Join Community
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-6 lg:px-8 py-6">
        <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* --- LEFT SIDEBAR: SHARED NAVIGATION --- */}
        <NewsFeedSidebar 
          className="order-2 lg:order-1 lg:col-span-2"
          isAuthenticated={isAuthenticated}
          openLoginModal={openLoginModal}
          navigate={navigate}
          currentView="communities"
          communityNav={{
            activeTab: activeTab,
            onTabChange: handleTabChange,
            communityName: community.name,
            memberCount: community.membersCount
          }}
        />

        {/* --- CENTER: COMMUNITY CONTENT --- */}
        <div className={cn(
          "order-1 pb-20 lg:pb-0 scroll-smooth",
          (activeTab === 'feed' || activeTab === 'needs') ? "lg:col-span-5 lg:order-2" : "lg:col-span-8 lg:order-2"
        )}>
          {/* MAIN CONTENT AREA */}
          <div className="space-y-6">
            {renderTabContent()}
          </div>
        </div>

        {/* --- RIGHT SIDEBAR: COMMUNITY STATS & INFO --- */}
        {(activeTab === 'feed' || activeTab === 'needs') && (
          <aside className="hidden lg:flex lg:col-span-3 lg:order-3 flex-col space-y-6 pt-6 sticky top-24 self-start">
            {activeTab === 'needs' && <ResourcesWidget />}
            
            <Card className="p-8 border-none shadow-sm rounded-[2.5rem] bg-white text-slate-900">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Local Statistics</h4>
               <div className="space-y-6">
                  <div className="flex items-start gap-4">
                     <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-sm">
                        <MapPin size={18} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Location</p>
                        <p className="text-slate-800 font-black">{community.location || 'Bacolod City'}</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                        <Calendar size={18} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Active Since</p>
                        <p className="text-slate-800 font-black">2024</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                        <Heart size={18} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Resolved Cases</p>
                        <p className="text-slate-800 font-black">188 Items</p>
                     </div>
                  </div>
               </div>

               <div className="mt-8 pt-8 border-t border-slate-50">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Top Contributors</h4>
                  <div className="space-y-4">
                     {safeMembers.slice(0, 4).map(m => (
                        <div key={m.id} className="flex items-center gap-3">
                           <Avatar className="w-8 h-8 font-black text-[10px] bg-slate-50">{m.name.charAt(0)}</Avatar>
                           <span className="text-sm font-bold text-slate-600 truncate">{m.name}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </Card>

            <Card className="p-8 border-none shadow-sm rounded-[2.5rem] bg-teal-600 text-white relative overflow-hidden group">
               <div className="relative z-10">
                  <AlertCircle className="w-10 h-10 mb-4 opacity-50" />
                  <h4 className="text-xl font-black mb-2">Community Watch</h4>
                  <p className="text-teal-100 text-sm font-medium leading-relaxed mb-6 opacity-80">
                     Help keep our neighborhood safe by reporting suspicious activity.
                  </p>
                  <Button className="w-full bg-white text-teal-600 font-black rounded-xl hover:bg-teal-50 transition-colors">
                    Learn More
                  </Button>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[60px] -mr-16 -mt-16"></div>
            </Card>

            <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-sm">
              <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                <ShieldCheck size={20} className="text-teal-600" />
                Rules
              </h4>
              <ul className="space-y-4">
                {Array.isArray(community.rules) && community.rules.length > 0 ? community.rules.slice(0, 3).map((rule, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</span>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2">{rule}</p>
                  </li>
                )) : (
                  <li className="text-slate-400 italic text-sm">No rules specified.</li>
                )}
              </ul>
            </Card>
          </aside>
        )}
      </main>
    </div>

    {/* MODALS */}
    <CommunitySettingsModal 
      isOpen={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
      community={community as any}
    />

    <CreateReportModal
      isOpen={isReportModalOpen}
      onClose={() => setIsReportModalOpen(false)}
      communityId={id}
    />
  </div>
);
};

export default CommunityPage;