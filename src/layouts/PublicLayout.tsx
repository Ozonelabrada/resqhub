import { useRef, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/authService';
import { Menubar, Menu, Avatar, Button, Logo } from '../components/ui';
import { LoginModal } from '../components/modals/Auth/LoginModal';
import { 
  Shield, 
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
  UserPlus,
  ChevronDown,
  LogIn,
  MoreVertical
} from 'lucide-react';

const PublicLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth();

  const [hasOpenedModalFromState, setHasOpenedModalFromState] = useState(false);

  // Open modal if redirected from protected route
  if (location.state?.openLogin && !isAuthenticated && !isLoginModalOpen && !hasOpenedModalFromState) {
    setHasOpenedModalFromState(true);
    openLoginModal();
  }

  // Use useRef instead of useState for menu references
  const userMenuRef = useRef<Menu>(null);
  const authMenuRef = useRef<Menu>(null);

  // Check if current page should hide the navigation bar
  const shouldHideNavBar = () => {
    return location.pathname === '/';
  };

  // Navigation handler that checks auth for protected actions
  const handleProtectedNavigation = (path: string, actionType: 'claim' | 'report') => {
    if (!isAuthenticated) {
      // Store the intended action for after login
      localStorage.setItem('intendedAction', actionType);
      localStorage.setItem('returnPath', path);
      openLoginModal();
    } else {
      navigate(path);
    }
  };

  const items = [
    {
      label: 'Home',
      icon: <Home className="w-4 h-4 mr-2" />,
      command: () => navigate('/')
    },
    {
      label: 'Community',
      icon: <Users className="w-4 h-4 mr-2" />,
      items: [
        {
          label: 'News Feed',
          icon: <List className="w-4 h-4 mr-2" />,
          command: () => navigate('/feed')
        },
        {
          label: 'Recent Activity',
          icon: <Clock className="w-4 h-4 mr-2" />,
          command: () => navigate('/activity')
        },
        {
          label: 'Success Stories',
          icon: <Heart className="w-4 h-4 mr-2" />,
          command: () => navigate('/success-stories')
        },
        {
          label: 'Safety Tips',
          icon: <Info className="w-4 h-4 mr-2" />,
          command: () => navigate('/safety-tips')
        }
      ]
    }
  ];

  const userMenuItems = [
    {
      label: 'My Profile',
      icon: <User className="w-4 h-4 mr-2" />,
      command: () => navigate('/profile')
    },
    {
      label: 'My Reports',
      icon: <FileText className="w-4 h-4 mr-2" />,
      command: () => navigate('/hub')
    },
    {
      label: 'Notifications',
      icon: <Bell className="w-4 h-4 mr-2" />,
      command: () => navigate('/notifications')
    },
    {
      separator: true
    },
    {
      label: 'Settings',
      icon: <Settings className="w-4 h-4 mr-2" />,
      command: () => navigate('/settings')
    },
    {
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4 mr-2" />,
      command: async () => {
        try {
          await AuthService.signOut();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          logout();
          navigate('/');
        }
      }
    }
  ];

  const authMenuItems = [
    {
      label: 'Sign Up',
      icon: <UserPlus className="w-4 h-4 mr-2" />,
      command: () => navigate('/signup')
    }
  ];

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
      
      {isAuthenticated ? (
        // Authenticated user menu
        <div className="flex items-center gap-2">
          <span className="text-sm hidden md:inline text-white/90 font-medium">
            Welcome, {user?.name || 'User'}
          </span>
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
        // Unauthenticated user menu
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="rounded-full text-white hover:bg-white/10 font-bold"
            onClick={() => openLoginModal()}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
          <Button
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center text-white/70 hover:text-white"
            onClick={(e) => authMenuRef.current?.toggle(e)}
          >
            <MoreVertical size={18} />
          </Button>
          <Menu 
            model={authMenuItems} 
            popup 
            ref={authMenuRef}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Conditional Navigation Bar */}
      {!shouldHideNavBar() && (
        <Menubar
          model={items}
          start={start}
          end={end}
          className=""
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

      {/* Authentication Status Banner (optional) */}
      {!isAuthenticated && !shouldHideNavBar() && location.pathname.includes('/item/') && (
        <div className="w-full p-3 text-center bg-orange-50 border-b border-orange-100 shadow-sm">
          <span className="text-sm text-orange-800 font-semibold flex items-center justify-center gap-2">
            <Info size={16} className="text-orange-600" />
            You can view items freely. Sign in to claim items or report incidents.
          </span>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Conditional Footer - Hide on home and hub pages */}
      {!shouldHideNavBar() && (
        <footer className="bg-gray-50 border-t border-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-4">
                <Logo size="small" variant="full" />
                <div className="h-8 w-px bg-gray-200 hidden md:block" />
                <span className="text-sm text-gray-400 font-medium">Reuniting Communities</span>
              </div>
              
              <div className="flex gap-8 text-sm font-bold text-gray-500">
                <a href="/privacy" className="hover:text-teal-600 transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="hover:text-teal-600 transition-colors">
                  Terms of Service
                </a>
                <a href="/contact" className="hover:text-teal-600 transition-colors">
                  Contact Us
                </a>
              </div>
              
              <div className="text-sm font-bold text-gray-400">
                © {new Date().getFullYear()} ResQHub. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};


export default PublicLayout;

