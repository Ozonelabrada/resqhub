import React, { useState, useEffect, useRef } from 'react';
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
  X
} from 'lucide-react';

const PersonalHubPage: React.FC = () => {
  const toast = useRef<any>(null);

  // State
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Custom hooks
  const { userData, loading: userLoading, updateProfile } = useUserProfile();
  const { reports, loading: reportsLoading, hasMore: reportsHasMore, loadMore: loadMoreReports } = useUserReports(userData?.id || null);
  const { items: watchList, loading: watchListLoading, hasMore: watchListHasMore, loadMore: loadMoreWatchList } = useWatchList();
  const { items: newsFeedItems, loading: newsFeedLoading, hasMore: newsFeedHasMore, loadMore: loadMoreNewsFeed } = useNewsFeed();

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
          // Update user data locally first
          const success = await updateProfile({ profilePicture: profilePictureData });

          if (success) {
            toast.current?.show({
              severity: 'success',
              summary: 'Success',
              detail: 'Profile picture updated successfully',
              life: 3000
            });
          } else {
            toast.current?.show({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update profile picture',
              life: 3000
            });
          }
        } catch (error) {
          console.error('Error updating profile picture:', error);
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update profile picture',
            life: 3000
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfile = () => {
    setShowProfileEdit(true);
  };

  const handleSaveProfile = async (formData: EditProfileForm) => {
    setEditLoading(true);

    try {
      const success = await updateProfile({
        fullName: formData.fullName,
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        profilePicture: formData.profilePicture,
        coverPhoto: formData.coverPhoto
      });

      if (success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Profile updated successfully',
          life: 3000
        });
        setShowProfileEdit(false);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update profile',
        life: 3000
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleReportClick = (report: UserReport) => {
    // Navigate to report details or handle click
    console.log('Report clicked:', report);
  };

  // Show loading spinner while fetching user data
  if (userLoading || !userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Spinner size="lg" />
        <p className="mt-4 text-slate-500 font-bold animate-pulse">Preparing your personal hub...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Toast ref={toast} />

      {/* Header / Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <Container size="xl" className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-100">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 leading-none">Personal Hub</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Welcome back, {userData.fullName || userData.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 flex items-center justify-center text-slate-500">
                <Bell size={20} />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 flex items-center justify-center text-slate-500">
                <Settings size={20} />
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <Container size="xl" className="py-8">
        {/* Profile Header Section */}
        <ProfileHeader
          userData={userData}
          userStats={userStats}
          onEditProfile={handleEditProfile}
          onProfilePictureUpload={handleProfilePictureUpload}
        />

        <Container className="py-12">
          {/* Main Content Grid */}
          <Grid cols={12} gap={8} responsive={false}>
            {/* Sidebar Navigation */}
            <aside className="hidden lg:block lg:col-span-3 space-y-6">
              <Card className="p-2 border-none shadow-xl rounded-3xl overflow-hidden">
                <nav className="space-y-1">
                  {[
                    { id: 'overview', label: 'Overview', icon: <Activity size={18} /> },
                    { id: 'reports', label: 'My Reports', icon: <FileText size={18} />, count: reports.length },
                    { id: 'watchlist', label: 'Watch List', icon: <Heart size={18} />, count: watchList.length },
                    { id: 'feed', label: 'Community Feed', icon: <Rss size={18} /> },
                  ].map((item) => (
                    <button
                      key={item.id}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all hover:bg-slate-50 text-slate-600 hover:text-teal-600 group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 group-hover:text-teal-500 transition-colors">{item.icon}</span>
                        {item.label}
                      </div>
                      {item.count !== undefined && (
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg text-[10px]">
                          {item.count}
                        </span>
                      )}
                    </button>
                  ))}
                  <div className="my-4 border-t border-slate-100 mx-4" />
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-rose-600 hover:bg-rose-50 transition-all">
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </nav>
              </Card>

              {/* Quick Help Card */}
              <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-none shadow-xl rounded-3xl text-white">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                  <HelpCircle size={20} className="text-teal-400" />
                </div>
                <h4 className="font-bold mb-2">Need Help?</h4>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Check our community guidelines or contact support if you're having trouble with a report.
                </p>
                <Button variant="ghost" size="sm" className="w-full bg-white/10 hover:bg-white/20 text-white border-none rounded-xl text-xs font-bold">
                  View Help Center
                </Button>
              </Card>
            </aside>

            {/* Main Content Area */}
            <main className="col-span-12 lg:col-span-9">
              <Tabs defaultValue="overview" className="w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <TabList className="bg-white p-1 rounded-2xl shadow-sm border-none inline-flex">
                    <TabTrigger value="overview" icon={<Activity size={16} />}>Overview</TabTrigger>
                    <TabTrigger value="reports" icon={<FileText size={16} />}>Reports</TabTrigger>
                    <TabTrigger value="watchlist" icon={<Heart size={16} />}>Watch List</TabTrigger>
                    <TabTrigger value="feed" icon={<Rss size={16} />}>Feed</TabTrigger>
                  </TabList>

                  <Button 
                    onClick={() => setIsReportModalOpen(true)}
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-6 py-6 font-bold shadow-lg shadow-teal-100 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus size={20} />
                    Create Report
                  </Button>
                </div>

                <TabContent value="overview" className="space-y-8">
                  <StatsCards stats={userStats} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ReportsList
                      reports={reports.slice(0, 3)}
                      loading={reportsLoading}
                      hasMore={false}
                      onLoadMore={() => {}}
                      onReportClick={handleReportClick}
                    />
                    
                    <Card className="border-none shadow-xl rounded-3xl overflow-hidden flex flex-col">
                      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                        <div>
                          <h3 className="text-xl font-black text-slate-900">Watch List</h3>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Items you're tracking</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-teal-600 font-bold">View All</Button>
                      </div>
                      <div className="p-6 space-y-4 overflow-y-auto max-h-[400px]">
                        {watchList.length === 0 ? (
                          <div className="py-12 text-center">
                            <Heart size={32} className="text-slate-200 mx-auto mb-2" />
                            <p className="text-slate-400 text-sm font-bold">Your watch list is empty</p>
                          </div>
                        ) : (
                          watchList.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-teal-200 transition-all group">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-teal-600 font-black">
                                  {item.similarity}%
                                </div>
                                <div>
                                  <h5 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{item.title}</h5>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                      item.type === 'lost' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                                    }`}>
                                      {item.type}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                      <MapPin size={10} /> {item.location}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0 flex items-center justify-center text-slate-300 hover:text-rose-500">
                                <X size={16} />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>
                  </div>
                </TabContent>

                <TabContent value="reports">
                  <ReportsList
                    reports={reports}
                    loading={reportsLoading}
                    hasMore={reportsHasMore}
                    onLoadMore={loadMoreReports}
                    onReportClick={handleReportClick}
                  />
                </TabContent>

                <TabContent value="watchlist">
                  <Card className="border-none shadow-xl rounded-3xl p-8 text-center">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart size={40} className="text-rose-500" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Your Watch List</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                      Keep track of items that match your reports or things you're helping to find.
                    </p>
                  </Card>
                </TabContent>

                <TabContent value="feed">
                  <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                      <h3 className="text-xl font-black text-slate-900">Community Feed</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Latest updates from your area</p>
                    </div>
                    <div className="p-6">
                      <NewsFeed
                        items={newsFeedItems}
                        loading={newsFeedLoading}
                        hasMore={newsFeedHasMore}
                        onLoadMore={loadMoreNewsFeed}
                      />
                    </div>
                  </Card>
                </TabContent>
              </Tabs>
            </main>
          </Grid>
        </Container>

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
  