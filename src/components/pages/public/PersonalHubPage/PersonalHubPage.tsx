import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Spinner, 
  Toast,
  Badge,
  type ToastRef
} from '../../../ui';
import { useUserProfile } from '../../../../hooks/useUserProfile';
import { useUserReports } from '../../../../hooks/useUserReports';
import { useWatchList } from '../../../../hooks/useWatchList';
import type { EditProfileForm, UserReport, UserStats } from '../../../../types/personalHub';
import { ProfileHeader } from './personalHub/ProfileHeader';
import { StatsCards } from './personalHub/StatsCards';
import { ReportsList } from './personalHub/ReportsList';
import { EditProfileModal } from './personalHub/EditProfileModal';
import { CreateReportModal } from '../../../modals';
import { Activity, Eye, CheckCircle, Heart } from 'lucide-react';

const PersonalHubPage: React.FC = () => {
  const toast = useRef<ToastRef>(null);
  const navigate = useNavigate();

  // State
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Custom hooks
  const { userData, loading: userLoading, updateProfile } = useUserProfile();
  const { reports, loading: reportsLoading, hasMore: reportsHasMore, loadMore: loadMoreReports } = useUserReports(userData?.id || null);
  const { items: watchList, loading: watchListLoading, hasMore: watchListHasMore, loadMore: loadMoreWatchList } = useWatchList();

  // Calculate user stats
  const userStats: UserStats = {
    totalReports: reports.length,
    activeReports: reports.filter(r => r.status === 'active').length,
    resolvedReports: reports.filter(r => r.status === 'resolved').length,
    totalViews: reports.reduce((sum, r) => sum + r.views, 0)
  };

  const handleEditProfile = () => {
    setShowProfileEdit(true);
  };

  const handleSaveProfile = async (formData: EditProfileForm) => {
    setEditLoading(true);
    try {
      const success = await updateProfile(formData);
      if (success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Profile updated successfully',
          life: 3000
        });
        setShowProfileEdit(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleReportClick = (report: UserReport) => {
    navigate(`/item/${report.id}`);
  };

  const handleProfilePictureUpload = async (event: any) => {
    // This would normally handle file upload
    console.log('Profile picture upload:', event);
  };

  if (userLoading || !userData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-700">
      <Toast ref={toast} />

      {/* Main Content */}
      <div className="p-4 md:p-6 bg-slate-50">
        <div className="max-w-[1600px] mx-auto">

          {/* Profile Header */}
          <ProfileHeader
            userData={userData}
            userStats={userStats}
            onEditProfile={handleEditProfile}
            onProfilePictureUpload={handleProfilePictureUpload}
          />

          {/* Stats Cards */}
          <div className="mt-6">
            <StatsCards stats={userStats} />
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {/* Left Column - My Reports */}
            <div>
              <ReportsList
                reports={reports}
                loading={reportsLoading}
                hasMore={reportsHasMore}
                onLoadMore={loadMoreReports}
                onReportClick={handleReportClick}
                onCreateReport={() => setShowReportModal(true)}
              />
            </div>

            {/* Center Content - Recent Activity */}
            <div>
              <Card className="h-full border border-slate-100 rounded-3xl overflow-hidden bg-white shadow-sm">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    {
                      id: 1,
                      type: 'match',
                      message: 'New potential match found for your iPhone 13 Pro',
                      time: '2 hours ago',
                      icon: <Activity size={16} className="text-teal-500" />
                    },
                    {
                      id: 2,
                      type: 'view',
                      message: 'Your Blue Backpack report was viewed 5 times today',
                      time: '4 hours ago',
                      icon: <Eye size={16} className="text-teal-500" />
                    },
                    {
                      id: 3,
                      type: 'resolved',
                      message: 'Your Car Keys case has been marked as resolved',
                      time: '1 day ago',
                      icon: <CheckCircle size={16} className="text-teal-500" />
                    }
                  ].map((activity) => (
                    <div key={activity.id} className="flex align-items-start gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="p-2 bg-teal-50 rounded-xl shrink-0">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800 leading-snug">{activity.message}</p>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 block uppercase tracking-wider">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column - Watch List */}
            <div>
              <Card className="h-full border border-slate-100 rounded-3xl overflow-hidden bg-white shadow-sm">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800">Watch List</h3>
                </div>
                <div className="p-6">
                  <div
                    style={{ maxHeight: '500px', overflowY: 'auto' }}
                    className="space-y-4 custom-scrollbar"
                  >
                    {watchList.length > 0 ? (
                      watchList.map((item) => (
                        <button 
                          key={item.id} 
                          className="w-full text-left flex items-center justify-between p-4 border border-slate-50 rounded-2xl hover:shadow-md transition-all group cursor-pointer hover:border-teal-100 bg-white"
                        >
                          <div className="flex-1">
                            <h5 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{item.title}</h5>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">{item.location}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge 
                                variant={item.type === 'lost' ? 'danger' : 'success'}
                                className="text-[9px] px-2 py-0.5"
                              >
                                {item.type.toUpperCase()}
                              </Badge>
                              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">{item.similarity}% match</span>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                         <Heart size={32} className="mx-auto text-slate-200 mb-2" />
                         <p className="text-slate-400 font-bold text-sm">No items in watchlist</p>
                      </div>
                    )}

                    {watchListLoading && (
                      <div className="flex justify-center py-6">
                        <Spinner size="sm" />
                      </div>
                    )}

                    {watchListHasMore && (
                      <div className="text-center pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-teal-600 font-bold hover:bg-teal-50"
                          onClick={loadMoreWatchList}
                        >
                          Load More
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {userData && (
        <EditProfileModal
          visible={showProfileEdit}
          userData={userData}
          onHide={() => setShowProfileEdit(false)}
          onSave={handleSaveProfile}
          loading={editLoading}
        />
      )}

      {/* Create Report Modal */}
      <CreateReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        initialType="Lost"
      />
    </div>
  );
};

export default PersonalHubPage;
