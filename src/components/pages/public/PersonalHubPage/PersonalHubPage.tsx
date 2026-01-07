import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { 
  Card, 
  Button, 
  Spinner, 
  Toast,
  Badge
} from '../../../ui';
import { useUserProfile } from '../../../../hooks/useUserProfile';
import { useUserReports } from '../../../../hooks/useUserReports';
import { useWatchList } from '../../../../hooks/useWatchList';
import type { EditProfileForm, UserReport, UserStats } from '../../../../types/personalHub';
import { ProfileHeader } from './personalHub/ProfileHeader';
import { StatsCards } from './personalHub/StatsCards';
import { ReportsList } from './personalHub/ReportsList';
import { EditProfileModal } from './personalHub/EditProfileModal';
import { CreateReportModal } from '../../../modals/ReportModal/CreateReportModal';
import CreateCommunityModal from '../../../modals/Community/CreateCommunityModal';
import { NewsFeed } from './personalHub/NewsFeed';
import { useNewsFeed } from '../../../../hooks/useNewsFeed';
import { useCommunities } from '../../../../hooks/useCommunities';
import { 
  User, 
  FileText, 
  Heart, 
  Rss, 
  Settings, 
  LogOut,
  Bell,
  Shield,
  HelpCircle,
  Activity,
  Plus,
  MapPin,
  X,
  Award,
  Users,
  Search,
  ChevronRight,
  ShieldCheck,
  Globe,
  AlertCircle
} from 'lucide-react';

const PersonalHubPage: React.FC = () => {
  const { t } = useTranslation();
  const toast = useRef<any>(null);
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [communitySearch, setCommunitySearch] = useState('');

  // Custom hooks
  const { userData, loading: userLoading, updateProfile } = useUserProfile();
  const { reports, loading: reportsLoading, hasMore: reportsHasMore, loadMore: loadMoreReports } = useUserReports(userData?.id || null);
  const { items: watchList, loading: watchListLoading, hasMore: watchListHasMore, loadMore: loadMoreWatchList } = useWatchList();
  const { items: newsFeedItems, loading: newsFeedLoading, hasMore: newsFeedHasMore, loadMore: loadMoreNewsFeed } = useNewsFeed();
  const { communities, loading: communitiesLoading, error: communitiesError } = useCommunities();

  // Calculate user stats
  const userStats: UserStats = {
    totalReports: reports.length,
    activeReports: reports.filter(r => r.status === 'active').length,
    resolvedReports: reports.filter(r => r.status === 'resolved').length,
    totalViews: reports.reduce((sum, r) => sum + r.views, 0)
  };

  // Event handlers
  const handleReportSuccess = () => {
    toast.current?.show({
      severity: 'success',
      summary: 'Report Published',
      detail: 'Your report has been successfully added to the community feed.',
      life: 5000
    });
  };

  const handleProfilePictureUpload = async (event: any) => {
    const file = event.files[0];
    if (file && userData) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const profilePictureData = e.target?.result as string;
        try {
          const success = await updateProfile({ profilePicture: profilePictureData });
          if (success) {
            toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Profile picture updated successfully', life: 3000 });
          }
        } catch (error) {
          console.error('Error updating profile picture:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfile = () => setShowProfileEdit(true);

  const handleSaveProfile = async (formData: EditProfileForm) => {
    setEditLoading(true);
    try {
      const success = await updateProfile(formData);
      if (success) {
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Profile updated successfully', life: 3000 });
        setShowProfileEdit(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setEditLoading(false);
    }
  };

  if (userLoading || !userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Spinner size="lg" />
        <p className="mt-4 text-slate-500 font-black animate-bounce uppercase tracking-widest text-xs">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfcff]">
      <Toast ref={toast} />

      {/* Edge-to-Edge Container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 items-start">
          
          {/* Left Sidebar - Personal Controls (2/10) */}
          <aside className="lg:col-span-2 space-y-8 sticky top-32">
            <div className="flex items-center gap-3 px-2 mb-4">
               <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-100">
                  <User size={20} />
               </div>
               <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('common.my_hub')}</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.personal_dashboard')}</p>
               </div>
            </div>

            <nav className="space-y-2">
              {[
                { id: 'overview', label: t('common.overview'), icon: <Activity size={20} /> },
                { id: 'reports', label: t('common.my_reports'), icon: <FileText size={20} />, count: reports.length },
                { id: 'watchlist', label: t('common.watchlist'), icon: <Heart size={20} />, count: watchList.length },
                { id: 'communities', label: 'Communities', icon: <Users size={20} /> },
                { id: 'feed', label: t('common.local_feed'), icon: <Rss size={20} /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-5 py-4 rounded-[1.5rem] font-bold text-sm transition-all group",
                    activeTab === item.id 
                      ? "bg-teal-600 text-white shadow-xl shadow-teal-100 scale-[1.02]" 
                      : "text-slate-500 hover:bg-white hover:text-teal-600 hover:shadow-md"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className={cn(activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-teal-500")}>
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                  {item.count !== undefined && (
                    <span className={cn(
                        "px-2.5 py-0.5 rounded-lg text-[10px] font-black",
                        activeTab === item.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="pt-8 border-t border-slate-100">
               <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all group">
                  <Settings size={20} className="group-hover:rotate-45 transition-transform" />
                  {t('common.account_settings')}
               </button>
               <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                  <LogOut size={20} />
                  {t('common.sign_out')}
               </button>
            </div>

            {/* Verification Progress */}
            <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-none shadow-2xl rounded-[2rem] text-white overflow-hidden relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <Shield size={20} className="text-teal-400" />
                    </div>
                    <h4 className="font-black text-sm uppercase tracking-tight">Trust Level</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Profile</span>
                       <span className="text-teal-400 font-black">85%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-teal-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                    </div>
                  </div>
               </div>
            </Card>
          </aside>

          {/* Center Column - Feed & Actions (5/10) */}
          <main className="lg:col-span-5 space-y-8">
            <ProfileHeader
              userData={userData}
              userStats={userStats}
              onEditProfile={handleEditProfile}
              onProfilePictureUpload={handleProfilePictureUpload}
            />

            <div className="space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                    <span className="w-2 h-8 bg-orange-500 rounded-full" />
                    {activeTab === 'overview' ? t('personalhub.activity_overview') : 
                     activeTab === 'reports' ? t('common.my_reports') :
                     activeTab === 'watchlist' ? t('common.watchlist') :
                     activeTab === 'feed' ? t('common.local_feed') :
                     activeTab.replace(/([A-Z])/g, ' $1')}
                  </h3>
                  <Button 
                    onClick={() => setIsReportModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-6 h-14 font-black shadow-xl shadow-emerald-100 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
                  >
                    <Plus size={24} />
                    <span>{t('personalhub.post_new_report')}</span>
                  </Button>
               </div>

               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {activeTab === 'overview' && (
                    <div className="space-y-8">
                       <ReportsList
                          reports={reports.slice(0, 3)}
                          loading={reportsLoading}
                          hasMore={false}
                          onLoadMore={() => {}}
                          onReportClick={(report) => navigate(`/item/${report.id}`)}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {/* Mini Watchlist */}
                           <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
                              <h4 className="text-xl font-black mb-6 flex items-center gap-2">
                                <Heart className="text-rose-500 fill-current" size={20} /> {t('common.watchlist')}
                              </h4>
                              <div className="space-y-4">
                                 {watchList.slice(0, 3).map(item => (
                                   <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-teal-600 text-xs">
                                        {item.similarity}%
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-900 truncate uppercase text-xs">{item.title}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black">
                                           <MapPin size={10} /> {item.location}
                                        </div>
                                      </div>
                                   </div>
                                 ))}
                                 <Button variant="ghost" className="w-full text-xs font-black text-teal-600 uppercase tracking-widest mt-4">{t('personalhub.view_full_watchlist')}</Button>
                              </div>
                           </Card>

                           {/* Community Impact */}
                           <Card className="border-none shadow-xl rounded-[2.5rem] bg-teal-600 p-8 text-white relative overflow-hidden">
                              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                              <h4 className="text-xl font-black mb-6 relative z-10 flex items-center gap-2">
                                <Activity size={20} className="text-emerald-300" /> {t('personalhub.impact')}
                              </h4>
                              <div className="space-y-6 relative z-10">
                                 <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-teal-100">{t('personalhub.success_stories')}</span>
                                    <span className="text-2xl font-black">12</span>
                                 </div>
                                 <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-teal-100">{t('personalhub.points_earned')}</span>
                                    <span className="text-2xl font-black">1,240</span>
                                 </div>
                              </div>
                              <Button className="w-full bg-white/20 hover:bg-white/30 border-none rounded-xl text-xs font-black uppercase tracking-widest mt-8">{t('personalhub.leaderboard')}</Button>
                           </Card>
                        </div>
                    </div>
                  )}

                  {activeTab === 'reports' && (
                    <ReportsList
                      reports={reports}
                      loading={reportsLoading}
                      hasMore={reportsHasMore}
                      onLoadMore={loadMoreReports}
                      onReportClick={(report) => navigate(`/item/${report.id}`)}
                    />
                  )}

                  {activeTab === 'watchlist' && (
                    <div className="py-20 text-center">
                       <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                          <Heart size={48} className="text-rose-500" />
                       </div>
                       <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{t('personalhub.watching_for_updates')}</h3>
                       <p className="text-slate-500 max-w-md mx-auto mb-8 font-bold">
                          {t('personalhub.watching_description')}
                       </p>
                       <Button className="bg-slate-900 text-white rounded-2xl px-10 h-14 font-black">{t('personalhub.explore_feed')}</Button>
                    </div>
                  )}

                  {activeTab === 'feed' && (
                    <NewsFeed
                      items={newsFeedItems}
                      loading={newsFeedLoading}
                      hasMore={newsFeedHasMore}
                      onLoadMore={loadMoreNewsFeed}
                      onItemClick={(item) => navigate(`/item/${item.id}`)}
                    />
                  )}

                  {activeTab === 'communities' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Search & Discovery Bar */}
                      <Card className="p-4 border-none shadow-sm rounded-[2rem] bg-white flex flex-col lg:flex-row items-center gap-4">
                        <div className="flex-1 w-full bg-slate-50 rounded-2xl flex items-center px-5 py-3 border border-slate-100 group focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
                          <Search className="text-slate-300 w-5 h-5 mr-3 group-focus-within:text-teal-500 transition-colors" />
                          <input 
                            type="text" 
                            placeholder="Find a community to join by city, name, or interest..." 
                            className="bg-transparent border-none focus:outline-none text-sm font-bold text-slate-700 w-full placeholder:text-slate-300"
                            value={communitySearch}
                            onChange={(e) => setCommunitySearch(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                           <Button 
                             variant="ghost"
                             className="flex-1 lg:flex-none border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 text-slate-400 hover:text-teal-600 rounded-2xl px-8 h-12 font-black transition-all active:scale-95 flex items-center gap-2"
                           >
                             <Globe size={18} />
                             Browse
                           </Button>
                           <Button 
                             onClick={() => setIsCommunityModalOpen(true)}
                             className="flex-1 lg:flex-none bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-8 h-12 font-black shadow-lg shadow-teal-100 transition-all active:scale-95 flex items-center gap-2"
                           >
                             <Plus size={18} />
                             Start Community
                           </Button>
                        </div>
                      </Card>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {communitiesLoading ? (
                          Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-48 bg-slate-100 rounded-[2.5rem] animate-pulse" />
                          ))
                        ) : communitiesError ? (
                          <div className="col-span-full py-20 text-center">
                            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                              <AlertCircle size={32} className="text-rose-500" />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 mb-2">Something went wrong</h4>
                            <p className="text-slate-500 font-medium mb-6">{communitiesError}</p>
                            <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl font-black">Retry Loading</Button>
                          </div>
                        ) : communities.filter(c => c.name.toLowerCase().includes(communitySearch.toLowerCase())).length > 0 ? (
                          communities
                            .filter(c => c.name.toLowerCase().includes(communitySearch.toLowerCase()))
                            .map(community => (
                            <Card key={community.id} className="p-8 border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white group hover:shadow-2xl transition-all flex flex-col justify-between">
                              <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-inner">
                                  <Users size={28} />
                                </div>
                                <div className="flex flex-col items-end">
                                  <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-none font-black text-[10px] uppercase px-3 py-1 rounded-full mb-1">
                                    {community.privacy || 'Public'}
                                  </Badge>
                                  {community.isAdmin && (
                                    <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[10px] uppercase px-3 py-1 rounded-full">
                                      Owner
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xl font-black text-slate-900 mb-2 truncate">{community.name}</h4>
                                <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed h-10">
                                  {community.description || t('community.default_description', 'Connecting members in this community for shared safety and support.')}
                                </p>
                              </div>
                              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                      <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-[8px] font-black text-slate-400">U</div>
                                    ))}
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{community.membersCount || 24} Members</span>
                                </div>
                                <Button 
                                  onClick={() => navigate(`/community/${community.id}`)}
                                  variant="ghost" 
                                  className="h-10 rounded-xl font-black text-teal-600 hover:bg-teal-50 hover:text-teal-700 p-0 px-4"
                                >
                                  {community.isMember ? 'Visit Hub' : 'Request Join'}
                                  <ChevronRight size={16} className="ml-1" />
                                </Button>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <div className="col-span-full py-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Search size={32} className="text-slate-300" />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 mb-2">
                              {communitySearch ? 'No matches found' : 'No communities joined yet'}
                            </h4>
                            <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">
                              {communitySearch 
                                ? `We couldn't find any communities matching "${communitySearch}". If you just created one, it may still be under review.` 
                                : 'You haven\'t joined any communities. Once you create or join a community, they will appear here.'}
                            </p>
                            {!communitySearch && (
                              <div className="space-y-4">
                                <Button 
                                  onClick={() => setIsCommunityModalOpen(true)}
                                  className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-10 h-14 font-black shadow-xl shadow-teal-100"
                                >
                                  Start Your First Community
                                </Button>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  Already requested one? Requests take 24-48h to be reviewed.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Info section for creation */}
                      <Card className="p-8 border-none shadow-sm rounded-[2.5rem] bg-emerald-50/50 border border-emerald-100 flex items-center gap-6">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                          <ShieldCheck size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-emerald-900 mb-1">Create with Trust</p>
                          <p className="text-xs font-medium text-emerald-700 leading-relaxed">
                            Every community creation is reviewed by SHERRA admins to ensure safety. Instant approval is available for premium subscribers.
                          </p>
                        </div>
                      </Card>
                    </div>
                  )}
               </div>
            </div>
          </main>

          {/* Right Sidebar - Analytics & Community (3/10) */}
          <aside className="lg:col-span-3 space-y-8 sticky top-32">
            <StatsCards stats={userStats} />

            {/* Achievement Card */}
            <Card className="p-8 border-none shadow-xl rounded-[2.5rem] bg-white group hover:shadow-2xl transition-all">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('personalhub.achievements')}</h3>
                  <Award size={24} className="text-orange-500 group-hover:scale-110 transition-transform" />
               </div>
               <div className="space-y-6">
                  {[
                    { title: t('personalhub.super_scout', 'Super Scout'), desc: t('personalhub.found_5_items', 'Found 5 items'), icon: '🏆', color: 'bg-orange-50', border: 'border-orange-100' },
                    { title: t('personalhub.local_hero', 'Local Hero'), desc: t('personalhub.resolved_3_reports', 'Resolved 3 reports'), icon: '🌟', color: 'bg-teal-50', border: 'border-teal-100' },
                    { title: t('personalhub.contributor', 'Contributor'), desc: t('personalhub.joined_30_days_ago', 'Joined 30 days ago'), icon: '📅', color: 'bg-blue-50', border: 'border-blue-100' }
                  ].map((ach, idx) => (
                    <div key={idx} className={cn("flex items-center gap-4 p-4 rounded-3xl border transition-all", ach.color, ach.border)}>
                       <span className="text-3xl">{ach.icon}</span>
                       <div>
                          <p className="text-sm font-black text-slate-900 leading-tight">{ach.title}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{ach.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
               <Button variant="ghost" className="w-full text-xs font-black text-slate-400 mt-6 uppercase tracking-widest hover:text-teal-600">{t('personalhub.view_all_medals')}</Button>
            </Card>

            {/* Quick Tips */}
            <Card className="p-8 border-none shadow-xl rounded-[2.5rem] bg-slate-50">
               <div className="flex mb-6">
                  <div className="p-3 bg-white rounded-2xl shadow-sm">
                    <HelpCircle className="w-6 h-6 text-teal-500" />
                  </div>
               </div>
               <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{t('personalhub.smart_search_pro')}</h4>
               <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                  {t('personalhub.smart_search_desc')}
               </p>
               <Button className="w-full bg-white text-slate-900 border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 rounded-2xl font-black text-xs uppercase tracking-widest h-14">{t('personalhub.learn_more')}</Button>
            </Card>

          </aside>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        visible={showProfileEdit}
        userData={userData}
        onHide={() => setShowProfileEdit(false)}
        onSave={handleSaveProfile}
        loading={editLoading}
      />

      <CreateReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={handleReportSuccess}
      />

      <CreateCommunityModal
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
        onSuccess={() => {
          toast.current?.show({
              severity: 'success',
              summary: 'Request Submitted',
              detail: 'Your community has been submitted for review.',
              life: 5000
          });
        }}
      />
    </div>
  );
};

export default PersonalHubPage;
  