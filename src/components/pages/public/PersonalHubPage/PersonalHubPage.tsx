import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { TabView, TabPanel } from 'primereact/tabview';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Chip } from 'primereact/chip';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { FileUpload } from 'primereact/fileupload';
import { Menu } from 'primereact/menu';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Logo } from '../../../ui';
import { ItemsService } from '../../../../services/itemsService';
import { UserService } from '../../../../services/userService';

const PersonalHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [userReports, setUserReports] = useState<any[]>([]);
  const [watchList, setWatchList] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const accountMenuRef = useRef<Menu>(null);
  const toast = useRef<Toast>(null);
  
  // Infinite scroll states for reports
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsHasMore, setReportsHasMore] = useState(true);
  const [reportsCurrentPage, setReportsCurrentPage] = useState(1);
  
  // Infinite scroll states for watch list
  const [watchListLoading, setWatchListLoading] = useState(false);
  const [watchListHasMore, setWatchListHasMore] = useState(true);
  const [watchListCurrentPage, setWatchListCurrentPage] = useState(1);

  // Edit Profile Modal states
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    location: '',
    profilePicture: '',
    coverPhoto: ''
  });
  const [editLoading, setEditLoading] = useState(false);

  // Check authentication status and fetch user data from backend
  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      const token = localStorage.getItem('publicUserToken');
      
      if (!token) {
        navigate('/signin');
        return;
      }

      setIsAuthenticated(true);
      setUserLoading(true);

      try {
        // Get user ID from localStorage first
        const currentUserId = UserService.getCurrentUserId();
        
        if (!currentUserId) {
          console.error('No user ID found in localStorage');
          navigate('/signin');
          return;
        }

        // Fetch user data from backend using the user ID
        const backendUserData = await UserService.getCurrentUser(currentUserId);
        console.log('Backend user data received:', backendUserData);
        
        // Transform backend data to frontend format
        const transformedUserData = UserService.transformUserData(backendUserData);
        console.log('Transformed user data:', transformedUserData);
        
        setUserData(transformedUserData);
        
        // Update localStorage with latest user data
        localStorage.setItem('publicUserData', JSON.stringify(transformedUserData));
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        
        // Fall back to localStorage data if backend request fails
        const localUserData = localStorage.getItem('publicUserData');
        if (localUserData) {
          try {
            const parsedUser = JSON.parse(localUserData);
            setUserData(parsedUser);
          } catch (parseError) {
            console.error('Error parsing local user data:', parseError);
            // If all else fails, redirect to signin
            navigate('/signin');
            return;
          }
        } else {
          // No local data and backend failed, redirect to signin
          navigate('/signin');
          return;
        }
      } finally {
        setUserLoading(false);
      }
    };

    checkAuthAndFetchUser();

    // Listen for storage changes (when user signs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'publicUserToken') {
        if (!e.newValue) {
          // Token was removed, redirect to signin
          navigate('/signin');
        } else {
          // Token was added/changed, refetch user data
          checkAuthAndFetchUser();
        }
      }
    };

    // Listen for focus events (when user returns to this tab)
    const handleFocus = () => {
      const token = localStorage.getItem('publicUserToken');
      if (!token) {
        navigate('/signin');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [navigate]);

  useEffect(() => {
    if (userData && !userLoading) {
      // Load initial data after user data is loaded
      fetchUserReports();
      loadRecentActivity();
    }
  }, [userData, userLoading]);

  // Handle logout (same as HubHomePage)
  const handleLogout = () => {
    localStorage.removeItem('publicUserToken');
    localStorage.removeItem('publicUserData');
    setIsAuthenticated(false);
    setUserData(null);
    navigate('/signin');
  };

  // Account menu items (same as HubHomePage)
  const accountMenuItems = [
    {
      label: 'My Profile',
      icon: 'pi pi-user',
      command: () => navigate('/profile')
    },
    {
      label: 'Public Hub',
      icon: 'pi pi-home',
      command: () => navigate('/')
    },
    {
      label: 'My Reports',
      icon: 'pi pi-list',
      command: () => navigate('/hub?tab=reports')
    },
    {
      label: 'Notifications',
      icon: 'pi pi-bell',
      command: () => navigate('/notifications')
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => navigate('/settings')
    },
    {
      separator: true
    },
    {
      label: 'Admin Panel',
      icon: 'pi pi-shield',
      command: () => navigate('/admin/login'),
      className: 'text-orange-600'
    },
    {
      separator: true
    },
    {
      label: 'Help & Support',
      icon: 'pi pi-question-circle',
      command: () => navigate('/help')
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: handleLogout,
      className: 'text-red-600'
    }
  ];

  const showAccountMenu = (event: React.MouseEvent) => {
    accountMenuRef.current?.toggle(event);
  };

  const fetchUserReports = async (loadMore = false) => {
    // Get current user ID
    const currentUserId = UserService.getCurrentUserId();
    if (!currentUserId) {
      console.error('No user ID found');
      return;
    }
    
    setReportsLoading(true);
    try {
      // Use the correct endpoint to fetch all user reports
      const response = await ItemsService.getReportsByUser(currentUserId, loadMore ? reportsCurrentPage + 1 : 1);
      console.log('Raw API response for user reports:', response);
      
      let reports: any[] = [];
      let hasMore = false;
      
      // Handle the nested response structure from backend
      if (response && typeof response === 'object') {
        // Check for nested data structure: response.data.data
        if (
          'data' in response &&
          response.data &&
          typeof response.data === 'object' &&
          'data' in response.data &&
          Array.isArray((response.data as any).data)
        ) {
          reports = (response.data as any).data;
          hasMore = (response.data as any).hasMore || (response.data as any).loadMore || false;
          console.log('Found reports in nested data structure:', reports.length);
        }
        // Fallback: Check for direct data array
        else if ('data' in response && Array.isArray(response.data)) {
          reports = response.data;
          hasMore = (response as any).hasMore || false;
          console.log('Found reports in direct data structure:', reports.length);
        }
        // Fallback: Check for reports array
        else if ('reports' in response && Array.isArray(response.reports)) {
          reports = response.reports;
          hasMore = (response as any).hasMore || false;
          console.log('Found reports in reports structure:', reports.length);
        }
        // Fallback: Check if response itself is an array
        else if (Array.isArray(response)) {
          reports = response;
          hasMore = false;
          console.log('Found reports as direct array:', reports.length);
        }
      }
      
      console.log('Extracted reports array:', reports);
      
      // Transform the reports to match the expected frontend format
      const mappedReports = reports.map((report) => ({
        id: report.id || report.reportId,
        title: report.title || report.itemName || 'Untitled Report',
        category: report.category || report.itemCategory || 'Other',
        location: report.incidentLocation || report.location || 'Unknown Location',
        currentLocation: report.currentLocation || '',
        date: report.incidentDate !== '0001-01-01T00:00:00' ? report.incidentDate : report.createdAt || new Date().toISOString(),
        time: report.incidentTime || '',
        status: report.statusDescription?.toLowerCase() || 'active',
        views: report.viewsCount || report.views || 0,
        type: report.reportType === 1 ? 'lost' : 'found',
        description: report.description || '',
        circumstances: report.circumstances || '',
        identifyingFeatures: report.identifyingFeatures || '',
        condition: getConditionLabel(report.condition || 2),
        handoverPreference: getHandoverLabel(report.handoverPreference || 1),
        contactInfo: {
          name: report.contactName || 'Unknown',
          phone: report.contactPhone || '',
          email: report.contactEmail || '',
          preferredContact: getContactMethodLabel(report.preferredContactMethod || 1)
        },
        reward: {
          amount: report.rewardAmount || 0,
          description: report.rewardDescription || ''
        },
        images: report.imageUrls || [],
        storageLocation: report.storageLocation || '',
        createdAt: report.createdAt || new Date().toISOString(),
        updatedAt: report.dateModified || report.updatedAt || new Date().toISOString(),
        expiresAt: report.expiresAt,
        // Add additional backend fields for reference
        reportTypeDescription: report.reportTypeDescription,
        verificationStatus: report.verificationStatusDescription,
        potentialMatches: report.potentialMatchesCount || 0
      }));
      
      console.log('Mapped user reports:', mappedReports);
      
      if (loadMore) {
        setUserReports(prevReports => [...prevReports, ...mappedReports]);
        setReportsCurrentPage(prev => prev + 1);
      } else {
        setUserReports(mappedReports);
        setReportsCurrentPage(1);
      }
      
      setReportsHasMore(hasMore);
    } catch (error) {
      console.error('Error fetching user reports:', error);
      setUserReports([]);
      setReportsHasMore(false);
    } finally {
      setReportsLoading(false);
    }
  };

  // Add these helper functions to transform numeric values to readable labels
  const getConditionLabel = (condition: number): string => {
    const conditionMap: { [key: number]: string } = {
      1: 'excellent',
      2: 'good',
      3: 'fair',
      4: 'damaged'
    };
    return conditionMap[condition] || 'good';
  };

  const getHandoverLabel = (handover: number): string => {
    const handoverMap: { [key: number]: string } = {
      1: 'meet',
      2: 'pickup',
      3: 'mail'
    };
    return handoverMap[handover] || 'meet';
  };

  const getContactMethodLabel = (method: number): string => {
    const methodMap: { [key: number]: string } = {
      1: 'phone',
      2: 'email',
      3: 'both'
    };
    return methodMap[method] || 'phone';
  };

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
    fetchUserReports(true);
  }, [reportsLoading, reportsHasMore]);

  // Sample data function for watch list
  const getSampleWatchList = (page: number) => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: `watch-${page}-${i + 1}`,
      title: `Watch Item ${page}-${i + 1}`,
      type: Math.random() > 0.5 ? 'lost' : 'found',
      location: 'Sample Location',
      date: new Date().toISOString(),
      similarity: Math.floor(Math.random() * 30) + 70
    }));
  };

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

  // Scroll detection handlers
  const handleReportsScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    const { scrollTop, scrollHeight, clientHeight } = target;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200;

    if (isNearBottom && reportsHasMore && !reportsLoading) {
      loadMoreReports();
    }
  }, [reportsHasMore, reportsLoading, loadMoreReports]);

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
    return <Badge value={config.label}/>;
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

  const handleProfilePictureUpload = async (event: any) => {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const profilePictureData = e.target?.result as string;
        
        try {
          // Update user data locally first for immediate UI update
          setUserData((prev: any) => ({
            ...prev,
            profilePicture: profilePictureData
          }));

          // Get current user ID
          const currentUserId = UserService.getCurrentUserId();
          if (!currentUserId) {
            throw new Error('User ID not found');
          }

          // Update user profile on backend
          const updatedUser = await UserService.updateUserProfile(currentUserId, {
            profilePicture: profilePictureData
          });
          
          // Update local storage with the response
          const transformedUserData = UserService.transformUserData(updatedUser);
          localStorage.setItem('publicUserData', JSON.stringify(transformedUserData));
          setUserData(transformedUserData);
          
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Profile picture updated successfully',
            life: 3000
          });
        } catch (error) {
          console.error('Error updating profile picture:', error);
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update profile picture',
            life: 3000
          });
          
          // Revert the local change on error
          setUserData((prev: { profilePicture: any; }) => ({
            ...prev,
            profilePicture: prev.profilePicture
          }));
        }
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

  // Handle edit form input changes
  const handleEditInputChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle profile picture change in edit modal
  const handleEditProfilePictureUpload = (event: any) => {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const profilePictureData = e.target?.result as string;
        setEditFormData(prev => ({
          ...prev,
          profilePicture: profilePictureData
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle cover photo change in edit modal
  const handleEditCoverPhotoUpload = (event: any) => {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const coverPhotoData = e.target?.result as string;
        setEditFormData(prev => ({
          ...prev,
          coverPhoto: coverPhotoData
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setEditLoading(true);
    
    try {
      // Get current user ID
      const currentUserId = UserService.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('User ID not found');
      }

      // Update user profile on backend
      const updatedUser = await UserService.updateUserProfile(currentUserId, {
        fullName: editFormData.fullName,
        username: editFormData.username,
        bio: editFormData.bio,
        location: editFormData.location,
        profilePicture: editFormData.profilePicture,
        coverPhoto: editFormData.coverPhoto
      });
      
      // Check if we got valid data back
      if (updatedUser && updatedUser.id) {
        // Update local storage and state with the response
        const transformedUserData = UserService.transformUserData(updatedUser);
        localStorage.setItem('publicUserData', JSON.stringify(transformedUserData));
        setUserData(transformedUserData);
      } else {
        // If backend doesn't return updated data, update locally
        const updatedUserData = {
          ...userData,
          fullName: editFormData.fullName,
          username: editFormData.username,
          bio: editFormData.bio,
          location: editFormData.location,
          profilePicture: editFormData.profilePicture,
          coverPhoto: editFormData.coverPhoto
        };
        setUserData(updatedUserData);
        localStorage.setItem('publicUserData', JSON.stringify(updatedUserData));
      }
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Profile updated successfully',
        life: 3000
      });
      
      setShowProfileEdit(false);
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

  // Cancel edit modal
  const handleCancelEdit = () => {
    // Reset form data to original values
    if (userData) {
      setEditFormData({
        fullName: userData.fullName || '',
        username: userData.username || '',
        bio: userData.bio || '',
        location: userData.location || '',
        profilePicture: userData.profilePicture || '',
        coverPhoto: userData.coverPhoto || ''
      });
    }
    setShowProfileEdit(false);
  };

  // Location options
  const locationOptions = [
    { label: 'Select Location', value: '' },
    { label: 'New York, NY', value: 'New York, NY' },
    { label: 'Los Angeles, CA', value: 'Los Angeles, CA' },
    { label: 'Chicago, IL', value: 'Chicago, IL' },
    { label: 'Houston, TX', value: 'Houston, TX' },
    { label: 'Phoenix, AZ', value: 'Phoenix, AZ' },
    { label: 'Philadelphia, PA', value: 'Philadelphia, PA' },
    { label: 'San Antonio, TX', value: 'San Antonio, TX' },
    { label: 'San Diego, CA', value: 'San Diego, CA' },
    { label: 'Dallas, TX', value: 'Dallas, TX' },
    { label: 'San Jose, CA', value: 'San Jose, CA' }
  ];

  // Initialize edit form data when userData changes
  useEffect(() => {
    if (userData) {
      setEditFormData({
        fullName: userData.fullName || '',
        username: userData.username || '',
        bio: userData.bio || '',
        location: userData.location || '',
        profilePicture: userData.profilePicture || '',
        coverPhoto: userData.coverPhoto || ''
      });
    }
  }, [userData]);

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
      
      {/* Hero Section with Header (same as HubHomePage) */}
      <div 
        className="relative"
        style={{
          background: 'linear-gradient(135deg, #353333ff 0%, #475a4bff 50%, #888887ff 100%)',
          color: 'white',
          paddingTop: '1rem',
          paddingBottom: '.5rem'
        }}
      >
        {/* Navigation Header */}
        <div className={`${isMobile ? 'px-4' : 'px-8'} mb-4`}>
          <div className="flex align-items-center justify-content-between">
            <Logo 
              size={isMobile ? 'small' : 'medium'} 
              variant="full"
              onClick={() => navigate('/')}
            />
            
            {isAuthenticated ? (
              <div className="flex align-items-center gap-3">
                <div className="text-right">
                  <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Welcome back,</div>
                  <div className="font-semibold text-white">{userData?.fullName || userData?.name}</div>
                </div>
                
                {/* Account Avatar with Dropdown */}
                <div className="relative">
                  {userData?.profilePicture ? (
                    <Avatar 
                      image={userData.profilePicture}
                      shape="circle" 
                      onClick={showAccountMenu}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200"
                    />
                  ) : (
                    <Avatar 
                      icon="pi pi-user" 
                      shape="circle" 
                      style={{ backgroundColor: 'white', color: '#1e40af' }}
                      onClick={showAccountMenu}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200"
                    />
                  )}
                  <Menu 
                    model={accountMenuItems} 
                    popup 
                    ref={accountMenuRef} 
                    className="mt-2"
                    style={{ minWidth: '220px' }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button 
                  label="Sign In"
                  icon="pi pi-sign-in"
                  onClick={() => navigate('/signin')}
                  className="p-button-outlined p-button-sm"
                  style={{ 
                    borderColor: 'rgba(255, 255, 255, 0.8)', 
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                />
                <Button 
                  label="Admin"
                  icon="pi pi-shield"
                  onClick={() => navigate('/admin/login')}
                  className="p-button-text p-button-sm"
                  style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className={`${isMobile ? 'p-3' : 'p-4'}`} style={{ backgroundColor: '#f0f2f5' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          
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
                      <div
                        className="border-circle border-4 border-white shadow-4"
                        style={{ 
                          width: '120px', 
                          height: '120px',
                          backgroundImage: `url(${userData.profilePicture})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
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
                        {userData.emailVerified && (
                          <i className="pi pi-check-circle text-green-500 text-xl" title="Email Verified"></i>
                        )}
                      </div>
                      
                      <div className="flex align-items-center gap-2 mb-2">
                        <span className="text-gray-600">@{userData.username}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">
                          <i className="pi pi-users mr-1"></i>
                          {userData.helpedPeople} people helped
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">
                          <i className="pi pi-envelope mr-1"></i>
                          {userData.email}
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
              <Card className="text-center" style={{ backgroundColor: '#e3f2fd' }}>
                <div className="p-1">
                  <i className="pi pi-file text-blue-600 text-2xl mb-2 block"></i>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{userStats.totalReports}</div>
                  <div className="text-gray-700 text-sm">Total Reports</div>
                </div>
              </Card>
            </div>
            <div className="col-6 md:col-3">
              <Card className="text-center" style={{ backgroundColor: '#e8f5e8' }}>
                <div className="p-1">
                  <i className="pi pi-check-circle text-green-600 text-2xl mb-2 block"></i>
                  <div className="text-2xl font-bold text-green-600 mb-1">{userStats.resolvedReports}</div>
                  <div className="text-gray-700 text-sm">Resolved</div>
                </div>
              </Card>
            </div>
            <div className="col-6 md:col-3">
              <Card className="text-center" style={{ backgroundColor: '#fff3e0' }}>
                <div className="p-1">
                  <i className="pi pi-clock text-orange-600 text-2xl mb-2 block"></i>
                  <div className="text-2xl font-bold text-orange-600 mb-1">{userStats.activeReports}</div>
                  <div className="text-gray-700 text-sm">Active Cases</div>
                </div>
              </Card>
            </div>
            <div className="col-6 md:col-3">
              <Card className="text-center" style={{ backgroundColor: '#f3e5f5' }}>
                <div className="p-1">
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
                      {userReports.length > 0 ? (
                        <>
                          {userReports.map((report, index) => (
                            <Card key={report.id || index} className="mb-3 shadow-1">
                              <div className="grid align-items-center" style={{ margin: 0 }}>
                                <div className="col-12 md:col-6" style={{ padding: '0.5rem' }}>
                                  <div className="flex align-items-center gap-2">
                                    {getTypeBadge(report.type)}
                                    <div>
                                      <div className="font-semibold">{report.title || 'Untitled Report'}</div>
                                      <div className="text-sm text-gray-500">{report.category || 'Uncategorized'}</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="col-12 md:col-3" style={{ padding: '0.5rem' }}>
                                  <div className="text-sm">
                                    <i className="pi pi-map-marker mr-1 text-blue-500"></i>
                                    {report.location || 'Location not specified'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(report.date || report.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                                
                                <div className="col-12 md:col-3" style={{ padding: '0.5rem' }}>
                                  <div className="flex align-items-center justify-content-between">
                                    <div>
                                      {getStatusBadge(report.status)}
                                      <div className="mt-1">
                                        <Chip label={`${report.views || 0} views`} className="bg-blue-100 text-blue-700 text-xs" />
                                      </div>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        icon="pi pi-eye"
                                        className="p-button-rounded p-button-outlined p-button-sm"
                                        tooltip="View Details"
                                        onClick={() => console.log('View report:', report)}
                                      />
                                      <Button
                                        icon="pi pi-pencil"
                                        className="p-button-rounded p-button-outlined p-button-sm"
                                        tooltip="Edit"
                                        onClick={() => console.log('Edit report:', report)}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </>
                      ) : (
                        !reportsLoading && (
                          <div className="text-center py-6">
                            <i className="pi pi-file text-gray-300" style={{ fontSize: '3rem' }}></i>
                            <h4 className="text-gray-500 mt-3">No reports found</h4>
                            <p className="text-gray-400 mb-4">You haven't created any reports yet</p>
                            <Button
                              label="Create Your First Report"
                              icon="pi pi-plus"
                              onClick={() => navigate('/report')}
                              className="p-button-outlined"
                            />
                          </div>
                        )
                      )}

                      {/* Debug Information - Remove after fixing */}
                      {import.meta.env.MODE === 'development' && (
                        <div className="mt-4 p-3 bg-gray-50 border-round text-sm">
                          <strong>Debug Info:</strong><br />
                          Reports Length: {userReports.length}<br />
                          Reports Loading: {reportsLoading.toString()}<br />
                          Has More: {reportsHasMore.toString()}<br />
                          {userReports.length > 0 && (
                            <>Sample Report: {JSON.stringify(userReports[0], null, 2)}</>
                          )}
                        </div>
                      )}

                      {/* Loading Indicator for Reports */}
                      {reportsLoading && (
                        <div className="text-center p-4">
                          <ProgressSpinner style={{ width: '40px', height: '40px' }} />
                          <p className="mt-2 text-gray-600">Loading reports...</p>
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

      {/* Edit Profile Modal */}
      <Dialog
        header="Edit Profile"
        visible={showProfileEdit}
        style={{ width: isMobile ? '95vw' : '600px' }}
        onHide={handleCancelEdit}
        modal
        draggable={false}
        resizable={false}
      >
        <div className="p-4">
          {/* Cover Photo Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Photo</label>
            <div 
              className="relative border-round-lg overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
              style={{
                height: '200px', // Increased height to match header proportions
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundImage: editFormData.coverPhoto ? `url(${editFormData.coverPhoto})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Upload overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-20 flex align-items-center justify-content-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="text-center text-white">
                  <i className="pi pi-camera text-2xl mb-2 block"></i>
                  <span className="text-sm font-medium">
                    {editFormData.coverPhoto ? 'Change Cover Photo' : 'Upload Cover Photo'}
                  </span>
                </div>
              </div>
              
              {/* Hidden file upload */}
              <FileUpload
                mode="basic"
                name="coverPhoto"
                accept="image/*"
                maxFileSize={5000000}
                onSelect={handleEditCoverPhotoUpload}
                chooseOptions={{
                  icon: 'pi pi-camera',
                  label: '',
                  className: 'p-button-text opacity-0 w-full h-full absolute inset-0',
                  style: { 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }
                }}
                auto
              />
              
              {/* Action buttons overlay */}
              <div className="absolute top-2 right-2 flex gap-2">
                {editFormData.coverPhoto && (
                  <Button
                    icon="pi pi-times"
                    className="p-button-rounded p-button-danger p-button-sm"
                    style={{ 
                      backgroundColor: 'rgba(239, 68, 68, 0.9)',
                      border: 'none',
                      width: '2rem',
                      height: '2rem'
                    }}
                    tooltip="Remove cover photo"
                    onClick={() => setEditFormData(prev => ({ ...prev, coverPhoto: '' }))}
                  />
                )}
                <Button
                  icon="pi pi-camera"
                  className="p-button-rounded p-button-sm"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#333',
                    border: 'none',
                    width: '2rem',
                    height: '2rem'
                  }}
                  tooltip={editFormData.coverPhoto ? 'Change cover photo' : 'Upload cover photo'}
                  onClick={() => {
                    const fileInput = document.querySelector('input[name="coverPhoto"]') as HTMLInputElement;
                    fileInput?.click();
                  }}
                />
              </div>
              
              {/* Upload instructions */}
              {!editFormData.coverPhoto && (
                <div className="absolute inset-0 flex align-items-center justify-content-center">
                  <div className="text-center text-white">
                    <i className="pi pi-cloud-upload text-4xl mb-3 block opacity-60"></i>
                    <p className="text-lg font-medium mb-1">Upload Cover Photo</p>
                    <p className="text-sm opacity-80">Click to browse or drag and drop</p>
                    <p className="text-xs opacity-60 mt-2">Recommended: 1200x400px, max 5MB</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Upload progress or preview info */}
            {editFormData.coverPhoto && (
              <div className="mt-2 p-2 bg-green-50 border-round text-sm text-green-700">
                <i className="pi pi-check-circle mr-2"></i>
                Cover photo ready to save
              </div>
            )}
          </div>

          {/* Profile Picture Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
            <div className="flex align-items-center gap-4">
              {editFormData.profilePicture ? (
                <div
                  className="border-circle"
                  style={{ 
                    width: '80px', 
                    height: '80px',
                    backgroundImage: `url(${editFormData.profilePicture})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    border: '2px solid #e5e7eb'
                  }}
                />
              ) : (
                <Avatar 
                  icon="pi pi-user" 
                  size="large"
                  shape="circle"
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    fontSize: '2rem',
                  }}
                />
              )}

              {/* Profile Picture Upload (same as cover photo) */}
              <div className="relative">
                <FileUpload
                  mode="basic"
                  name="profilePicture"
                  accept="image/*"
                  maxFileSize={5000000}
                  onSelect={handleEditProfilePictureUpload}
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

          {/* User Info Fields */}
          <div className="grid">
            <div className="col-12 md:col-6">
              <div className="mb-3">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <InputText
                  id="fullName"
                  value={editFormData.fullName}
                  onChange={(e) => handleEditInputChange('fullName', e.target.value)}
                  className="w-full"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            
            <div className="col-12 md:col-6">
              <div className="mb-3">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <InputText
                  id="username"
                  value={editFormData.username}
                  onChange={(e) => handleEditInputChange('username', e.target.value)}
                  className="w-full"
                  placeholder="Enter your username"
                />
              </div>
            </div>
            
            <div className="col-12">
              <div className="mb-3">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <InputTextarea
                  id="bio"
                  value={editFormData.bio}
                  onChange={(e) => handleEditInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full"
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                />
                <small className="text-gray-500">
                  {editFormData.bio.length}/500 characters
                </small>
              </div>
            </div>
            
            <div className="col-12">
              <div className="mb-3">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Dropdown
                  id="location"
                  value={editFormData.location}
                  options={locationOptions}
                  onChange={(e) => handleEditInputChange('location', e.value)}
                  placeholder="Select your location"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-content-end gap-2 mt-4">
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-outlined"
              onClick={handleCancelEdit}
              disabled={editLoading}
            />
            <Button
              label="Save Changes"
              icon="pi pi-check"
              onClick={handleSaveProfile}
              loading={editLoading}
              disabled={!editFormData.fullName || !editFormData.username}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default PersonalHubPage;