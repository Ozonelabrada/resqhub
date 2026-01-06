import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../../lib/utils';
import { 
  Card, 
  Button, 
  Spinner, 
  Toast, 
  Container, 
  Grid, 
  Alert,
  Tabs,
  TabList,
  TabTrigger,
  TabContent
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
import { NewsFeed } from './personalHub/NewsFeed';
import { useNewsFeed } from '../../../../hooks/useNewsFeed';
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
  Award
} from 'lucide-react';

const PersonalHubPage: React.FC = () => {
  const { t } = useTranslation();
  const toast = useRef<any>(null);
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Custom hooks
  const { userData, loading: userLoading, updateProfile } = useUserProfile();
  const { reports, loading: reportsLoading, hasMore: reportsHasMore, loadMore: loadMoreReports } = useUserReports(userData?.id || null);
  const { items: watchList, loading: watchListLoading, hasMore: watchListHasMore, loadMore: loadMoreWatchList } = useWatchList();
  const { items: newsFeedItems, loading: newsFeedLoading, hasMore: newsFeedHasMore, loadMore: loadMoreNewsFeed } = useNewsFeed();

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
                          onReportClick={() => {}}
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
                      onReportClick={() => {}}
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
                    />
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
    </div>
  );
};

export default PersonalHubPage;
  