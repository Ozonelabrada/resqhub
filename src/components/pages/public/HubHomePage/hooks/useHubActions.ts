import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../context/AuthContext';

export const useHubActions = (isAuthenticated: boolean, logout: () => void) => {
  const navigate = useNavigate();
  const { openLoginModal } = useAuth();
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
      openLoginModal();
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
      command: () => navigate('/feed')
    },
    {
      label: 'Personal Hub',
      command: () => navigate('/hub')
    },
    {
      label: 'My Reports',
      command: () => navigate('/hub?tab=reports')
    },
    {
      label: 'Notifications',
      command: () => navigate('/notifications')
    },
    {
      label: 'Settings',
      command: () => navigate('/settings')
    },
    {
      separator: true
    },
    {
      label: 'Help & Support',
      command: () => navigate('/help')
    },
    {
        label: 'Logout',
      command: handleLogout,
      className: 'text-red-600 font-bold'
    }
  ];

  const guestMenuItems = [
    {
      label: 'Sign In',
      command: () => openLoginModal()
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