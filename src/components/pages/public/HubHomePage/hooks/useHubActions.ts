import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useHubActions = (isAuthenticated: boolean, logout: () => void) => {
  const navigate = useNavigate();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/search?${params.toString()}`);
  };

  const handleReportAction = (type: 'lost' | 'found') => {
    if (isAuthenticated) {
      setReportType(type);
      setShowReportModal(true);
    } else {
      localStorage.setItem('intendedAction', `report_${type}`);
      navigate('/login');
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const showAccountMenu = (event: React.MouseEvent) => {
    // This will be handled by the parent component with refs
  };

  const showGuestMenu = (event: React.MouseEvent) => {
    // This will be handled by the parent component with refs
  };

  // Menu configurations
  const accountMenuItems = [
    {
      label: 'News Feed',
      icon: 'pi pi-user',
      command: () => navigate('/feed')
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

  const guestMenuItems = [
    {
      label: 'Sign In',
      icon: 'pi pi-sign-in',
      command: () => navigate('/login')
    }
  ];

  return {
    // State
    showReportModal,
    setShowReportModal,
    reportType,
    showLogoutConfirm,
    searchTerm,
    selectedCategory,

    // Actions
    setSearchTerm,
    setSelectedCategory,
    handleSearch,
    handleReportAction,
    handleLogout,
    confirmLogout,
    cancelLogout,
    showAccountMenu,
    showGuestMenu,

    // Menu configs
    accountMenuItems,
    guestMenuItems
  };
};