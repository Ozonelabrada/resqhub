import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { Badge } from 'primereact/badge';
import LeftSideBarPage from '../components/layout/Sidebar/LeftSideBardPage';

const AdminLayout = () => {
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

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
    <div className="flex align-items-center gap-2">
      <Button
        label={isMobile ? '' : 'View Public Site'}
        icon="pi pi-external-link"
        className="p-button-outlined p-button-sm"
        onClick={() => navigate('/')}
        tooltip="View Public Site"
      />
      <Button 
        label={isMobile ? '' : 'Logout'} 
        icon="pi pi-sign-out" 
        className="p-button-text" 
        onClick={() => navigate('/admin/login')}
        style={{ color: '#dc2626' }}
        tooltip="Logout"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-column" style={{ backgroundColor: '#f8fafc' }}>
      {/* Admin Header */}
      <Menubar 
        model={items} 
        start={start} 
        end={end} 
        className="w-full shadow-2" 
        style={{ 
          padding: isMobile ? '0.5rem 0.75rem' : '0.5rem 1rem',
          minHeight: 'auto',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0'
        }} 
      />

      <div className="flex-grow-1" style={{ display: 'flex', backgroundColor: '#f8fafc' }}>
        {/* Desktop Sidebar */}
        {!isMobile && showLeftSidebar && (
          <div style={{ 
            width: '280px', 
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            position: 'relative',
            boxShadow: '2px 0 4px rgba(0,0,0,0.04)'
          }}>
            <Button
              icon="pi pi-angle-left"
              className="p-button-sm p-button-text absolute"
              style={{ 
                top: '8px', 
                right: '8px', 
                zIndex: 10,
                color: '#64748b'
              }}
              onClick={() => setShowLeftSidebar(false)}
              tooltip="Hide Sidebar"
            />
            <LeftSideBarPage />
          </div>
        )}

        {/* Desktop - Show sidebar button when hidden */}
        {!isMobile && !showLeftSidebar && (
          <div style={{ 
            width: 'auto', 
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            padding: '8px',
            boxShadow: '2px 0 4px rgba(0,0,0,0.04)'
          }}>
            <Button
              icon="pi pi-angle-right"
              className="p-button-sm p-button-text"
              style={{ color: '#64748b' }}
              onClick={() => setShowLeftSidebar(true)}
              tooltip="Show Sidebar"
            />
          </div>
        )}

        {/* Mobile Sidebar (Overlay) */}
        {isMobile && (
          <Sidebar
            visible={showLeftSidebar}
            onHide={() => setShowLeftSidebar(false)}
            position="left"
            style={{ width: '280px' }}
            modal
            dismissable
          >
            <LeftSideBarPage />
          </Sidebar>
        )}

        {/* Main Content Area */}
        <div
          style={{
            flexGrow: 1,
            backgroundColor: '#ffffff',
            minWidth: 0,
            overflow: 'auto',
            margin: isMobile ? '8px' : '16px',
            borderRadius: isMobile ? '8px' : '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0'
          }}
        >
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
            <Button
              icon="pi pi-users"
              className="p-button-text flex-column"
              onClick={() => navigate('/admin/users')}
              style={{ color: '#475569', padding: '0.5rem' }}
            >
              <small style={{ fontSize: '0.7rem', marginTop: '2px' }}>Users</small>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;