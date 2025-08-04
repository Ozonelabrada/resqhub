import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Chip } from 'primereact/chip';
import { ProgressBar } from 'primereact/progressbar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { FileUpload } from 'primereact/fileupload';
import { Image } from 'primereact/image';
import { ItemsService } from '../../../../services/itemsService';

const PersonalHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [userReports, setUserReports] = useState<any[]>([]);
  const [watchList, setWatchList] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  
  // Infinite scroll states for reports
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsHasMore, setReportsHasMore] = useState(true);
  const [reportsCurrentPage, setReportsCurrentPage] = useState(1);
  
  // Infinite scroll states for watch list
  const [watchListLoading, setWatchListLoading] = useState(false);
  const [watchListHasMore, setWatchListHasMore] = useState(true);
  const [watchListCurrentPage, setWatchListCurrentPage] = useState(1);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('publicUserToken');
    if (!token) {
      navigate('/signin');
      return;
    }

    // Get user data with enhanced profile info
    const user = localStorage.getItem('publicUserData');
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserData({
        ...parsedUser,
        profilePicture: parsedUser.profilePicture || null,
        fullName: parsedUser.fullName || parsedUser.name || 'User Name',
        username: parsedUser.username || parsedUser.email?.split('@')[0] || 'username',
        bio: parsedUser.bio || 'Helping reunite lost items with their owners 🔍',
        location: parsedUser.location || 'New York, NY',
        joinDate: parsedUser.joinDate || '2025-01-01',
        successfulReturns: parsedUser.successfulReturns || 5,
        helpedPeople: parsedUser.helpedPeople || 12,
        verificationStatus: parsedUser.verificationStatus || 'verified'
      });
    }

    // Load initial data
  fetchUserReports();
  // fetchWatchList();
  loadRecentActivity();
  }, [navigate]);

const fetchUserReports = async () => {
  setReportsLoading(true);
  try {
    const userId = 'eab75ee8-3ba8-4825-9819-ec1f20104885';
    const response = await ItemsService.getReportsByUser(userId, reportsCurrentPage) as { data?: any[]; hasMore?: boolean };
    console.log('Raw API response:', response);
    let reports: any[] = [];
    if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
      reports = response.data;
    } else if (Array.isArray(response)) {
      reports = response;
    }
    const mappedReports = reports.map((r) => ({
      id: r.id || r.reportId,
      title: r.title || r.name || 'Untitled',
      category: r.category || r.type || '',
      location: r.location || '',
      date: r.date || r.createdAt || '',
      status: r.status || 'active',
      views: r.views || 0,
      type: r.type || 'lost',
      description: r.description || '',
      contactInfo: {
        name: r.contactInfo?.name || 'Unknown',
        phone: r.contactInfo?.phone || '',
        email: r.contactInfo?.email || ''
      },
      images: r.images || [],
      createdAt: r.createdAt || new Date().toISOString(),
      updatedAt: r.updatedAt || new Date().toISOString()
    }));
    console.log('Mapped reports:', mappedReports);
    setUserReports(mappedReports);
    setReportsHasMore(response.hasMore || false);
  } catch (error) {
    setUserReports([]);
    setReportsHasMore(false);
  } finally {
    setReportsLoading(false);
  }
};

// const fetchWatchList = async () => {
//   setWatchListLoading(true);
//   try {
//     // const userId = userData?.id || JSON.parse(localStorage.getItem('publicUserData') || '{}').id;
//     const userId = 'eab75ee8-3ba8-4825-9819-ec1f20104885';
//     const response = await ItemsService.getWatchListByUser(userId, watchListCurrentPage);
//     setWatchList(response. || []);
//     setWatchListHasMore(response.hasMore || false);
//   } catch (error) {
//     // Handle error
//   } finally {
//     setWatchListLoading(false);
//   }
// };

// Mobile detection
useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load more reports function
  const loadMoreReports = useCallback(() => {
    if (reportsLoading || !reportsHasMore) return;

    setReportsLoading(true);
    
    setTimeout(() => {
      const nextPage = reportsCurrentPage + 1;
      ItemsService.getReportsByUser('eab75ee8-3ba8-4825-9819-ec1f20104885', nextPage)
        .then((response) => {
          const typedResponse = response as { data?: any[]; hasMore?: boolean };
          setUserReports(prevReports => [...prevReports, ...(typedResponse.data || [])]);
          setReportsCurrentPage(nextPage);
          setReportsHasMore((response as { hasMore?: boolean }).hasMore || false);
        })
        .finally(() => {
          setReportsLoading(false);
        });

      // Simulate reaching the end after 5 pages
      if (nextPage >= 5) {
        setReportsHasMore(false);
      }
    }, 1000);
  }, [reportsCurrentPage, reportsHasMore, reportsLoading]);

  // Load more watch list items function
  const loadMoreWatchList = useCallback(() => {
    if (watchListLoading || !watchListHasMore) return;

    setWatchListLoading(true);
    
    setTimeout(() => {
      const nextPage = watchListCurrentPage + 1;
      const newWatchList = getSampleWatchList(nextPage);
      
      setWatchList(prevWatchList => [...prevWatchList, ...newWatchList]);
      setWatchListCurrentPage(nextPage);
      setWatchListLoading(false);

      // Simulate reaching the end after 4 pages
      if (nextPage >= 4) {
        setWatchListHasMore(false);
      }
    }, 1000);
  }, [watchListCurrentPage, watchListHasMore, watchListLoading]);

  // Scroll detection for reports tab
  const handleReportsScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    const { scrollTop, scrollHeight, clientHeight } = target;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200;

    if (isNearBottom && reportsHasMore && !reportsLoading) {
      loadMoreReports();
    }
  }, [reportsHasMore, reportsLoading, loadMoreReports]);

  // Scroll detection for watch list tab
  const handleWatchListScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    const { scrollTop, scrollHeight, clientHeight } = target;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200;

    if (isNearBottom && watchListHasMore && !watchListLoading) {
      loadMoreWatchList();
    }
  }, [watchListHasMore, watchListLoading, loadMoreWatchList]);

  // Attach scroll listeners
  useEffect(() => {
    const reportsContainer = document.getElementById('reports-scrollable-container');
    if (reportsContainer) {
      reportsContainer.addEventListener('scroll', handleReportsScroll, { passive: true });
      return () => reportsContainer.removeEventListener('scroll', handleReportsScroll);
    }
  }, [handleReportsScroll]);

  useEffect(() => {
    const watchListContainer = document.getElementById('watchlist-scrollable-container');
    if (watchListContainer) {
      watchListContainer.addEventListener('scroll', handleWatchListScroll, { passive: true });
      return () => watchListContainer.removeEventListener('scroll', handleWatchListScroll);
    }
  }, [handleWatchListScroll]);

  const loadRecentActivity = () => {
    // Mock recent activity
    const mockActivity = [
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
      },
      {
        id: 4,
        type: 'message',
        message: 'Someone contacted you about your wallet report',
        time: '3 hours ago',
        icon: 'pi pi-envelope'
      },
      {
        id: 5,
        type: 'bookmark',
        message: 'New item matches your watch list criteria',
        time: '5 hours ago',
        icon: 'pi pi-bookmark'
      },
      {
        id: 6,
        type: 'update',
        message: 'Your report status was updated to matched',
        time: '6 hours ago',
        icon: 'pi pi-refresh'
      }
    ];
    setRecentActivity(mockActivity);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { severity: 'info', label: 'Active' },
      matched: { severity: 'warning', label: 'Matched' },
      resolved: { severity: 'success', label: 'Resolved' },
      expired: { severity: 'danger', label: 'Expired' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge value={config.label} severity={config.severity} />;
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge 
        value={type.toUpperCase()} 
        severity={type === 'lost' ? 'danger' : 'success'}
        className="text-xs"
      />
    );
  };

  const handleProfilePictureUpload = (event: any) => {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserData(prev => ({
          ...prev,
          profilePicture: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const userStats = {
    totalReports: userReports.length,
    activeReports: userReports.filter(r => r.status === 'active').length,
    resolvedReports: userReports.filter(r => r.status === 'resolved').length,
    totalViews: userReports.reduce((sum, r) => sum + r.views, 0)
  };

  if (!userData) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', overflow: 'hidden', backgroundColor: '#f0f2f5' }}>
      <div className={`${isMobile ? 'p-3' : 'p-4'}`} style={{ height: '100%', overflow: 'auto' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          
          {/* Header Navigation */}
          <div className="flex align-items-center justify-content-between mb-4">
            <div className="flex align-items-center gap-3">
              <Button
                icon="pi pi-home"
                label="Public Hub"
                className="p-button-outlined"
                onClick={() => navigate('/')}
              />
              <i className="pi pi-chevron-right text-gray-400"></i>
              <span className="text-xl font-bold">Personal Hub</span>
            </div>
            
            <Button
              label="Report Item"
              icon="pi pi-plus"
              onClick={() => navigate('/report')}
              className="p-button-primary"
            />
          </div>

          {/* Facebook-like Profile Header */}
          <Card className="mb-4 p-0" style={{ overflow: 'hidden' }}>
            {/* Cover Photo Area */}
            <div 
              className="relative h-12rem md:h-15rem"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundImage: userData.coverPhoto ? `url(${userData.coverPhoto})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute top-2 right-2">
                <Button
                  icon="pi pi-camera"
                  className="p-button-rounded p-button-outlined"
                  style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                  tooltip="Change cover photo"
                />
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="p-4">
              <div className="flex flex-column md:flex-row align-items-start md:align-items-end gap-4" style={{ marginTop: '-3rem' }}>
                {/* Profile Picture */}
                <div className="relative">
                  <div className="relative">
                    {userData.profilePicture ? (
                      <Image
                        src={userData.profilePicture}
                        alt="Profile"
                        className="border-circle border-4 border-white shadow-4"
                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                      />
                    ) : (
                      <Avatar 
                        icon="pi pi-user" 
                        size="xlarge"
                        shape="circle"
                        className="border-4 border-white shadow-4"
                        style={{ 
                          width: '120px', 
                          height: '120px', 
                          fontSize: '3rem',
                          backgroundColor: '#667eea', 
                          color: 'white' 
                        }}
                      />
                    )}
                    
                    {/* Profile Picture Upload */}
                    <div className="absolute bottom-0 right-0">
                      <FileUpload
                        mode="basic"
                        name="profilePic"
                        accept="image/*"
                        maxFileSize={5000000}
                        onSelect={handleProfilePictureUpload}
                        chooseOptions={{
                          icon: 'pi pi-camera',
                          className: 'p-button-rounded p-button-sm',
                          style: { 
                            width: '2.5rem', 
                            height: '2.5rem',
                            backgroundColor: '#e4e6ea',
                            border: '2px solid white',
                            color: '#333'
                          }
                        }}
                        auto
                      />
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex flex-column md:flex-row justify-content-between align-items-start">
                    <div>
                      <div className="flex align-items-center gap-2 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 m-0">
                          {userData.fullName}
                        </h1>
                        {userData.verificationStatus === 'verified' && (
                          <i className="pi pi-verified text-blue-500 text-xl" title="Verified User"></i>
                        )}
                      </div>
                      
                      <div className="flex align-items-center gap-2 mb-2">
                        <span className="text-gray-600">@{userData.username}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">
                          <i className="pi pi-users mr-1"></i>
                          {userData.helpedPeople} people helped
                        </span>
                      </div>

                      <p className="text-gray-700 mb-2 max-w-30rem">{userData.bio}</p>
                      
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <div className="flex align-items-center gap-1">
                          <i className="pi pi-map-marker"></i>
                          <span>{userData.location}</span>
                        </div>
                        <div className="flex align-items-center gap-1">
                          <i className="pi pi-calendar"></i>
                          <span>
                            Joined {new Date(userData.joinDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            })}
                          </span>
                        </div>
                        <div className="flex align-items-center gap-1">
                          <i className="pi pi-check-circle text-green-500"></i>
                          <span>{userData.successfulReturns} successful returns</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3 md:mt-0">
                      <Button
                        label="Edit Profile"
                        icon="pi pi-user-edit"
                        className="p-button-outlined"
                        onClick={() => setShowProfileEdit(true)}
                      />
                      <Button
                        label="Settings"
                        icon="pi pi-cog"
                        className="p-button-outlined"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Stats Cards */}
          <div className="grid mb-4">
            <div className="col-6 md:col-3">
              <Card className="text-center h-full" style={{ backgroundColor: '#e3f2fd' }}>
                <div className="p-3">
                  <i className="pi pi-file text-blue-600 text-2xl mb-2 block"></i>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{userStats.totalReports}</div>
                  <div className="text-gray-700 text-sm">Total Reports</div>
                </div>
              </Card>
            </div>
            <div className="col-6 md:col-3">
              <Card className="text-center h-full" style={{ backgroundColor: '#e8f5e8' }}>
                <div className="p-3">
                  <i className="pi pi-check-circle text-green-600 text-2xl mb-2 block"></i>
                  <div className="text-2xl font-bold text-green-600 mb-1">{userStats.resolvedReports}</div>
                  <div className="text-gray-700 text-sm">Resolved</div>
                </div>
              </Card>
            </div>
            <div className="col-6 md:col-3">
              <Card className="text-center h-full" style={{ backgroundColor: '#fff3e0' }}>
                <div className="p-3">
                  <i className="pi pi-clock text-orange-600 text-2xl mb-2 block"></i>
                  <div className="text-2xl font-bold text-orange-600 mb-1">{userStats.activeReports}</div>
                  <div className="text-gray-700 text-sm">Active Cases</div>
                </div>
              </Card>
            </div>
            <div className="col-6 md:col-3">
              <Card className="text-center h-full" style={{ backgroundColor: '#f3e5f5' }}>
                <div className="p-3">
                  <i className="pi pi-eye text-purple-600 text-2xl mb-2 block"></i>
                  <div className="text-2xl font-bold text-purple-600 mb-1">{userStats.totalViews}</div>
                  <div className="text-gray-700 text-sm">Total Views</div>
                </div>
              </Card>
            </div>
          </div>

          {/* Main Content Layout - 3 Column Layout: Left Sidebar | Center Content | Right Sidebar */}
          <div className="grid">
            {/* Left Sidebar - Recent Activity */}
            <div className="col-12 lg:col-3">
              <Card className="mb-4 h-full">
                <h4 className="flex align-items-center gap-2 mb-3">
                  <i className="pi pi-bell text-blue-500"></i>
                  Recent Activity
                </h4>
                
                <div style={{ maxHeight: '600px', overflow: 'auto' }}>
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex gap-3 p-3 border-bottom-1 surface-border last:border-bottom-0 hover:bg-gray-50 cursor-pointer border-round">
                      <div 
                        className="w-3rem h-3rem bg-blue-100 border-round flex align-items-center justify-content-center flex-shrink-0"
                      >
                        <i className={`${activity.icon} text-blue-600`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1 line-height-3">{activity.message}</div>
                        <div className="text-xs text-gray-500">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Divider />

                <div className="text-center">
                  <Button
                    label="View All Notifications"
                    icon="pi pi-bell"
                    className="p-button-outlined p-button-sm w-full"
                  />
                </div>
              </Card>
            </div>

            {/* Center Content - Main Tabs */}
            <div className="col-12 lg:col-6">
              <TabView>
                <TabPanel header="My Reports" leftIcon="pi pi-list mr-2">
                  <div className="mb-3">
                    <div className="flex align-items-center justify-content-between">
                      <div>
                        <h3 className="m-0">Your Reports</h3>
                        <p className="text-sm text-gray-600 mt-1 mb-0">
                          Showing {userReports.length} reports • {reportsHasMore ? 'Scroll down for more' : 'All loaded'}
                        </p>
                      </div>
                      <Button
                        label="New Report"
                        icon="pi pi-plus"
                        size="small"
                        onClick={() => navigate('/report')}
                      />
                    </div>
                  </div>

                  {/* Scrollable Reports Container */}
                  <div 
                    id="reports-scrollable-container"
                    style={{ 
                      maxHeight: '700px', 
                      overflow: 'auto',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: 'white'
                    }}
                  >
                    {/* Reports List */}
                    <div className="p-3">
                      {userReports.map((report, index) => (
                        <Card key={report.id} className="mb-3 shadow-1">
                          <div className="grid align-items-center" style={{ margin: 0 }}>
                            <div className="col-12 md:col-6" style={{ padding: '0.5rem' }}>
                              <div className="flex align-items-center gap-2">
                                {getTypeBadge(report.type)}
                                <div>
                                  <div className="font-semibold">{report.title}</div>
                                  <div className="text-sm text-gray-500">{report.category}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="col-12 md:col-3" style={{ padding: '0.5rem' }}>
                              <div className="text-sm">
                                <i className="pi pi-map-marker mr-1 text-blue-500"></i>
                                {report.location}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(report.date).toLocaleDateString()}
                              </div>
                            </div>
                            
                            <div className="col-12 md:col-3" style={{ padding: '0.5rem' }}>
                              <div className="flex align-items-center justify-content-between">
                                <div>
                                  {getStatusBadge(report.status)}
                                  <div className="mt-1">
                                    <Chip label={`${report.views} views`} className="bg-blue-100 text-blue-700 text-xs" />
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    icon="pi pi-eye"
                                    className="p-button-rounded p-button-outlined p-button-sm"
                                    tooltip="View Details"
                                  />
                                  <Button
                                    icon="pi pi-pencil"
                                    className="p-button-rounded p-button-outlined p-button-sm"
                                    tooltip="Edit"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}

                      {/* Loading Indicator for Reports */}
                      {reportsLoading && (
                        <div className="text-center p-4">
                          <ProgressSpinner style={{ width: '40px', height: '40px' }} />
                          <p className="mt-2 text-gray-600">Loading more reports...</p>
                        </div>
                      )}

                      {/* End of Reports Message */}
                      {!reportsHasMore && userReports.length > 0 && (
                        <div className="text-center p-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-round-lg p-4 border-2 border-dashed border-blue-300">
                            <i className="pi pi-check-circle text-blue-500 text-2xl mb-2 block"></i>
                            <p className="text-blue-700 font-semibold mb-1">All reports loaded!</p>
                            <p className="text-blue-600 text-sm">You've viewed all your reports.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabPanel>

                <TabPanel header="Watch List" leftIcon="pi pi-bookmark mr-2">
                  <div className="mb-3">
                    <div>
                      <h3 className="m-0">Items You're Watching</h3>
                      <p className="text-gray-600 text-sm mt-1 mb-0">
                        Items that might match your lost items • Showing {watchList.length} items • {watchListHasMore ? 'Scroll down for more' : 'All loaded'}
                      </p>
                    </div>
                  </div>

                  {/* Scrollable Watch List Container */}
                  <div 
                    id="watchlist-scrollable-container"
                    style={{ 
                      maxHeight: '700px', 
                      overflow: 'auto',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: 'white'
                    }}
                  >
                    <div className="p-3">
                      {watchList.length > 0 ? (
                        <div>
                          <div className="grid">
                            {watchList.map((item) => (
                              <div key={item.id} className="col-12 md:col-6">
                                <Card className="h-full mb-3 shadow-1">
                                  <div className="flex align-items-center justify-content-between mb-3">
                                    <div className="flex align-items-center gap-2">
                                      {getTypeBadge(item.type)}
                                      <span className="font-semibold">{item.title}</span>
                                    </div>
                                    <Chip 
                                      label={`${item.similarity}% match`} 
                                      className="bg-green-100 text-green-700 text-xs"
                                    />
                                  </div>
                                  
                                  <div className="text-sm text-gray-600 mb-3">
                                    <div className="flex align-items-center gap-1 mb-1">
                                      <i className="pi pi-map-marker"></i>
                                      {item.location}
                                    </div>
                                    <div className="flex align-items-center gap-1">
                                      <i className="pi pi-calendar"></i>
                                      {new Date(item.date).toLocaleDateString()}
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      label="View Details"
                                      icon="pi pi-eye"
                                      size="small"
                                      className="flex-1"
                                    />
                                    <Button
                                      icon="pi pi-bookmark-fill"
                                      className="p-button-outlined p-button-sm"
                                      tooltip="Remove from watchlist"
                                    />
                                  </div>
                                </Card>
                              </div>
                            ))}
                          </div>

                          {/* Loading Indicator for Watch List */}
                          {watchListLoading && (
                            <div className="text-center p-4">
                              <ProgressSpinner style={{ width: '40px', height: '40px' }} />
                              <p className="mt-2 text-gray-600">Loading more items...</p>
                            </div>
                          )}

                          {/* End of Watch List Message */}
                          {!watchListHasMore && watchList.length > 0 && (
                            <div className="text-center p-4">
                              <div className="bg-gradient-to-br from-green-50 to-green-100 border-round-lg p-4 border-2 border-dashed border-green-300">
                                <i className="pi pi-check-circle text-green-500 text-2xl mb-2 block"></i>
                                <p className="text-green-700 font-semibold mb-1">All watch list items loaded!</p>
                                <p className="text-green-600 text-sm">You've viewed all items in your watch list.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <i className="pi pi-bookmark text-gray-300" style={{ fontSize: '3rem' }}></i>
                          <h4 className="text-gray-500 mt-3">No items in your watch list</h4>
                          <p className="text-gray-400">Start browsing to find items that might interest you</p>
                          <Button
                            label="Browse Items"
                            icon="pi pi-search"
                            onClick={() => navigate('/search')}
                            className="mt-3"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </TabPanel>
              </TabView>
            </div>

            {/* Right Sidebar - Quick Tips */}
            <div className="col-12 lg:col-3">
              <Card className="h-full">
                <h4 className="flex align-items-center gap-2 mb-4">
                  <i className="pi pi-lightbulb text-yellow-500"></i>
                  Quick Tips
                </h4>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border-round-lg border-1 border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors transition-duration-200">
                    <div className="flex align-items-center gap-2 mb-2">
                      <div className="w-2rem h-2rem bg-blue-500 border-round flex align-items-center justify-content-center">
                        <span className="text-white">📱</span>
                      </div>
                      <div className="font-bold text-blue-800">Upload Clear Photos</div>
                    </div>
                    <div className="text-sm text-blue-700 line-height-3">
                      Clear, well-lit photos increase your chances of recovery by 60%. Use multiple angles and good lighting.
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 border-round-lg border-1 border-green-200 hover:bg-green-100 cursor-pointer transition-colors transition-duration-200">
                    <div className="flex align-items-center gap-2 mb-2">
                      <div className="w-2rem h-2rem bg-green-500 border-round flex align-items-center justify-content-center">
                        <span className="text-white">📍</span>
                      </div>
                      <div className="font-bold text-green-800">Be Specific with Location</div>
                    </div>
                    <div className="text-sm text-green-700 line-height-3">
                      Include landmarks, specific areas, and nearby businesses for better matches and easier identification.
                    </div>
                  </div>
                  
                  <div className="p-4 bg-orange-50 border-round-lg border-1 border-orange-200 hover:bg-orange-100 cursor-pointer transition-colors transition-duration-200">
                    <div className="flex align-items-center gap-2 mb-2">
                      <div className="w-2rem h-2rem bg-orange-500 border-round flex align-items-center justify-content-center">
                        <span className="text-white">⏰</span>
                      </div>
                      <div className="font-bold text-orange-800">Act Fast</div>
                    </div>
                    <div className="text-sm text-orange-700 line-height-3">
                      Items reported within 24 hours have higher recovery rates. Time is crucial for success.
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 border-round-lg border-1 border-purple-200 hover:bg-purple-100 cursor-pointer transition-colors transition-duration-200">
                    <div className="flex align-items-center gap-2 mb-2">
                      <div className="w-2rem h-2rem bg-purple-500 border-round flex align-items-center justify-content-center">
                        <span className="text-white">🤝</span>
                      </div>
                      <div className="font-bold text-purple-800">Stay Connected</div>
                    </div>
                    <div className="text-sm text-purple-700 line-height-3">
                      Respond quickly to potential matches to build trust and increase your credibility score.
                    </div>
                  </div>

                  <div className="p-4 bg-teal-50 border-round-lg border-1 border-teal-200 hover:bg-teal-100 cursor-pointer transition-colors transition-duration-200">
                    <div className="flex align-items-center gap-2 mb-2">
                      <div className="w-2rem h-2rem bg-teal-500 border-round flex align-items-center justify-content-center">
                        <span className="text-white">🔍</span>
                      </div>
                      <div className="font-bold text-teal-800">Use Keywords</div>
                    </div>
                    <div className="text-sm text-teal-700 line-height-3">
                      Include brand names, model numbers, and distinctive features in your descriptions for better searchability.
                    </div>
                  </div>

                  <div className="p-4 bg-pink-50 border-round-lg border-1 border-pink-200 hover:bg-pink-100 cursor-pointer transition-colors transition-duration-200">
                    <div className="flex align-items-center gap-2 mb-2">
                      <div className="w-2rem h-2rem bg-pink-500 border-round flex align-items-center justify-content-center">
                        <span className="text-white">💡</span>
                      </div>
                      <div className="font-bold text-pink-800">Set Alerts</div>
                    </div>
                    <div className="text-sm text-pink-700 line-height-3">
                      Enable notifications for potential matches and new items that meet your search criteria.
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalHubPage;