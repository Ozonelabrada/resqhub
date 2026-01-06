import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export const useHubActions = (isAuthenticated: boolean, logout: () => void) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { openLoginModal, openSettingsModal } = useAuth();
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
      label: t('common.news_feed'),
      command: () => navigate('/feed')
    },
    {
      label: t('common.my_hub'),
      command: () => navigate('/hub')
    },
    {
      label: t('common.my_reports'),
      command: () => navigate('/hub?tab=reports')
    },
    {
      label: t('common.notifications'),
      command: () => navigate('/notifications')
    },
    {
      label: t('common.settings'),
      command: () => openSettingsModal()
    },
    {
      separator: true
    },
    {
      label: t('common.help_support'),
      command: () => navigate('/help')
    },
    {
      label: t('common.logout'),
      command: handleLogout,
      className: 'text-red-600 font-bold'
    }
  ];

  const guestMenuItems = [
    {
      label: t('home.hero.sign_in'),
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