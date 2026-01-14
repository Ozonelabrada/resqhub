import { useState } from 'react';
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
  const { openLoginModal, openSignUpModal } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType] = useState<'lost' | 'found'>('lost');

  const handleReportAction = (type: 'lost' | 'found') => {
    if (isAuthenticated) {
      // Redirect to News Feed and trigger the create report modal
      navigate(`/hub?action=create&type=${type}`);
    } else {
      localStorage.setItem('intendedAction', `report_${type}`);
      localStorage.setItem('returnPath', `/hub?action=create&type=${type}`);
      openLoginModal();
    }
  };

  const handleGetStartedAction = () => {
    if (isAuthenticated) {
      navigate('/hub');
    } else {
      localStorage.setItem('returnPath', '/hub');
      openLoginModal();
    }
  };

  const handleSearchAction = (query: string) => {
    if (isAuthenticated) {
      // Redirect to News Feed with search query if authenticated
      navigate(`/hub?search=${encodeURIComponent(query)}`);
    } else {
      localStorage.setItem('returnPath', `/hub?search=${encodeURIComponent(query)}`);
      openLoginModal();
    }
  };

  const handleLogout = () => {
    logout();
  };

  const showAccountMenu = () => {
    // This will be handled by the parent component with refs
  };

  const showGuestMenu = () => {
    // This will be handled by the parent component with refs
  };

  // Menu configurations
  const accountMenuItems = [
    {
      label: 'News Feed',
      icon: <Rss className="w-4 h-4 mr-2" />,
      command: () => navigate('/hub')
    },
    {
      label: 'Personal Hub',
      icon: <User className="w-4 h-4 mr-2" />,
      command: () => navigate('/profile')
    },
    {
      label: 'My Reports',
      icon: <FileText className="w-4 h-4 mr-2" />,
      command: () => navigate('/profile?tab=reports')
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
    },
    {
      label: 'Create Account',
      icon: <FileText className="w-4 h-4 mr-2" />,
      command: () => openSignUpModal()
    }
  ];

  return {
    // State
    showReportModal,
    setShowReportModal,
    reportType,

    // Actions
    handleReportAction,
    handleGetStartedAction,
    handleSearchAction,
    handleLogout,
    showAccountMenu,
    showGuestMenu,

    // Menu configs
    accountMenuItems,
    guestMenuItems
  };
};