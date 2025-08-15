import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { Toast } from 'primereact/toast';
import LeftSideBarPage from '../components/layout/Sidebar/LeftSideBardPage';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated;
  const userData = auth?.userData;
  const logout = auth?.logout;
  const navigate = useNavigate();
  const userMenuRef = useRef<Menu>(null);
  const toast = useRef<Toast>(null);

  // Only allow admins
  useEffect(() => {
    if (
      !isAuthenticated ||
      !userData ||
      !userData.role ||
      userData.role.toLowerCase() !== 'admin'
    ) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, userData, navigate]);

  // Logout handler
  const handleLogout = () => {
    if (logout) logout();
    navigate('/admin/login', { replace: true });
  };

  // Add Logout to userMenuItems
  const userMenuItems = [
    {
      label: 'Profile Settings',
      icon: 'pi pi-user',
      command: () => {
        toast.current?.show({
          severity: 'info',
          summary: 'Profile',
          detail: 'Opening profile settings...',
          life: 3000
        });
        // navigate('/admin/profile');
      }
    },
    {
      label: 'Account Settings',
      icon: 'pi pi-cog',
      command: () => {
        toast.current?.show({
          severity: 'info',
          summary: 'Settings',
          detail: 'Opening account settings...',
          life: 3000
        });
        // navigate('/admin/settings');
      }
    },
    {
      separator: true
    },
    {
      label: 'View Public Site',
      icon: 'pi pi-external-link',
      command: () => {
        window.open('/', '_blank');
      }
    },
    {
      label: 'Help & Support',
      icon: 'pi pi-question-circle',
      command: () => {
        toast.current?.show({
          severity: 'info',
          summary: 'Help',
          detail: 'Opening help center...',
          life: 3000
        });
        // navigate('/admin/help');
      }
    },
    {
      separator: true
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: handleLogout
    }
  ];

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-hide sidebar on mobile
      if (mobile) {
        setShowLeftSidebar(false);
      } else {
        setShowLeftSidebar(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const items = [
    { 
      label: isMobile ? '' : 'Dashboard', 
      icon: 'pi pi-home', 
      command: () => navigate('/admin/dashboard'),
      className: isMobile ? 'p-menuitem-icon-only' : ''
    },
    { 
      label: isMobile ? '' : 'Items', 
      icon: 'pi pi-box', 
      command: () => navigate('/admin/items'),
      className: isMobile ? 'p-menuitem-icon-only' : ''
    },
    { 
      label: isMobile ? '' : 'Analytics', 
      icon: 'pi pi-chart-bar', 
      command: () => navigate('/admin/analytics'),
      className: isMobile ? 'p-menuitem-icon-only' : ''
    },
    { 
      label: isMobile ? '' : 'Users', 
      icon: 'pi pi-users', 
      command: () => navigate('/admin/users'),
      className: isMobile ? 'p-menuitem-icon-only' : ''
    }
  ];

  const start = (
    <div className="flex align-items-center gap-2">
      {/* Mobile menu button */}
      <Button
        icon="pi pi-bars"
        className="p-button-text md:hidden"
        onClick={() => setShowLeftSidebar(!showLeftSidebar)}
        style={{ color: '#475569' }}
      />
      <button
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        onClick={() => navigate('/admin')}
        className="flex align-items-center gap-2"
      >
        {isMobile ? (
          <span className="text-xl font-bold text-primary">RQ Admin</span>
        ) : (
          <>
            <i className="pi pi-shield text-primary text-xl"></i>
            <span className="text-xl font-bold text-primary">ResQHub</span>
            <Badge value="Admin" severity="info" className="ml-2"></Badge>
          </>
        )}
      </button>
    </div>
  );

  const end = (
    <div className="flex align-items-center gap-3">
      {/* Export Button - Desktop Only */}
      {!isMobile && (
        <Button 
          label="Export Report" 
          icon="pi pi-download" 
          className="p-button-outlined p-button-sm"
          tooltip="Export Report"
        />
      )}
      
      {/* User Account Section */}
      <div className="flex align-items-center gap-3">
        {/* User Info - Desktop Only */}
        {!isMobile && (
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-700">{userData?.email}</div>
            <div className="text-xs text-gray-500">{userData?.role}</div>
          </div>
        )}
        
        {/* User Avatar with Dropdown */}
        <div className="relative">
          <Avatar
            icon={userData?.avatar ? undefined : "pi pi-user"}
            image={userData?.avatar || undefined}
            size="large"
            shape="circle"
            className="cursor-pointer hover:shadow-3 transition-all transition-duration-200"
            style={{ 
              backgroundColor: userData?.avatar ? undefined : '#3B82F6', 
              color: 'white',
              border: '2px solid #e5e7eb'
            }}
            onClick={(e) => userMenuRef.current?.toggle(e)}
          />
          <Menu 
            model={userMenuItems} 
            popup 
            ref={userMenuRef}
            className="w-15rem"
            style={{ marginTop: '0.5rem' }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toast ref={toast} />
      
      {/* Fixed Top Navigation */}
      <div style={{ flexShrink: 0 }}>
        <Menubar 
          model={items} 
          start={start} 
          end={end}
          style={{ borderRadius: 0 }}
        />
      </div>

      {/* Main Content Area - Fixed for scrolling */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        overflow: 'hidden' // Only prevent overflow on the flex container
      }}>
        {/* Mobile Sidebar Overlay */}
        {isMobile && (
          <Sidebar
            visible={showLeftSidebar}
            onHide={() => setShowLeftSidebar(false)}
            className="w-18rem"
            modal
          >
            <LeftSideBarPage />
          </Sidebar>
        )}

        {/* Desktop Left Sidebar */}
        {!isMobile && showLeftSidebar && (
          <div style={{
            width: '320px',
            flexShrink: 0,
            borderRight: '1px solid #e5e7eb',
            backgroundColor: 'white',
            overflowY: 'auto'
          }}>
            <LeftSideBarPage />
          </div>
        )}

        {/* Main Content Area - FIXED: Allow scrolling */}
        <div style={{ 
          flexGrow: 1,
          overflow: 'auto',
          height: '100%'
        }}>
          <Outlet />
        </div>
      </div>

      {/* Mobile Bottom Navigation for Admin */}
      {isMobile && (
        <div 
          className="fixed bottom-0 left-0 right-0 bg-white border-top-1 surface-border p-2 z-5"
          style={{ 
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div className="flex justify-content-around">
            <Button
              icon="pi pi-home"
              className="p-button-text flex-column"
              onClick={() => navigate('/admin/dashboard')}
              style={{ color: '#475569', padding: '0.5rem' }}
            >
              <small style={{ fontSize: '0.7rem', marginTop: '2px' }}>Dashboard</small>
            </Button>
            <Button
              icon="pi pi-box"
              className="p-button-text flex-column"
              onClick={() => navigate('/admin/items')}
              style={{ color: '#475569', padding: '0.5rem' }}
            >
              <small style={{ fontSize: '0.7rem', marginTop: '2px' }}>Items</small>
            </Button>
            <Button
              icon="pi pi-chart-bar"
              className="p-button-text flex-column"
              onClick={() => navigate('/admin/analytics')}
              style={{ color: '#475569', padding: '0.5rem' }}
            >
              <small style={{ fontSize: '0.7rem', marginTop: '2px' }}>Analytics</small>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;