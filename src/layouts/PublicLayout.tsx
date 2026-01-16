import { useRef, useState } from 'react';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useFeatureFlags, useScreenSize } from '../hooks';
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
  Languages,
  Shield,
  Menu as MenuIcon,
  X,
  MessageSquare
} from 'lucide-react';
import { SITE } from '../constants/site';
import { cn } from '@/lib/utils';

const PublicLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isFeatureEnabled } = useFeatureFlags();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { 
    isAuthenticated,
    isLoginModalOpen, 
    openLoginModal, 
    closeLoginModal,
    isSignUpModalOpen,
    closeSignUpModal,
    openSettingsModal,
    openLogoutModal,
    user,
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
          label: t('common.about'),
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
    {
      label: t('common.notifications'),
      icon: <Bell className="w-4 h-4 mr-2" />,
      command: () => navigate('/notifications')
    },
    // Admin menu item - only show for admin users
    (user?.role === 'admin' && isFeatureEnabled('admin_panel')) ? {
      separator: true
    } : null,
    (user?.role === 'admin' && isFeatureEnabled('admin_panel')) ? {
      label: 'Admin',
      icon: <Shield className="w-4 h-4 mr-2" />,
      command: () => navigate('/admin')
    } : null,
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
      {/* Desktop Navigation Bar - Hide on HomePage (/) */}
      <div className="hidden md:block">
        {location.pathname !== '/' && (
          <Menubar
            model={items}
            start={start}
            end={end}
            className="sticky top-0 z-[100]"
          />
        )}
      </div>

      {/* Mobile Header - Hide on HomePage (/) for consistency */}
      {location.pathname !== '/' && (
        <div className="md:hidden h-16 bg-gradient-to-r from-teal-600 to-teal-500 flex items-center justify-between px-3 sticky top-0 z-[100] shadow-lg shadow-teal-600/20 border-b border-teal-700/30">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white p-0 h-10 w-10 hover:bg-white/15 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <MenuIcon size={22} />
            </Button>
            <Logo 
              size="small" 
              light={true} 
              onClick={() => navigate('/')} 
              className="h-7 w-auto cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/15 rounded-lg transition-colors p-2"
              onClick={() => openSettingsModal()}
              title={t('common.language')}
            >
              <Languages size={20} />
            </Button>
            {!isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/15 rounded-lg transition-colors p-2 font-bold text-xs"
                onClick={() => openLoginModal()}
              >
                <LogIn size={20} />
              </Button>
            )}
            {isAuthenticated && (
              <Avatar
                className="h-8 w-8 cursor-pointer bg-white/25 border-2 border-white/40 hover:bg-white/35 transition-colors rounded-lg"
                onClick={() => navigate('/profile')}
              >
                <User className="w-4 h-4 text-white" />
              </Avatar>
            )}
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 w-72 bg-white z-[120] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col shadow-2xl",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-20 bg-teal-600 flex items-center justify-between px-6">
          <Logo variant="full" size="small" light={true} />
          <Button 
            variant="ghost"
            className="p-2 text-white hover:bg-white/10 rounded-xl"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <SidebarLink 
            icon={<Home size={20} />} 
            label={t('common.home')} 
            active={location.pathname === '/'}
            onClick={() => { navigate('/'); setIsSidebarOpen(false); }}
          />
          <SidebarLink 
            icon={<List size={20} />} 
            label={t('common.news_feed')} 
            active={location.pathname === '/hub'}
            onClick={() => { navigate('/hub'); setIsSidebarOpen(false); }}
          />
          <SidebarLink 
            icon={<Users size={20} />} 
            label={t('common.communities')} 
            active={location.pathname === '/communities'}
            onClick={() => { navigate('/communities'); setIsSidebarOpen(false); }}
          />
          {isFeatureEnabled('messages') && (
            <SidebarLink 
              icon={<MessageSquare size={20} />} 
              label={t('common.messages')} 
              active={location.pathname === '/messages'}
              onClick={() => { navigate('/messages'); setIsSidebarOpen(false); }}
            />
          )}
          
          <div className="pt-4 pb-2">
            <div className="h-px bg-slate-100 mx-4" />
          </div>

          {isAuthenticated ? (
            <>
              <SidebarLink 
                icon={<User size={20} />} 
                label={t('common.my_profile')} 
                active={location.pathname === '/profile'}
                onClick={() => { navigate('/profile'); setIsSidebarOpen(false); }}
              />
              <SidebarLink 
                icon={<Settings size={20} />} 
                label={t('common.settings')} 
                active={location.pathname === '/settings'}
                onClick={() => { navigate('/settings'); setIsSidebarOpen(false); }}
              />
              {user?.role === 'admin' && (
                <SidebarLink 
                  icon={<Shield size={20} />} 
                  label="Admin Panel" 
                  active={location.pathname.startsWith('/admin')}
                  onClick={() => { navigate('/admin'); setIsSidebarOpen(false); }}
                />
              )}
              <SidebarLink 
                icon={<LogOut size={20} />} 
                label={t('common.sign_out')} 
                onClick={() => { openLogoutModal(); setIsSidebarOpen(false); }}
                className="text-rose-500 hover:bg-rose-50"
              />
            </>
          ) : (
            <SidebarLink 
              icon={<LogIn size={20} />} 
              label={t('common.login')} 
              onClick={() => { openLoginModal(); setIsSidebarOpen(false); }}
            />
          )}
        </nav>
      </aside>

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
            {t('common.view_items_notice')}
          </span>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full pt-4 pb-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-teal-900 text-white border-t border-teal-800 py-8">
          <div className="w-full px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <Logo size="small" variant="full" light={true} />
                <div className="h-6 w-px bg-white/20 hidden md:block" />
                <span className="text-xs text-teal-100 font-medium opacity-80 uppercase tracking-widest hidden lg:block">{t('common.reuniting_tagline')}</span>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-center gap-6 lg:gap-12">
                <Link to="/hub" className="text-xs text-teal-100 hover:text-orange-400 font-bold uppercase tracking-wider transition-colors">{t('common.news_feed')}</Link>
                <Link to="/communities" className="text-xs text-teal-100 hover:text-orange-400 font-bold uppercase tracking-wider transition-colors">{t('common.communities')}</Link>
                <Link to="/privacy-policy" className="text-xs text-teal-100 hover:text-orange-400 font-bold uppercase tracking-wider transition-colors">{t('common.privacy')}</Link>
                <Link to="/terms-of-service" className="text-xs text-teal-100 hover:text-orange-400 font-bold uppercase tracking-wider transition-colors">{t('common.terms')}</Link>
                <Link to="/contact-us" className="text-xs text-teal-100 hover:text-orange-400 font-bold uppercase tracking-wider transition-colors">{t('common.contact')}</Link>
              </div>
              
              <div className="text-[10px] font-black text-teal-500 uppercase tracking-widest opacity-50">
                © {new Date().getFullYear()} FindrHub
              </div>
            </div>
          </div>
        </footer>
    </div>
  );
};


export default PublicLayout;

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  className?: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, label, active, onClick, className }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 font-bold text-sm",
      active 
        ? "bg-teal-50 text-teal-600 shadow-sm" 
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
      className
    )}
  >
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
      active ? "bg-teal-100/50" : "bg-slate-100 group-hover:bg-white"
    )}>
      {icon}
    </div>
    {label}
  </button>
);

