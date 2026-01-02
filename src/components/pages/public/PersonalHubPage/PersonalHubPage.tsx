
import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { useUserProfile } from '../../../../hooks/useUserProfile';
import { useUserReports } from '../../../../hooks/useUserReports';
import { useWatchList } from '../../../../hooks/useWatchList';
import type { EditProfileForm, UserReport, UserStats } from '../../../../types/personalHub';
import { ProfileHeader } from '../personalHub/ProfileHeader';
import { StatsCards } from '../personalHub/StatsCards';
import { ReportsList } from '../personalHub/ReportsList';
import { EditProfileModal } from '../personalHub/EditProfileModal';


const PersonalHubPage: React.FC = () => {
  const toast = useRef<Toast>(null);

  // State
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Custom hooks
  const { userData, loading: userLoading, updateProfile } = useUserProfile();
  const { reports, loading: reportsLoading, hasMore: reportsHasMore, loadMore: loadMoreReports } = useUserReports(userData?.id || null);
  const { items: watchList, loading: watchListLoading, hasMore: watchListHasMore, loadMore: loadMoreWatchList } = useWatchList();

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
      <div className="flex flex-column justify-content-center align-items-center" style={{ height: '100vh' }}>
        <ProgressSpinner />
        <p className="mt-3 text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#495560ff' }}>
      <Toast ref={toast} />

      {/* Main Content */}
      <div className={`${isMobile ? 'p-3' : 'p-4'}`} style={{ backgroundColor: '#f0f2f5' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>

          {/* Profile Header */}
          <ProfileHeader
            userData={userData}
            userStats={userStats}
            onEditProfile={handleEditProfile}
            onProfilePictureUpload={handleProfilePictureUpload}
          />

          {/* Stats Cards */}
          {/* <StatsCards stats={userStats} /> */}

          {/* Main Content Layout */}
          <div className="grid">
            {/* Left Sidebar - Reports */}
            <div className="col-12 lg:col-4 mb-4">
              <ReportsList
                reports={reports}
                loading={reportsLoading}
                hasMore={reportsHasMore}
                onLoadMore={loadMoreReports}
                onReportClick={handleReportClick}
              />
            </div>

            {/* Center Content - Activity Feed */}
            <div className="col-12 lg:col-4 mb-4">
              <Card className="h-full">
                <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  {/* Mock activity items */}
                  {[
                    {
                      id: 1,
                      type: 'match',
                      message: 'New potential match found for your iPhone 13 Pro',
                      time: '2 hours ago',
                      icon: 'pi pi-eye'
                    },
                    {
                      id: 2,
                      type: 'view',
                      message: 'Your Blue Backpack report was viewed 5 times today',
                      time: '4 hours ago',
                      icon: 'pi pi-chart-line'
                    },
                    {
                      id: 3,
                      type: 'resolved',
                      message: 'Your Car Keys case has been marked as resolved',
                      time: '1 day ago',
                      icon: 'pi pi-check-circle'
                    }
                  ].map((activity) => (
                    <div key={activity.id} className="flex align-items-start gap-3 p-3 border-1 border-gray-200 border-round">
                      <i className={`${activity.icon} text-blue-500 mt-1`}></i>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 m-0">{activity.message}</p>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Sidebar - Watch List */}
            <div className="col-12 lg:col-4 mb-4">
              <Card className="h-full">
                <h3 className="text-lg font-semibold mb-3">Watch List</h3>
                <div
                  style={{ maxHeight: '400px', overflowY: 'auto' }}
                  className="space-y-3"
                >
                  {watchList.map((item) => (
                    <div key={item.id} className="flex align-items-center justify-content-between p-3 border-1 border-gray-200 border-round">
                      <div>
                        <h5 className="font-medium m-0">{item.title}</h5>
                        <p className="text-sm text-gray-600 m-0">{item.location}</p>
                        <div className="flex align-items-center gap-2 mt-1">
                          <span className={`badge ${item.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {item.type.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">{item.similarity}% match</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {watchListLoading && (
                    <div className="flex justify-content-center py-3">
                      <ProgressSpinner style={{ width: '20px', height: '20px' }} />
                    </div>
                  )}

                  {watchListHasMore && (
                    <div className="text-center py-2">
                      <Button
                        label="Load More"
                        icon="pi pi-plus"
                        className="p-button-text p-button-sm"
                        onClick={loadMoreWatchList}
                        loading={watchListLoading}
                      />
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showProfileEdit}
        userData={userData}
        onHide={() => setShowProfileEdit(false)}
        onSave={handleSaveProfile}
        loading={editLoading}
      />
    </div>
  );
};

export default PersonalHubPage;
  