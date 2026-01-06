import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../context/AuthContext';
import { 
  User, 
  Rss, 
  FileText, 
  Bell, 
  Settings, 
  HelpCircle, 
  LogOut, 
  LogIn 
} from 'lucide-react';

export const useHubActions = (isAuthenticated: boolean, logout: () => void) => {
  const navigate = useNavigate();
  const { openLoginModal } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
      icon: <Rss className="w-4 h-4 mr-2" />,
      command: () => navigate('/feed')
    },
    {
      label: 'Personal Hub',
      icon: <User className="w-4 h-4 mr-2" />,
      command: () => navigate('/hub')
    },
    {
      label: 'My Reports',
      icon: <FileText className="w-4 h-4 mr-2" />,
      command: () => navigate('/hub?tab=reports')
    },
    {
      label: 'Notifications',
      icon: <Bell className="w-4 h-4 mr-2" />,
      command: () => navigate('/notifications')
    },
    {
      label: 'Settings',
      icon: <Settings className="w-4 h-4 mr-2" />,
      command: () => navigate('/settings')
    },
    {
      separator: true
    },
    {
      label: 'Help & Support',
      icon: <HelpCircle className="w-4 h-4 mr-2" />,
      command: () => navigate('/help')
    },
    {
      label: 'Logout',
      icon: <LogOut className="w-4 h-4 mr-2 text-red-500" />,
      command: handleLogout,
      className: 'text-red-600 font-bold'
    }
  ];

  const guestMenuItems = [
    {
      label: 'Sign In',
      icon: <LogIn className="w-4 h-4 mr-2" />,
      command: () => openLoginModal()
    }
  ];

  return {
    // State
    showReportModal,
    setShowReportModal,
    reportType,
    showLogoutConfirm,

    // Actions
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