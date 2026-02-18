// src/components/pages/public/PersonalHubPage/PersonalHubPage.tsx
import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import { CommunityService } from '../../../../services';
import type { Community } from '../../../../types/community';
import { Card, Avatar, Badge, Button } from '../../../ui';
import { LayoutGrid, FileText, Activity, Bookmark, Sparkles, Users, Building2, ShieldCheck, Star, TrendingUp, Eye, Heart, MessageSquare, MapPin, Clock, Check } from 'lucide-react';
import { cn } from '../../../../lib/utils';

const PersonalHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [showProfileEdit, setShowProfileEdit] = React.useState(false);

  const { userData: profile, updateProfile, loading: profileLoading } = useUserProfile();
  const { statistics: stats } = useStatistics();
  const { items: reports } = useNewsFeed();

  const [myCommunities, setMyCommunities] = React.useState<Community[]>([]);
  const [myCommunitiesLoading, setMyCommunitiesLoading] = React.useState(false);

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const dashboardStats = useMemo(() => ({
    totalReports: stats?.totalItems || 0,
    activeReports: stats?.activeReports || 0,
    resolvedReports: stats?.successfulMatches || 0,
    totalViews: 0 // Not available in StatsData
  }), [stats]);

  // Calculate engagement stats from reports
  const engagementStats = useMemo(() => {
    const reportsList = reports || [];
    return {
      totalReactions: reportsList.reduce((sum: number, r: any) => sum + (r.reactionsCount || 0), 0),
      totalComments: reportsList.reduce((sum: number, r: any) => sum + (r.commentsCount || 0), 0),
      totalViews: reportsList.reduce((sum: number, r: any) => sum + (r.views || 0), 0),
    };
  }, [reports]);

  // Fetch user's communities (use my-communities endpoint)
  React.useEffect(() => {
    let mounted = true;
    const loadMyCommunities = async () => {
      if (!profile?.id) return;
      setMyCommunitiesLoading(true);
      try {
        const result = await CommunityService.getMyCommunitiesPage(10, 1);
        if (!mounted) return;
        setMyCommunities(result.communities || []);
      } catch (err) {
        console.error('Error fetching my communities:', err);
        if (mounted) setMyCommunities([]);
      } finally {
        if (mounted) setMyCommunitiesLoading(false);
      }
    };

    loadMyCommunities();

    return () => { mounted = false; };
  }, [profile?.id]);

  // Get user's role badges
  const getRoleBadges = () => {
    const badges = [];
    if (profile?.id) {
      badges.push({ label: 'Community Member', color: 'bg-teal-100 text-teal-700 border-teal-200' });
    }
    // You can add more roles here based on user data
    return badges;
  };

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
          
          {/* LEFT COLUMN: Profile Info & Communities (Sticky) */}
          <aside className="hidden lg:block lg:w-[320px] shrink-0 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* User Roles & Badges */}
              {profile && (
                <Card className="p-6 rounded-3xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
                      <ShieldCheck size={20} />
                    </div>
                    <h3 className="font-bold text-slate-900">Your Roles</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-teal-100 text-teal-700 rounded-full px-3 py-1 font-bold text-xs">
                      <Star size={12} className="mr-1" />
                      Member
                    </Badge>
                  </div>
                </Card>
              )}

              {/* Communities Involved */}
              {myCommunities && myCommunities.length > 0 && (
                <Card className="p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Building2 size={20} />
                      </div>
                      <h3 className="font-bold text-slate-900">Communities</h3>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{myCommunities.length}</span>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {myCommunities.map((community: any) => (
                      <button
                        key={community.id}
                        onClick={() => navigate(`/community/${community.id}`)}
                        className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar
                            src={community.logo || undefined}
                            label={community.name?.charAt(0) || 'C'}
                            className="w-6 h-6 rounded-lg text-xs"
                          />
                          <span className="text-sm font-bold text-slate-900 truncate group-hover:text-teal-600 transition-colors">{community.name}</span>
                        </div>
                        <p className="text-xs text-slate-500 ml-8">{community.memberCount || 0} members</p>
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              <UserStatus />
              <QuickActions />
            </div>
          </aside>

          {/* CENTER COLUMN: Main Content & Tabs */}
          <main className="flex-1 min-w-0">
            <div className="space-y-8">
              {/* Stats row */}
              <StatsCards stats={dashboardStats} />

              {/* Engagement Overview Card - Mobile & Desktop */}
              {(reports && reports.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black uppercase tracking-widest text-[10px] text-slate-400">Total Views</span>
                      <Eye size={16} className="text-blue-600" />
                    </div>
                    <p className="text-2xl font-black text-blue-700">{engagementStats.totalViews.toLocaleString()}</p>
                  </Card>

                  <Card className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black uppercase tracking-widest text-[10px] text-slate-400">Reactions</span>
                      <Heart size={16} className="text-rose-600" />
                    </div>
                    <p className="text-2xl font-black text-rose-700">{engagementStats.totalReactions}</p>
                  </Card>

                  <Card className="p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black uppercase tracking-widest text-[10px] text-slate-400">Comments</span>
                      <MessageSquare size={16} className="text-orange-600" />
                    </div>
                    <p className="text-2xl font-black text-orange-700">{engagementStats.totalComments}</p>
                  </Card>
                </div>
              )}

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
                        disabled
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm transition-all whitespace-nowrap"
                      >
                        <Activity size={14} />
                        Activity
                      </TabsTrigger>
                      <TabsTrigger 
                        value="watchlist" 
                        disabled
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
                  
                  <button disabled className="w-full mt-8 py-4 bg-teal-50 text-teal-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-teal-600 hover:text-white transition-all">
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
