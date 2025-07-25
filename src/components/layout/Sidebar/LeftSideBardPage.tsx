import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { useNavigate, useLocation } from 'react-router-dom';

const LeftSideBarPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications] = useState({
    newMatches: 3,
    newReports: 7,
    messages: 2
  });

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string, action: string) => {
    navigate(path);
    console.log(`User navigated to ${action}`);
  };

  const menuSections = [
    {
      title: 'Main',
      items: [
        {
          label: 'Dashboard',
          icon: 'pi pi-home',
          path: '/dashboard',
          description: 'Overview & statistics',
          badge: null
        },
        {
          label: 'Main Hub',
          icon: 'pi pi-th-large',
          path: '/mainhub',
          description: 'Central workspace',
          badge: null
        }
      ]
    },
    {
      title: 'Reports & Items',
      items: [
        {
          label: 'All Reports',
          icon: 'pi pi-file',
          path: '/reports',
          description: 'Browse all items',
          badge: notifications.newReports
        },
        {
          label: 'Report Lost Item',
          icon: 'pi pi-minus-circle',
          path: '/reports/lost',
          description: 'I lost something',
          badge: null,
          severity: 'danger'
        },
        {
          label: 'Report Found Item',
          icon: 'pi pi-plus-circle',
          path: '/reports/found',
          description: 'I found something',
          badge: null,
          severity: 'success'
        }
      ]
    },
    {
      title: 'Community',
      items: [
        {
          label: 'Events',
          icon: 'pi pi-calendar',
          path: '/events',
          description: 'Community events',
          badge: null
        },
        {
          label: 'Profile',
          icon: 'pi pi-user',
          path: '/profile',
          description: 'Your account',
          badge: null
        }
      ]
    }
  ];

  const renderMenuItem = (item: any) => {
    const active = isActive(item.path);
    
    return (
      <div key={item.path} className="relative">
        <Button
          label={item.label}
          icon={item.icon}
          className={`
            w-full justify-content-start mb-1 transition-all transition-duration-200
            ${active 
              ? 'border-none' 
              : 'p-button-text hover:surface-hover'
            }
          `}
          style={{
            backgroundColor: active ? '#3b82f6' : 'transparent',
            color: active ? '#ffffff' : '#475569',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem'
          }}
          onClick={() => handleNavigation(item.path, item.label)}
          tooltip={item.description}
          tooltipOptions={{ position: 'right', showDelay: 500 }}
        />
        
        {/* Notification badges */}
        {item.badge && (
          <Badge 
            value={item.badge} 
            severity="danger"
            className="absolute"
            style={{ 
              top: '8px', 
              right: '8px',
              fontSize: '0.65rem',
              minWidth: '1.2rem',
              height: '1.2rem',
              backgroundColor: '#ef4444'
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="p-3 h-full flex flex-column" style={{ backgroundColor: '#ffffff' }}>
      {/* Enhanced Header */}
      <div className="mb-4 text-center">
        <div className="mb-2">
          <Avatar 
            icon="pi pi-search" 
            className="text-white" 
            size="large"
            shape="circle"
            style={{ backgroundColor: '#3b82f6' }}
          />
        </div>
        <h4 className="font-bold mb-1" style={{ color: '#1e293b' }}>ResQHub</h4>
        <small style={{ color: '#64748b' }}>Lost & Found Platform</small>
        
        {/* Status indicator */}
        <div className="flex align-items-center justify-content-center gap-1 mt-2 text-xs">
          <div className="w-2 h-2 border-round animation-pulse" style={{ backgroundColor: '#10b981' }}></div>
          <span style={{ color: '#64748b' }}>Online</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mb-3 p-3 border-round" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <div className="grid text-center">
          <div className="col-4">
            <div className="font-bold" style={{ color: '#3b82f6' }}>{notifications.newReports}</div>
            <div className="text-xs" style={{ color: '#64748b' }}>New</div>
          </div>
          <div className="col-4">
            <div className="font-bold" style={{ color: '#10b981' }}>{notifications.newMatches}</div>
            <div className="text-xs" style={{ color: '#64748b' }}>Matches</div>
          </div>
          <div className="col-4">
            <div className="font-bold" style={{ color: '#f59e0b' }}>{notifications.messages}</div>
            <div className="text-xs" style={{ color: '#64748b' }}>Messages</div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Menu */}
      <div className="flex-grow-1 overflow-y-auto">
        {menuSections.map((section, index) => (
          <div key={section.title} className="mb-4">
            <h6 className="text-sm font-bold mb-2 px-2 uppercase tracking-wide" style={{ color: '#64748b' }}>
              {section.title}
            </h6>
            
            <div className="flex flex-column">
              {section.items.map(renderMenuItem)}
            </div>
            
            {index < menuSections.length - 1 && (
              <Divider className="my-3" style={{ borderColor: '#e2e8f0' }} />
            )}
          </div>
        ))}
      </div>

      {/* Quick actions footer */}
      <div className="mt-auto pt-3" style={{ borderTop: '1px solid #e2e8f0' }}>
        <Button
          label="Need Help?"
          icon="pi pi-question-circle"
          className="w-full p-button-text p-button-sm"
          style={{ color: '#64748b' }}
          onClick={() => handleNavigation('/help', 'Help Center')}
        />
      </div>
    </div>
  );
};

export default LeftSideBarPage;