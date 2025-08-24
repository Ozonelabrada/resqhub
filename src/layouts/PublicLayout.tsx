import { useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { useAuth } from '../context/AuthContext';

const PublicLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userData: user, setIsAuthenticated, setUserData } = useAuth() ?? {};

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
      navigate('/signup');
    } else {
      navigate(path);
    }
  };

  const items = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      command: () => navigate('/')
    },
    {
      label: 'Search Items',
      icon: 'pi pi-search',
      command: () => navigate('/search')
    },
    {
      label: 'Report Found/Lost',
      icon: 'pi pi-plus-circle',
      items: [
        {
          label: 'Report Lost Item',
          icon: 'pi pi-minus-circle',
          command: () => handleProtectedNavigation('/report?type=lost', 'report')
        },
        {
          label: 'Report Found Item',
          icon: 'pi pi-plus-circle',
          command: () => handleProtectedNavigation('/report?type=found', 'report')
        }
      ]
    },
    {
      label: 'Community',
      icon: 'pi pi-users',
      items: [
        {
          label: 'Recent Activity',
          icon: 'pi pi-clock',
          command: () => navigate('/activity')
        },
        {
          label: 'Success Stories',
          icon: 'pi pi-heart',
          command: () => navigate('/success-stories')
        },
        {
          label: 'Safety Tips',
          icon: 'pi pi-info-circle',
          command: () => navigate('/safety-tips')
        }
      ]
    }
  ];

  const userMenuItems = [
    {
      label: 'My Profile',
      icon: 'pi pi-user',
      command: () => navigate('/profile')
    },
    {
      label: 'My Reports',
      icon: 'pi pi-file',
      command: () => navigate('/hub')
    },
    {
      label: 'Notifications',
      icon: 'pi pi-bell',
      command: () => navigate('/notifications')
    },
    {
      separator: true
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => navigate('/settings')
    },
    {
      label: 'Sign Out',
      icon: 'pi pi-sign-out',
      command: () => {
        localStorage.removeItem('publicUserToken');
        localStorage.removeItem('publicUserData');
        if (setIsAuthenticated) setIsAuthenticated(false);
        if (setUserData) setUserData(null);
        setTimeout(() => navigate('/'), 0);
      }
    }
  ];

  const authMenuItems = [
    {
      label: 'Sign In',
      icon: 'pi pi-sign-in',
      command: () => navigate('/signin')
    },
    {
      label: 'Sign Up',
      icon: 'pi pi-user-plus',
      command: () => navigate('/signup')
    },
    {
      separator: true
    },
    {
      label: 'Admin Login',
      icon: 'pi pi-cog',
      command: () => navigate('/admin/login'),
      className: 'text-gray-600'
    }
  ];

  const start = (
    <div className="flex align-items-center gap-2">
      <button
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        onClick={() => navigate('/')}
        className="flex align-items-center gap-2"
      >
        <i className="pi pi-shield text-primary text-2xl"></i>
        <span className="text-xl font-bold text-primary">ResQHub</span>
      </button>
    </div>
  );

  const end = (
    <div className="flex align-items-center gap-2">
      
      {isAuthenticated ? (
        // Authenticated user menu
        <div className="flex align-items-center gap-2">
          <span className="text-sm hidden md:inline">
            Welcome, {user?.name || 'User'}
          </span>
          <Avatar
            icon="pi pi-user"
            className="cursor-pointer"
            style={{ backgroundColor: '#3B82F6', color: 'white' }}
            onClick={(e) => userMenuRef.current?.toggle(e)}
          />
          <Menu 
            model={userMenuItems} 
            popup 
            ref={userMenuRef}
          />
        </div>
      ) : (
        // Unauthenticated user menu
        <div className="flex align-items-center gap-2">
          <Button
            icon="pi pi-ellipsis-v"
            className="p-button-text p-button-rounded"
            onClick={(e) => authMenuRef.current?.toggle(e)}
          />
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
    <div className="min-h-screen flex flex-column">
      {/* Conditional Navigation Bar */}
      {!shouldHideNavBar() && (
        <Menubar
          model={items}
          start={start}
          end={end}
          className="border-none shadow-2"
          style={{ 
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb'
          }}
        />
      )}

      {/* Authentication Status Banner (optional) */}
      {!isAuthenticated && !shouldHideNavBar() && (location.pathname === '/search' || location.pathname.includes('/item/')) && (
        <div className="w-full p-2 text-center" style={{ backgroundColor: '#fef3c7', borderBottom: '1px solid #f59e0b', color: '#000000ff' }}>
          <span className="text-sm text-yellow-800">
            <i className="pi pi-info-circle mr-2"></i>
            You can search items freely. 
            to claim items or report incidents.
          </span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8fafc' }}>
        <Outlet />
      </div>

      {/* Conditional Footer - Hide on home and hub pages */}
      {!shouldHideNavBar() && (
        <footer 
          className="w-full p-4 text-center"
          style={{ 
            backgroundColor: '#1e293b', 
            color: '#f1f5f9' 
          }}
        >
          <div className="container mx-auto">
            <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3">
              <div className="flex align-items-center gap-2">
                <i className="pi pi-shield text-primary"></i>
                <span className="font-semibold">ResQHub</span>
                <span className="text-sm opacity-75">- Reuniting Communities</span>
              </div>
              
              <div className="flex gap-4 text-sm">
                <a href="/privacy" className="text-gray-300 hover:text-white no-underline">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-gray-300 hover:text-white no-underline">
                  Terms of Service
                </a>
                <a href="/contact" className="text-gray-300 hover:text-white no-underline">
                  Contact Us
                </a>
              </div>
              
              <div className="text-sm opacity-75">
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
