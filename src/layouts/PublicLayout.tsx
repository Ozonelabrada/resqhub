import { useRef, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeatureFlags } from '../hooks';
import { Menubar, Menu, Avatar, Button, Logo } from '../components/ui';
import type { MenuRef } from '../components/ui';
import { LoginModal } from '../components/modals/Auth/LoginModal';
import { SignUpModal } from '../components/modals/Auth/SignUpModal';
import { SettingsModal } from '../components/modals';
import {
  Home, 
  Users, 
  List, 
  Clock, 
  Heart, 
  Info, 
  User, 
  FileText, 
  Bell, 
  Settings, 
  LogOut, 
  LogIn,
  Languages
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PublicLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isFeatureEnabled } = useFeatureFlags();
  const { 
    isAuthenticated,
    isLoginModalOpen, 
    openLoginModal, 
    closeLoginModal,
    isSignUpModalOpen,
    closeSignUpModal,
    openSettingsModal,
    openLogoutModal,
  } = useAuth();

  const [hasOpenedModalFromState, setHasOpenedModalFromState] = useState(false);

  // Open modal if redirected from protected route
  if (location.state?.openLogin && !isAuthenticated && !isLoginModalOpen && !hasOpenedModalFromState) {
    setHasOpenedModalFromState(true);
    openLoginModal();
  }

  // Use useRef instead of useState for menu references
  const userMenuRef = useRef<MenuRef>(null);

  const items = [
    {
      label: t('common.home'),
      icon: <Home className="w-4 h-4 mr-2" />,
      command: () => navigate('/')
    },
    {
      label: t('common.news_feed'),
      icon: <List className="w-4 h-4 mr-2" />,
      command: () => navigate('/hub')
    },
    {
      label: t('common.community'),
      icon: <Users className="w-4 h-4 mr-2" />,
      items: [
        {
          label: 'About SHERRA',
          icon: <Info className="w-4 h-4 mr-2" />,
          command: () => navigate('/about')
        },
        {
          label: t('common.recent_activity'),
          icon: <Clock className="w-4 h-4 mr-2" />,
          command: () => navigate('/activity')
        },
        isFeatureEnabled('reports') ? {
          label: t('common.success_stories'),
          icon: <Heart className="w-4 h-4 mr-2" />,
          command: () => navigate('/success-stories')
        } : null,
        {
          label: t('common.safety_tips'),
          icon: <Info className="w-4 h-4 mr-2" />,
          command: () => navigate('/safety-tips')
        }
      ].filter(Boolean) as any[]
    }
  ];

  const userMenuItems = [
    {
      label: t('common.my_profile'),
      icon: <User className="w-4 h-4 mr-2" />,
      command: () => navigate('/profile')
    },
    isFeatureEnabled('reports') ? {
      label: t('common.my_reports'),
      icon: <FileText className="w-4 h-4 mr-2" />,
      command: () => navigate('/profile')
    } : null,
    {
      label: t('common.notifications'),
      icon: <Bell className="w-4 h-4 mr-2" />,
      command: () => navigate('/notifications')
    },
    {
      separator: true
    },
    {
      label: t('common.settings'),
      icon: <Settings className="w-4 h-4 mr-2" />,
      command: () => navigate('/settings')
    },
    {
      label: t('common.sign_out'),
      icon: <LogOut className="w-4 h-4 mr-2" />,
      command: () => openLogoutModal()
    }
  ].filter(Boolean) as any[];

  

  const start = (
    <div className="flex items-center gap-2">
      <Logo 
        size="small" 
        light={true}
        onClick={() => navigate('/')} 
        className="hover:opacity-80 transition-opacity"
      />
    </div>
  );

  const end = (
          <div className="flex items-center gap-2">
          {/* Language Quick Switcher */}
          <Button
            variant="ghost"
            className="rounded-full h-10 w-10 p-0 text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            onClick={() => openSettingsModal()}
            title={t('common.language')}
          >
            <Languages className="w-5 h-5" />
          </Button>

          {isAuthenticated ? (
            // Authenticated user menu
            <div className="flex items-center gap-2">
              <span className="text-sm hidden md:inline text-white/90 font-medium" />
              <Avatar
                className="cursor-pointer bg-white/20 border-2 border-white/30 hover:bg-white/30 transition-colors"
                onClick={(e) => userMenuRef.current?.toggle(e)}
              >
                <User className="w-5 h-5 text-white" />
              </Avatar>
              <Menu 
                model={userMenuItems} 
                popup 
                ref={userMenuRef}
              />
            </div>
          ) : (
            // Unauthenticated: single, prominent Sign In button (no dropdown)
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="rounded-full text-white hover:bg-white/10 font-bold"
                onClick={() => openLoginModal()}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {t('common.login')}
              </Button>
            </div>
          )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation Bar - Hide on HomePage (/) */}
      {location.pathname !== '/' && (
        <Menubar
          model={items}
          start={start}
          end={end}
          className="sticky top-0 z-[100]"
        />
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal} 
        onSuccess={() => {
            const returnPath = localStorage.getItem('returnPath') || '/hub';
            localStorage.removeItem('returnPath');
            closeLoginModal();
            navigate(returnPath);
        }}
      />

      {/* SignUp Modal */}
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={closeSignUpModal}
        onSuccess={() => {
          closeSignUpModal();
          openLoginModal();
        }}
      />

      {/* Settings Modal */}
      <SettingsModal />

      {/* Authentication Status Banner (optional) */}
      {!isAuthenticated && location.pathname.includes('/item/') && (
        <div className="w-full p-3 text-center bg-orange-50 border-b border-orange-100 shadow-sm">
          <span className="text-sm text-orange-800 font-semibold flex items-center justify-center gap-2">
            <Info size={16} className="text-orange-600" />
            You can view items freely. Sign in to claim items or report incidents.
          </span>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-teal-900 text-white border-t border-teal-800 py-16">
          <div className="w-full px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="flex items-center gap-4">
                <Logo size="medium" variant="full" light={true} />
                <div className="h-10 w-px bg-white/20 hidden md:block" />
                <span className="text-sm text-teal-100 font-medium">Reuniting Communities</span>
              </div>
              
              <div className="flex flex-wrap justify-center gap-10 text-sm font-bold text-teal-50">
                <a href="/privacy" className="hover:text-orange-400 transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="hover:text-orange-400 transition-colors">
                  Terms of Service
                </a>
                <a href="/contact" className="hover:text-orange-400 transition-colors">
                  Contact Us
                </a>
              </div>
              
              <div className="text-sm font-bold text-teal-300">
                © {new Date().getFullYear()} SHERRA. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
    </div>
  );
};


export default PublicLayout;

