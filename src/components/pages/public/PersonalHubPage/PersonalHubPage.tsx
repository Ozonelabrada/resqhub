// src/components/pages/public/PersonalHubPage/PersonalHubPage.tsx
import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProfileHeader } from './personalHub/ProfileHeader';
import { StatsCards } from './personalHub/StatsCards';
import { QuickActions } from './personalHub/QuickActions';
import { UserStatus } from './personalHub/UserStatus';
import { ActivityFeed } from './personalHub/ActivityFeed';
import { Watchlist } from './personalHub/Watchlist';
import { ReportsGrid } from './personalHub/ReportsGrid';
import { OverviewGrid } from './personalHub/OverviewGrid';
import { EditProfileModal } from './personalHub/EditProfileModal';
import { useUserProfile, useStatistics, useNewsFeed } from '../../../../hooks';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../ui/tabs';
import { LayoutGrid, FileText, Activity, Bookmark, Sparkles } from 'lucide-react';

const PersonalHubPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [showProfileEdit, setShowProfileEdit] = React.useState(false);

  const { userData: profile, updateProfile, loading: profileLoading } = useUserProfile();
  const { statistics: stats } = useStatistics();
  const { items: reports } = useNewsFeed();

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const dashboardStats = useMemo(() => ({
    totalReports: stats?.totalItems || 0,
    activeReports: stats?.activeReports || 0,
    resolvedReports: stats?.successfulMatches || 0,
    totalViews: 0 // Not available in StatsData
  }), [stats]);

  const handleEditProfile = () => setShowProfileEdit(true);
  const handleProfilePictureUpload = (event: any) => {
    // Implementation for profile picture upload
    console.log('Upload profile picture', event);
  };

  const handleSaveProfile = async (updates: any) => {
    await updateProfile(updates);
    setShowProfileEdit(false);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Immersive Header */}
      {profile && (
        <ProfileHeader 
          userData={profile} 
          onEditProfile={handleEditProfile}
          onProfilePictureUpload={handleProfilePictureUpload}
        />
      )}

      {/* Main Fluid Container */}
      <div className="flex-1 w-full px-4 lg:px-8 -mt-12 relative z-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Profile info & Status (Sticky) */}
          <aside className="hidden lg:block lg:w-[320px] shrink-0 space-y-6">
            <div className="sticky top-24 space-y-6">
              <UserStatus />
              <QuickActions />
            </div>
          </aside>

          {/* CENTER COLUMN: Main Content & Tabs */}
          <main className="flex-1 min-w-0">
            <div className="space-y-8">
              {/* Stats row */}
              <StatsCards stats={dashboardStats} />

              {/* Content Tabs */}
              <div className="bg-white rounded-4xl p-4 lg:p-8 shadow-sm border border-slate-100">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 scrollbar-none">
                    <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl border-none h-auto flex-nowrap shrink-0">
                      <TabsTrigger 
                        value="overview" 
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm transition-all whitespace-nowrap"
                      >
                        <LayoutGrid size={14} />
                        Overview
                      </TabsTrigger>
                      <TabsTrigger 
                        value="reports" 
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm transition-all whitespace-nowrap"
                      >
                        <FileText size={14} />
                        Reports
                      </TabsTrigger>
                      <TabsTrigger 
                        value="activity" 
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm transition-all whitespace-nowrap"
                      >
                        <Activity size={14} />
                        Activity
                      </TabsTrigger>
                      <TabsTrigger 
                        value="watchlist" 
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm transition-all whitespace-nowrap"
                      >
                        <Bookmark size={14} />
                        Watchlist
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="overview" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <OverviewGrid stats={dashboardStats} recentReports={reports?.slice(0, 3)} />
                  </TabsContent>

                  <TabsContent value="reports" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <ReportsGrid reports={reports} />
                  </TabsContent>

                  <TabsContent value="activity" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <ActivityFeed />
                  </TabsContent>

                  <TabsContent value="watchlist" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Watchlist />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </main>

          {/* RIGHT COLUMN: Discovery & Context */}
          <aside className="w-full lg:w-[350px] shrink-0 space-y-6">
             <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-4xl p-8 shadow-sm border border-slate-100 group hover:border-teal-100 transition-colors">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-teal-50 rounded-xl group-hover:bg-teal-100 transition-colors">
                         <Sparkles className="w-4 h-4 text-teal-600" />
                      </div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Discovery Hub</h3>
                  </div>
                  <p className="text-slate-500 text-xs font-bold leading-relaxed mb-6">Find resources, local alerts, and community-driven reports matching your interests.</p>
                  
                  <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-slate-400">NEARBY ALERTS</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                         </div>
                         <p className="text-xs font-black text-slate-700">3 new reports in your area</p>
                      </div>
                      
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-60">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-slate-400">COMMUNITY GOALS</span>
                         </div>
                         <p className="text-xs font-black text-slate-700">Help resolve 5 more cases</p>
                      </div>
                  </div>
                  
                  <button className="w-full mt-8 py-4 bg-teal-50 text-teal-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-teal-600 hover:text-white transition-all">
                     Explore map
                  </button>
                </div>

                <div className="bg-slate-900 rounded-4xl p-8 shadow-xl text-white relative overflow-hidden">
                   <div className="relative z-10">
                      <h3 className="text-sm font-black uppercase tracking-widest mb-2 text-teal-400">Pro Tip</h3>
                      <p className="text-sm font-bold leading-relaxed text-slate-300">Enable notifications in your settings to get real-time matches for your reports.</p>
                   </div>
                   <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />
                </div>
             </div>
          </aside>

        </div>
      </div>

      {profile && (
        <EditProfileModal
          visible={showProfileEdit}
          userData={profile}
          onHide={() => setShowProfileEdit(false)}
          onSave={handleSaveProfile}
          loading={false}
        />
      )}
    </div>
  );
};

export default PersonalHubPage;
