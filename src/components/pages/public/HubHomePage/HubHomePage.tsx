import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { Chip } from 'primereact/chip';
import { Menu } from 'primereact/menu';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { Chart } from 'primereact/chart';
import { Logo } from '../../../ui';
import { useStatistics } from '../../../../hooks/useStatistics';
import { useTrendingReports } from '../../../../hooks/useTrendingReports';
import { CSSTransition } from 'react-transition-group';
import { Dialog } from 'primereact/dialog';
import CategoryService from '../../../../services/categoryService';
import { useAuth } from '../../../../context/AuthContext';

const HubHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isBelowDesktop, setIsBelowDesktop] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [categories, setCategories] = useState<{ label: string; value: string | null }[]>(
    [
      { label: 'All Categories', value: null }
    ]
  );
  const accountMenuRef = useRef<Menu>(null);
  const toast = useRef<Toast>(null);
  const guestMenuRef = useRef<Menu>(null);

  // Use custom hooks for statistics and trending reports
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const { statistics: stats, loading: statsLoading, error: statsError } = useStatistics();
  const { 
    trendingReports, 
    loading: trendingLoading, 
    error: trendingError,
    calculateAndRefresh 
  } = useTrendingReports();

  // Auto-refresh trending data periodically (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      // Silently refresh trending data every 5 minutes
      calculateAndRefresh();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [calculateAndRefresh]);

  // Show error toast if there's an API error for statistics
  useEffect(() => {
    if (statsError) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load platform statistics. Using default values.',
        life: 5000
      });
    }
  }, [statsError]);

  // Show error toast if there's an API error for trending reports
  useEffect(() => {
    if (trendingError) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Failed to load trending reports. Using default data.',
        life: 5000
      });
    }
  }, [trendingError]);

  const auth = useAuth();
  const token = auth?.token;
  const authUserData = auth?.userData;

  useEffect(() => {
    setIsAuthenticated(!!token);
    if (authUserData) {
      try {
        const parsedUser = typeof authUserData === 'string' ? JSON.parse(authUserData) : authUserData;
        setUserData(parsedUser);
      } catch (error) {
        setUserData(null);
      }
    } else {
      setUserData(null);
    }
  }, [token, authUserData]);

  // Update the effect for screen size detection:
  useEffect(() => {
    const checkScreen = () => {
      setIsBelowDesktop(window.innerWidth < 1024); // 1024px is the desktop breakpoint
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    // Fetch categories from backend
    const getCategories = async () => {
      try {
        const cats = await CategoryService.getCategories({ isActive: true });
        setCategories([
          { label: 'All Categories', value: null },
          ...cats.map((cat: any) => ({
            label: cat.name,
            value: cat.name
          }))
        ]);
      } catch (err) {
        // Optionally show a toast or log error
      }
    };
    getCategories();
  }, []);
  
  const recentSuccesses = [
    { 
      id: 1, 
      title: 'iPhone 13 Pro', 
      location: 'Central Park', 
      timeAgo: '2 hours ago',
      type: 'lost',
      image: '/api/placeholder/100/100'
    },
    { 
      id: 2, 
      title: 'Blue Backpack', 
      location: 'Metro Station', 
      timeAgo: '5 hours ago',
      type: 'found',
      image: '/api/placeholder/100/100'
    },
    { 
      id: 3, 
      title: 'Car Keys', 
      location: 'Shopping Mall', 
      timeAgo: '1 day ago',
      type: 'lost',
      image: '/api/placeholder/100/100'
    },
    { 
      id: 4, 
      title: 'Gold Watch', 
      location: 'Beach Resort', 
      timeAgo: '2 days ago',
      type: 'found',
      image: '/api/placeholder/100/100'
    }
  ];

  // Generate chart options for trending items
  const getChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false
        }
      },
      y: {
        display: false,
        grid: {
          display: false
        }
      }
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 0
      },
      line: {
        tension: 0.3,
        borderWidth: 2
      }
    },
    interaction: {
      intersect: false
    }
  });

  const getChartData = (item: any) => {
    const isPositiveTrend = item.trend.startsWith('+');
    return {
      labels: item.labels,
      datasets: [
        {
          data: item.weeklyData,
          borderColor: isPositiveTrend ? '#16a34a' : '#dc2626',
          backgroundColor: isPositiveTrend ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
          fill: true,
          tension: 0.3
        }
      ]
    };
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/search?${params.toString()}`);
  };

  const handleReportAction = (type: 'lost' | 'found') => {
    if (isAuthenticated) {
      navigate(`/report?type=${type}`);
    } else {
      localStorage.setItem('intendedAction', `report_${type}`);
      localStorage.setItem('returnPath', `/report?type=${type}`);
      navigate('/login');
    }
  };
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('publicUserToken');
    localStorage.removeItem('publicUserData');
    setIsAuthenticated(false);
    setUserData(null);
    setShowLogoutConfirm(false);
    window.location.reload();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Account menu items
  const accountMenuItems = [
    {
      label: 'My Profile',
      icon: 'pi pi-user',
      command: () => navigate('/profile')
    },
    {
      label: 'Personal Hub',
      icon: 'pi pi-home',
      command: () => navigate('/hub')
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

  // Guest menu items for mobile
  const guestMenuItems = [
    {
      label: 'Sign In',
      icon: 'pi pi-sign-in',
      command: () => navigate('/login')
    },
    {
      label: 'Admin Login',
      icon: 'pi pi-shield',
      command: () => navigate('/admin/login')
    }
  ];

  const showAccountMenu = (event: React.MouseEvent) => {
    accountMenuRef.current?.toggle(event);
  };

  const showGuestMenu = (event: React.MouseEvent) => {
    guestMenuRef.current?.toggle(event);
  };

  const [showBottomBar, setShowBottomBar] = useState(false);

  useEffect(() => {
    if (!isBelowDesktop) return;

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      // Show when user is within 80px of the bottom
      setShowBottomBar(scrollY + windowHeight >= docHeight - 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isBelowDesktop]);

  // Show loading spinner while fetching data
  if (statsLoading || trendingLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div className="text-center">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} />
          <p className="mt-3 text-gray-600">Loading platform data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#495560ff' }}>
      <Toast ref={toast} />
      
      {/* Logout Confirmation Dialog */}
      <Dialog
        header="Confirm Logout"
        visible={showLogoutConfirm}
        onHide={cancelLogout}
        style={{ width: '350px' }}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={cancelLogout} />
            <Button label="Logout" icon="pi pi-sign-out" className="p-button-danger" onClick={confirmLogout} />
          </div>
        }
        modal
      >
        <div>Are you sure you want to log out?</div>
      </Dialog>

      {/* Hero Section */}
      <div 
        className="relative"
        style={{
          background: 'linear-gradient(135deg, #353333ff 0%, #475a4bff 50%, #888887ff 100%)',
          color: 'white',
          paddingTop: '2rem',
          paddingBottom: '3rem'
        }}
      >
        {/* Navigation */}
        <div className={`${isBelowDesktop ? 'px-4' : 'px-8'} mb-6`}>
          <div className="flex align-items-center justify-content-between">
            <Logo 
              size={isBelowDesktop ? 'small' : 'medium'} 
              variant="full" 
              onClick={() => navigate('/')}
            />
            
            {isAuthenticated ? (
              <div className="flex align-items-center gap-3">
                <div className="text-right">
                  <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Welcome back,</div>
                  <div className="font-semibold text-white">{userData?.email}</div>
                </div>
                
                {/* Account Avatar with Dropdown */}
                <div className="relative">
                  <Avatar 
                    icon="pi pi-user" 
                    shape="circle" 
                    style={{ backgroundColor: 'white', color: '#1e40af' }}
                    onClick={showAccountMenu}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200"
                  />
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
              isBelowDesktop ? (
                <div className="relative">
                  <Button
                    icon="pi pi-bars"
                    className="p-button-rounded p-button-text p-button-sm"
                    aria-label="Menu"
                    onClick={showGuestMenu}
                    style={{
                      color: 'white',
                      fontSize: '1.5rem'
                    }}
                  />
                  <Menu
                    model={guestMenuItems}
                    popup
                    ref={guestMenuRef}
                    className="mt-2"
                    style={{ minWidth: '160px' }}
                  />
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
              )
            )}
          </div>

          {/* Hero Content */}
          <div className="mb-6 text-center">
            {isAuthenticated ? (
              <>
                <h2 className={`${isBelowDesktop ? 'text-2xl' : 'text-4xl'} font-bold mb-3 text-white`}>
                  Welcome to Your Community Hub! 🏠
                </h2>
                <p className={`${isBelowDesktop ? 'text-lg' : 'text-xl'} mb-4`} 
                   style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  Help make your neighborhood safer by reporting and finding lost items
                </p>
              </>
            ) : (
              <>
                <h1 className={`${isBelowDesktop ? 'text-3xl' : 'text-5xl'} font-bold mb-4 text-white`}>
                  Find What's Lost, Return What's Found 🔍
                </h1>
                <p className={`${isBelowDesktop ? 'text-lg' : 'text-xl'} mb-6`} 
                   style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  Join thousands of community members helping reunite people with their belongings
                </p>
              </>
            )}

            {/* Quick Action Buttons */}
            <div className={`flex gap-3 mb-6 justify-content-center ${isBelowDesktop ? 'flex-column w-full' : ''}`}>
              <Button
                label="Report Lost Item"
                icon="pi pi-minus-circle"
                className={`p-button-lg ${isBelowDesktop ? 'w-full' : ''}`}
                style={{
                  backgroundColor: '#cda710ff',
                  borderColor: '#7e6b6bff',
                  color: 'white',
                  boxShadow: '0 4px 6px rgba(220, 38, 38, 0.3)'
                }}
                onClick={() => handleReportAction('lost')}
              />
              <Button
                label="Report Found Item"
                icon="pi pi-plus-circle"
                className={`p-button-lg ${isBelowDesktop ? 'w-full' : ''}`}
                style={{
                  backgroundColor: '#16a34a',
                  borderColor: '#16a34a',
                  color: 'white',
                  boxShadow: '0 4px 6px rgba(22, 163, 74, 0.3)'
                }}
                onClick={() => handleReportAction('found')}
              />
            </div>
          </div>

          {/* Search Bar with Today's Stats Row */}
          <Card className="shadow-lg border-0" style={{ backgroundColor: 'white' }}>
            <div className={`${isBelowDesktop ? 'flex-column' : 'flex'} gap-3`}>
              {/* Search Controls */}
              <div className={`flex ${isBelowDesktop ? 'flex-column' : ''} gap-3 ${isBelowDesktop ? 'w-full' : 'flex-1'}`}>
                <InputText
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for lost or found items..."
                  className="flex-1"
                  style={{ 
                    fontSize: '16px',
                    padding: '12px 16px',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Dropdown
                  value={selectedCategory}
                  options={categories}
                  onChange={(e) => setSelectedCategory(e.value)}
                  placeholder="Category"
                  className={isBelowDesktop ? 'w-full' : 'w-12rem'}
                  style={{ 
                    minWidth: isBelowDesktop ? 'auto' : '150px',
                    color: '#374151'
                  }}
                />
                <Button
                  label="Search"
                  icon="pi pi-search"
                  onClick={handleSearch}
                  className="p-button-primary"
                  style={{ 
                    minWidth: '100px',
                    backgroundColor: '#3b82f6',
                    borderColor: '#3b82f6',
                    color: 'white'
                  }}
                />
              </div>

              {/* Desktop: Today's Activity to the right of search */}
              {!isBelowDesktop && stats && (
                <div className="flex align-items-center gap-4 border-left-2 border-blue-200 pl-4">
                  <div className="text-xs text-gray-500 font-medium">Today's Activity:</div>
                  <div className="flex gap-3">
                    <div className="text-center">
                      <div className="text-sm font-bold text-blue-600">{stats.newUsersToday}</div>
                      <div className="text-xs text-gray-500">New Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-600">{stats.itemsReportedToday}</div>
                      <div className="text-xs text-gray-500">Items Reported</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-orange-600">{stats.matchesMadeToday}</div>
                      <div className="text-xs text-gray-500">Matches Made</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile/Tablet: Today's Activity below search */}
            {isBelowDesktop && stats && (
              <div className="mt-3 pt-3 border-top-1 border-gray-200">
                <div className="text-xs text-gray-500 font-medium mb-2 text-center">Today's Activity</div>
                <div className="flex justify-content-center gap-4">
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-600">{stats.newUsersToday}</div>
                    <div className="text-xs text-gray-500">New Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-green-600">{stats.itemsReportedToday}</div>
                    <div className="text-xs text-gray-500">Items Reported</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-orange-600">{stats.matchesMadeToday}</div>
                    <div className="text-xs text-gray-500">Matches Made</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Stats Section - Updated with real API data */}
      {stats && (
        <div className={`${isBelowDesktop ? 'px-4' : 'px-8'} py-6`} style={{ backgroundColor: '#f1f5f9' }}>
          <div className="grid">
            <div className="col-6 md:col-3">
              <Card className="text-center h-full border-0 shadow-2" 
                    style={{ backgroundColor: '#dbeafe', borderLeft: '4px solid #3b82f6' }}>
                <div className="p-3">
                  <div className="text-2xl font-bold text-blue-700 mb-2">
                    {stats.totalItems.toLocaleString()}
                  </div>
                  <div className="text-gray-700 font-medium">Total Items</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.lostItemsCount} lost, {stats.foundItemsCount} found
                  </div>
                </div>
              </Card>
            </div>
            <div className="col-6 md:col-3">
              <Card className="text-center h-full border-0 shadow-2" 
                    style={{ backgroundColor: '#dcfce7', borderLeft: '4px solid #16a34a' }}>
                <div className="p-3">
                  <div className="text-2xl font-bold text-green-700 mb-2">
                    {stats.successfulMatches.toLocaleString()}
                  </div>
                  <div className="text-gray-700 font-medium">Successful Matches</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.successRate.toFixed(1)}% success rate
                  </div>
                </div>
              </Card>
            </div>
            <div className="col-6 md:col-3">
              <Card className="text-center h-full border-0 shadow-2" 
                    style={{ backgroundColor: '#fed7aa', borderLeft: '4px solid #ea580c' }}>
                <div className="p-3">
                  <div className="text-2xl font-bold text-orange-700 mb-2">
                    {stats.activeReports.toLocaleString()}
                  </div>
                  <div className="text-gray-700 font-medium">Active Reports</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.pendingReports} pending verification
                  </div>
                </div>
              </Card>
            </div>
            <div className="col-6 md:col-3">
              <Card className="text-center h-full border-0 shadow-2" 
                    style={{ backgroundColor: '#e9d5ff', borderLeft: '4px solid #9333ea' }}>
                <div className="p-3">
                  <div className="text-2xl font-bold text-purple-700 mb-2">
                    {stats.citiesCovered || 0}
                  </div>
                  <div className="text-gray-700 font-medium">Cities Covered</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.mostActiveCity ? `Most active: ${stats.mostActiveCity}` : 'Growing daily'}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Additional Stats Row */}
          <div className="grid mt-4">
            <div className="col-12 md:col-4">
              <Card className="text-center h-full border-0 shadow-1" 
                    style={{ backgroundColor: '#f0f9ff', borderLeft: '3px solid #0ea5e9' }}>
                <div className="p-3">
                  <div className="text-lg font-bold text-sky-700 mb-1">
                    {stats.totalUsers.toLocaleString()}
                  </div>
                  <div className="text-gray-600 text-sm">Total Users</div>
                </div>
              </Card>
            </div>
            <div className="col-12 md:col-4">
              <Card className="text-center h-full border-0 shadow-1" 
                    style={{ backgroundColor: '#f0f9ff', borderLeft: '3px solid #0ea5e9' }}>
                <div className="p-3">
                  <div className="text-lg font-bold text-sky-700 mb-1">
                    {stats.averageMatchTimeFormatted}
                  </div>
                  <div className="text-gray-600 text-sm">Avg. Match Time</div>
                </div>
              </Card>
            </div>
            <div className="col-12 md:col-4">
              <Card className="text-center h-full border-0 shadow-1" 
                    style={{ backgroundColor: '#f0f9ff', borderLeft: '3px solid #0ea5e9' }}>
                <div className="p-3">
                  <div className="text-lg font-bold text-sky-700 mb-1">
                    {stats.totalRewardFormatted}
                  </div>
                  <div className="text-gray-600 text-sm">Total Rewards</div>
                </div>
              </Card>
            </div>
          </div>

          {/* Last Updated Info */}
          <div className="text-center mt-3">
            <div className="text-xs text-gray-500">
              Statistics last updated: {new Date(stats.calculatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Recent Successes Section */}
      <div className={`${isBelowDesktop ? 'px-4' : 'px-8'} py-6`} style={{ backgroundColor: '#3c5547ff', color: 'white' }}>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">Recent Success Stories 🎉</h3>
          <p className="text-gray-200 mb-4">See how our community helps reunite people with their belongings</p>
          <Button
            label="View All Success Stories"
            icon="pi pi-arrow-right"
            iconPos="right"
            className="p-button-outlined p-button-sm"
            style={{
              color: '#fff',
              borderColor: '#fff',
              backgroundColor: 'transparent'
            }}
            onClick={() => navigate('/success-stories')}
          />
        </div>

        {/* Responsive grid for desktop, stacked for mobile */}
        {isBelowDesktop ? (
          <div className="grid gap-4">
            {recentSuccesses.map((item) => (
              <div key={item.id} className="col-12">
                <Card
                  className="h-full border-0 shadow-4"
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    minHeight: 220,
                    color: '#222'
                  }}
                >
                  <div className="flex flex-column align-items-center p-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="mb-3"
                      style={{
                        width: 72,
                        height: 72,
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '3px solid #16a34a',
                        boxShadow: '0 2px 8px rgba(22,163,74,0.08)'
                      }}
                    />
                    <div className="font-bold text-lg mb-1">{item.title}</div>
                    <div className="flex align-items-center gap-2 mb-2">
                      <Badge
                        value={item.type === 'lost' ? 'Lost' : 'Found'}
                        severity={item.type === 'lost' ? 'danger' : 'success'}
                        className="text-xs"
                      />
                      <span className="text-gray-500 text-sm">{item.location}</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">{item.timeAgo}</div>
                    <Button
                      label="View Details"
                      icon="pi pi-external-link"
                      className="p-button-text p-button-sm"
                      style={{
                        color: '#2563eb',
                        fontWeight: 600
                      }}
                      onClick={() => navigate(`/success-stories/${item.id}`)}
                    />
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', width: '100%' }}>
            {/* Desktop custom layout */}
            {recentSuccesses.length === 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <Card
                    className="h-full border-0 shadow-4"
                    style={{
                      background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      minWidth: 320,
                      maxWidth: 420,
                      color: '#222'
                    }}
                  >
                    {/* ...Card content... */}
                    <div className="flex flex-column align-items-center p-4">
                      <img
                        src={recentSuccesses[0].image}
                        alt={recentSuccesses[0].title}
                        className="mb-3"
                        style={{
                          width: 72,
                          height: 72,
                          objectFit: 'cover',
                          borderRadius: '50%',
                          border: '3px solid #16a34a',
                          boxShadow: '0 2px 8px rgba(22,163,74,0.08)'
                        }}
                      />
                      <div className="font-bold text-lg mb-1">{recentSuccesses[0].title}</div>
                      <div className="flex align-items-center gap-2 mb-2">
                        <Badge
                          value={recentSuccesses[0].type === 'lost' ? 'Lost' : 'Found'}
                          severity={recentSuccesses[0].type === 'lost' ? 'danger' : 'success'}
                          className="text-xs"
                        />
                        <span className="text-gray-500 text-sm">{recentSuccesses[0].location}</span>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">{recentSuccesses[0].timeAgo}</div>
                      <Button
                        label="View Details"
                        icon="pi pi-external-link"
                        className="p-button-text p-button-sm"
                        style={{
                          color: '#2563eb',
                          fontWeight: 600
                        }}
                        onClick={() => navigate(`/success-stories/${recentSuccesses[0].id}`)}
                      />
                    </div>
                  </Card>
                </div>
              </div>
            )}
            {recentSuccesses.length === 2 && (
              <div style={{ display: 'flex', gap: '1.5rem', width: '100%' }}>
                {recentSuccesses.map((item) => (
                  <div key={item.id} style={{ flex: 1 }}>
                    <Card
                      className="h-full border-0 shadow-4"
                      style={{
                        background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        minWidth: 320,
                        color: '#222'
                      }}
                    >
                      {/* ...Card content... */}
                      <div className="flex flex-column align-items-center p-4">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="mb-3"
                          style={{
                            width: 72,
                            height: 72,
                            objectFit: 'cover',
                            borderRadius: '50%',
                            border: '3px solid #16a34a',
                            boxShadow: '0 2px 8px rgba(22,163,74,0.08)'
                          }}
                        />
                        <div className="font-bold text-lg mb-1">{item.title}</div>
                        <div className="flex align-items-center gap-2 mb-2">
                          <Badge
                            value={item.type === 'lost' ? 'Lost' : 'Found'}
                            severity={item.type === 'lost' ? 'danger' : 'success'}
                            className="text-xs"
                          />
                          <span className="text-gray-500 text-sm">{item.location}</span>
                        </div>
                        <div className="text-xs text-gray-400 mb-2">{item.timeAgo}</div>
                        <Button
                          label="View Details"
                          icon="pi pi-external-link"
                          className="p-button-text p-button-sm"
                          style={{
                            color: '#2563eb',
                            fontWeight: 600
                          }}
                          onClick={() => navigate(`/success-stories/${item.id}`)}
                        />
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
            {(recentSuccesses.length === 3 || recentSuccesses.length === 4) && (
              <div style={{ display: 'flex', gap: '1.5rem', width: '100%' }}>
                {recentSuccesses.map((item) => (
                  <div key={item.id} style={{ flex: 1 }}>
                    <Card
                      className="h-full border-0 shadow-4"
                      style={{
                        background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        minWidth: 220,
                        color: '#222'
                      }}
                    >
                      {/* ...Card content... */}
                      <div className="flex flex-column align-items-center p-4">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="mb-3"
                          style={{
                            width: 72,
                            height: 72,
                            objectFit: 'cover',
                            borderRadius: '50%',
                            border: '3px solid #16a34a',
                            boxShadow: '0 2px 8px rgba(22,163,74,0.08)'
                          }}
                        />
                        <div className="font-bold text-lg mb-1">{item.title}</div>
                        <div className="flex align-items-center gap-2 mb-2">
                          <Badge
                            value={item.type === 'lost' ? 'Lost' : 'Found'}
                            severity={item.type === 'lost' ? 'danger' : 'success'}
                            className="text-xs"
                          />
                          <span className="text-gray-500 text-sm">{item.location}</span>
                        </div>
                        <div className="text-xs text-gray-400 mb-2">{item.timeAgo}</div>
                        <Button
                          label="View Details"
                          icon="pi pi-external-link"
                          className="p-button-text p-button-sm"
                          style={{
                            color: '#2563eb',
                            fontWeight: 600
                          }}
                          onClick={() => navigate(`/success-stories/${item.id}`)}
                        />
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
            {recentSuccesses.length === 5 && (
              <>
                <div style={{ display: 'flex', gap: '1.5rem', width: '100%' }}>
                  {recentSuccesses.slice(0, 3).map((item) => (
                    <div key={item.id} style={{ flex: 1 }}>
                      <Card
                        className="h-full border-0 shadow-4"
                        style={{
                          background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)',
                          borderRadius: '18px',
                          overflow: 'hidden',
                          minWidth: 220,
                          color: '#222'
                        }}
                      >
                        {/* ...Card content... */}
                        <div className="flex flex-column align-items-center p-4">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="mb-3"
                            style={{
                              width: 72,
                              height: 72,
                              objectFit: 'cover',
                              borderRadius: '50%',
                              border: '3px solid #16a34a',
                              boxShadow: '0 2px 8px rgba(22,163,74,0.08)'
                            }}
                          />
                          <div className="font-bold text-lg mb-1">{item.title}</div>
                          <div className="flex align-items-center gap-2 mb-2">
                            <Badge
                              value={item.type === 'lost' ? 'Lost' : 'Found'}
                              severity={item.type === 'lost' ? 'danger' : 'success'}
                              className="text-xs"
                            />
                            <span className="text-gray-500 text-sm">{item.location}</span>
                          </div>
                          <div className="text-xs text-gray-400 mb-2">{item.timeAgo}</div>
                          <Button
                            label="View Details"
                            icon="pi pi-external-link"
                            className="p-button-text p-button-sm"
                            style={{
                              color: '#2563eb',
                              fontWeight: 600
                            }}
                            onClick={() => navigate(`/success-stories/${item.id}`)}
                          />
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', width: '100%', marginTop: '1.5rem' }}>
                  {recentSuccesses.slice(3, 5).map((item) => (
                    <div key={item.id} style={{ flex: 1 }}>
                      <Card
                        className="h-full border-0 shadow-4"
                        style={{
                          background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)',
                          borderRadius: '18px',
                          overflow: 'hidden',
                          minWidth: 220,
                          color: '#222'
                        }}
                      >
                        {/* ...Card content... */}
                        <div className="flex flex-column align-items-center p-4">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="mb-3"
                            style={{
                              width: 72,
                              height: 72,
                              objectFit: 'cover',
                              borderRadius: '50%',
                              border: '3px solid #16a34a',
                              boxShadow: '0 2px 8px rgba(22,163,74,0.08)'
                            }}
                          />
                          <div className="font-bold text-lg mb-1">{item.title}</div>
                          <div className="flex align-items-center gap-2 mb-2">
                            <Badge
                              value={item.type === 'lost' ? 'Lost' : 'Found'}
                              severity={item.type === 'lost' ? 'danger' : 'success'}
                              className="text-xs"
                            />
                            <span className="text-gray-500 text-sm">{item.location}</span>
                          </div>
                          <div className="text-xs text-gray-400 mb-2">{item.timeAgo}</div>
                          <Button
                            label="View Details"
                            icon="pi pi-external-link"
                            className="p-button-text p-button-sm"
                            style={{
                              color: '#2563eb',
                              fontWeight: 600
                            }}
                            onClick={() => navigate(`/success-stories/${item.id}`)}
                          />
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Trending Items Section - with silent auto-refresh */}
      <div className={`${isBelowDesktop ? 'px-4' : 'px-8'} py-6`} style={{ backgroundColor: '#f8fafc', color: '#4b5563' }}>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Trending Lost Items 📈</h3>
          <p className="text-gray-600">Most reported items this week with real-time trend analysis</p>
        </div>
        
        <div className="flex justify-content-center">
          <div className="grid max-w-6xl w-full">
            {Array.isArray(trendingReports) && trendingReports.length > 0 ? (
              trendingReports.map((item) => (
                <div key={`${item.categoryId}-${item.title}`} className="col-12 md:col-6 lg:col-3">
                  <Card className="h-full border-0 shadow-2" style={{ backgroundColor: 'white' }}>
                    <div className="p-3">
                      {/* Header with title and trend */}
                      <div className="flex align-items-center justify-content-between mb-3">
                        <div>
                          <div className="font-semibold text-gray-800">{item.title}</div>
                          <div className="text-sm text-gray-600">{item.category}</div>
                        </div>
                        <Chip 
                          label={item.trend} 
                          style={{ 
                            backgroundColor: item.trend.startsWith('+') ? '#dcfce7' : '#fee2e2', 
                            color: item.trend.startsWith('+') ? '#15803d' : '#dc2626'
                          }}
                        />
                      </div>

                      {/* Line Chart */}
                      {Array.isArray(item.weeklyData) && item.weeklyData.length > 0 && (
                        <div className="mb-3" style={{ height: '80px' }}>
                          <Chart 
                            type="line" 
                            data={getChartData(item)} 
                            options={getChartOptions()}
                            style={{ height: '100%' }}
                          />
                        </div>
                      )}

                      {/* Weekly Summary */}
                      <div className="text-center mb-2">
                        <div className="text-xs text-gray-500 mb-1">This Week's Progress</div>
                        <div className="flex align-items-center justify-content-center gap-2">
                          <Badge 
                            value={item.reports || 0} 
                            style={{ backgroundColor: '#3b82f6', color: 'white' }}
                          />
                          <span className="text-sm text-gray-600">total reports</span>
                        </div>
                      </div>

                      {/* Week Range */}
                      {Array.isArray(item.labels) && item.labels.length > 0 && (
                        <div className="text-center">
                          <div className="text-xs text-gray-400">
                            {item.labels[0]} - {item.labels[item.labels.length - 1]}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              ))
            ) : (
              <div className="col-12">
                <Card className="text-center p-6" style={{ backgroundColor: 'white' }}>
                  <div className="text-gray-500">
                    {trendingLoading ? (
                      <>
                        <ProgressSpinner style={{ width: '30px', height: '30px' }} />
                        <p className="mt-2">Loading trending reports...</p>
                      </>
                    ) : (
                      <p>No trending reports available at the moment.</p>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Legend/Info */}
        <div className="text-center mt-4">
          <div className="text-xs text-gray-500">
            <i className="pi pi-info-circle mr-1"></i>
            Charts show daily report counts for the past 7 days • Auto-updated every 5 minutes
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className={`${isBelowDesktop ? 'px-4' : 'px-8'} py-8`} 
           style={{ backgroundColor: '#8eb8a7ff' }}>
        <Card className="text-center border-0 shadow-4" 
              style={{ 
                background: 'linear-gradient(135deg, #476359ff 0%, #dbeafe 100%)', 
                border: '2px solid #93c5fd' 
              }}>
          <div className="p-6">
            <h3 className="text-2xl font-bold text-blue-800 mb-3">
              Ready to Help Your Community? 🤝
            </h3>
            <p className="text-blue-700 mb-4 line-height-3">
              Join thousands of people helping reunite lost items with their owners. 
              Every report counts and makes a difference!
            </p>
            <div className="flex gap-3 justify-content-center">

              {/* Floating Bottom Action Bar for Mobile */}
              {isBelowDesktop && (
                <CSSTransition
                  in={isBelowDesktop && showBottomBar}
                  timeout={300}
                  classNames="fade-bottom-bar"
                  unmountOnExit
                  nodeRef={bottomBarRef}
                >
                  <div
                    ref={bottomBarRef}
                    className="fixed left-0 right-0 z-5 flex justify-content-center fade-bottom-bar"
                    style={{
                      bottom: 20,
                      pointerEvents: 'none'
                    }}
                  >
                    <div
                      className="flex gap-3 p-2"
                      style={{
                        background: 'rgba(255, 255, 255, 0.18)',
                        borderRadius: 16,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                        pointerEvents: 'auto',
                        minWidth: 320,
                        maxWidth: 420,
                        transition: 'opacity 0.3s'
                      }}
                    >
                      <Button
                        label="Lost"
                        icon="pi pi-minus-circle"
                        className="p-button-lg flex-1"
                        style={{
                          background: 'linear-gradient(90deg, #fbbf24 0%, #f59e42 100%)',
                          border: 'none',
                          color: '#fff',
                          fontWeight: 700,
                          borderRadius: 12
                        }}
                        onClick={() => handleReportAction('lost')}
                      />
                      <Button
                        label="Found"
                        icon="pi pi-plus-circle"
                        className="p-button-lg flex-1"
                        style={{
                          background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                          border: 'none',
                          color: '#fff',
                          fontWeight: 700,
                          borderRadius: 12
                        }}
                        onClick={() => handleReportAction('found')}
                      />
                    </div>
                  </div>
                </CSSTransition>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HubHomePage;