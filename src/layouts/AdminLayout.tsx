import React, { useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  Users, 
  FileText, 
  CreditCard, 
  Shield, 
  LogOut, 
  ChevronRight,
  Menu as MenuIcon,
  X,
  Bell,
  Settings,
  Search,
  History,
  User as UserIcon,
  Heart,
  Clock,
  Home,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Button, 
  Avatar, 
  Badge,
  Input,
  Logo,
  Menu
} from '../components/ui';
import type { MenuRef } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import ConfirmationModal from '../components/modals/ConfirmationModal/ConfirmationModal';

const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const userMenuRef = useRef<MenuRef>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavConfirmOpen, setIsNavConfirmOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const userMenuItems = [
    {
      label: t('common.my_profile'),
      icon: <UserIcon className="w-4 h-4 mr-2" />,
      command: () => handleNavigation('/profile')
    },
    {
      label: t('common.notifications'),
      icon: <Bell className="w-4 h-4 mr-2" />,
      command: () => handleNavigation('/notifications')
    },
    {
      separator: true
    },
    {
      label: t('common.settings'),
      icon: <Settings className="w-4 h-4 mr-2" />,
      command: () => handleNavigation('/settings')
    },
    {
      label: t('common.sign_out'),
      icon: <LogOut className="w-4 h-4 mr-2" />,
      command: () => logout()
    }
  ];

  const menuItems = [
    {
      id: 'newsfeed',
      label: 'FindrHub',
      icon: <Home size={20} />,
      path: '/hub'
    },
    // Overview
    {
      id: 'dashboard',
      label: 'Overview',
      icon: <BarChart3 size={20} />,
      path: '/admin',
      category: 'Dashboard'
    },
    // Section 1: Core Management
    {
      category: 'Core Management',
      categoryIcon: <Shield size={18} />,
      items: [
        {
          id: 'users',
          label: 'User Management',
          icon: <Shield size={20} />,
          path: '/admin/users'
        }
      ]
    },
    // Section 2: Community & Applications
    {
      category: 'Communities',
      categoryIcon: <Users size={18} />,
      items: [
        {
          id: 'communities',
          label: 'Communities',
          icon: <Users size={20} />,
          path: '/admin/communities'
        },
        {
          id: 'applications',
          label: 'Applications',
          icon: <Briefcase size={20} />,
          path: '/admin/applications'
        }
      ]
    },
    // Section 3: Rider Operations
    {
      category: 'Rider Operations',
      categoryIcon: <TrendingUp size={18} />,
      items: [
        {
          id: 'riders',
          label: 'Riders',
          icon: <TrendingUp size={20} />,
          path: '/admin/riders'
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: <FileText size={20} />,
          path: '/admin/reports'
        }
      ]
    },
    // Section 4: Revenue
    {
      category: 'Revenue & Billing',
      categoryIcon: <CreditCard size={18} />,
      items: [
        {
          id: 'subscriptions',
          label: 'Subscriptions',
          icon: <CreditCard size={20} />,
          path: '/admin/subscriptions',
          children: [
            {
              id: 'subscriptions-communities',
              label: 'Communities',
              path: '/admin/subscriptions/communities'
            },
            {
              id: 'subscriptions-riders',
              label: 'Riders',
              path: '/admin/subscriptions/riders'
            },
            {
              id: 'subscriptions-sellers',
              label: 'Sellers',
              path: '/admin/subscriptions/sellers'
            },
            {
              id: 'subscriptions-events',
              label: 'Events',
              path: '/admin/subscriptions/events'
            },
            {
              id: 'subscriptions-services',
              label: 'Service Providers',
              path: '/admin/subscriptions/service-providers'
            }
          ]
        }
      ]
    },
    // Section 5: Communications
    {
      category: 'Communications',
      categoryIcon: <Bell size={18} />,
      items: [
        {
          id: 'announcements',
          label: 'Announcements',
          icon: <Bell size={20} />,
          path: '/admin/announcements'
        }
      ]
    },
    // Section 6: System
    {
      category: 'System',
      categoryIcon: <Settings size={18} />,
      items: [
        {
          id: 'appconfig',
          label: 'App Config',
          icon: <Settings size={20} />,
          path: '/admin/app-config'
        },
        {
          id: 'audit',
          label: 'Audit Trail',
          icon: <History size={20} />,
          path: '/admin/audit'
        }
      ]
    }
  ];

  const handleLogout = () => {
    logout();
  };

  const handleNavigation = (path: string) => {
    // If navigating outside of admin panel, show confirmation
    if (!path.startsWith('/admin')) {
      setPendingPath(path);
      setIsNavConfirmOpen(true);
      return;
    }
    navigate(path);
  };

  const confirmNavigation = () => {
    if (pendingPath) {
      navigate(pendingPath);
      setIsNavConfirmOpen(false);
      setPendingPath(null);
    }
  };

  const currentPath = location.pathname;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <ConfirmationModal
        visible={isNavConfirmOpen}
        onHide={() => setIsNavConfirmOpen(false)}
        onConfirm={confirmNavigation}
        title="Leave Admin Panel?"
        message="Are you sure you want to leave the Admin Panel? Any unsaved changes may be lost."
        confirmLabel="Leave"
        cancelLabel="Stay"
        severity="warning"
      />
      {/* Sidebar - Desktop */}
      <aside 
        className={cn(
          "hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out z-30",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3">
              <Logo variant="icon" size={32} />
              <span className="font-black text-slate-900 tracking-tight text-lg">FindrHub Admin</span>
            </div>
          )}
          {isSidebarCollapsed && (
            <div className="mx-auto">
              <Logo variant="icon" size={32} />
            </div>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {menuItems.map((item: any, index: number) => {
            // Handle grouped category items
            if (item.items && item.category) {
              return (
                <div key={`category-${index}`} className="space-y-2">
                  {!isSidebarCollapsed && (
                    <div className="flex items-center gap-2 px-4 py-2 mt-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {item.categoryIcon && <span className="text-slate-300">{item.categoryIcon}</span>}
                      <span>{item.category}</span>
                    </div>
                  )}
                  {item.items.map((subItem: any) => {
                    const isActive = currentPath === subItem.path || (subItem.path !== '/admin' && currentPath.startsWith(subItem.path + '/'));
                    const hasChildren = subItem.children && subItem.children.length > 0;
                    const isChildActive = hasChildren && subItem.children.some((child: any) => currentPath === child.path || (child.path !== '/admin' && currentPath.startsWith(child.path + '/')));
                    
                    return (
                      <div key={subItem.id}>
                        <button
                          onClick={() => handleNavigation(subItem.path)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                            (isActive || isChildActive) 
                              ? "bg-teal-50 text-teal-700 font-bold" 
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                          )}
                          title={isSidebarCollapsed ? subItem.label : undefined}
                        >
                          <div className={cn(
                            "transition-colors",
                            (isActive || isChildActive) ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600"
                          )}>
                            {subItem.icon}
                          </div>
                          {!isSidebarCollapsed && <span>{subItem.label}</span>}
                          {!isSidebarCollapsed && (isActive || isChildActive) && (
                            <div className="ml-auto w-1.5 h-1.5 bg-teal-600 rounded-full" />
                          )}
                        </button>
                        
                        {/* Render children if they exist and parent is active */}
                        {hasChildren && (isActive || isChildActive) && !isSidebarCollapsed && (
                          <div className="mt-1 ml-4 space-y-1 pl-2 border-l border-slate-200">
                            {subItem.children.map((child: any) => {
                              const childIsActive = currentPath === child.path || (child.path !== '/admin' && currentPath.startsWith(child.path));
                              return (
                                <button
                                  key={child.id}
                                  onClick={() => handleNavigation(child.path)}
                                  className={cn(
                                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                                    childIsActive
                                      ? "bg-teal-100 text-teal-700 font-bold"
                                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                  )}
                                  title={child.label}
                                >
                                  {child.label}
                                  {childIsActive && (
                                    <div className="ml-auto w-1 h-1 bg-teal-600 rounded-full inline-block" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // Handle standalone items (for backward compatibility)
            if (item.path) {
              const isActive = currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path + '/'));
              
              return (
                <button key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                    isActive 
                      ? "bg-teal-50 text-teal-700 font-bold" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  )}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <div className={cn(
                    "transition-colors",
                    isActive ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600"
                  )}>
                    {item.icon}
                  </div>
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                  {!isSidebarCollapsed && isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-teal-600 rounded-full" />
                  )}
                </button>
              );
            }
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-all font-medium group"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <div className="transition-transform group-hover:scale-110">
              {isSidebarCollapsed ? (
                <ChevronRight size={20} className="rotate-180" />
              ) : (
                <ChevronRight size={20} />
              )}
            </div>
            {!isSidebarCollapsed && <span>Collapse</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all font-medium"
            title={isSidebarCollapsed ? "Logout" : undefined}
          >
            <LogOut size={20} />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              title="Open menu"
            >
              <MenuIcon size={24} />
            </button>

            <button
              className="hidden md:block p-2 text-slate-500 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-all"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronRight size={20} className={cn("transition-transform duration-300", isSidebarCollapsed ? "rotate-180" : "")} />
            </button>
            
            <div className="hidden lg:flex items-center bg-slate-100 rounded-xl px-4 py-2 w-96 border border-transparent focus-within:border-teal-500/30 focus-within:bg-white transition-all">
              <Search size={18} className="text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search everything..." 
                className="bg-transparent border-none outline-none w-full text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Healthy</span>
            </div>

            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all" title="Notifications">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />

            {user && (
              <div className="relative">
                <button 
                  onClick={(e) => userMenuRef.current?.toggle(e)}
                  className="flex items-center gap-3 pl-2 hover:bg-slate-50 p-1.5 rounded-2xl transition-all border border-transparent hover:border-slate-100"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-slate-900 leading-none mb-1">
                      {user.name || (user as any).displayName || user.username || 'Admin'}
                    </p>
                    <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Administrator</p>
                  </div>
                  <Avatar 
                    className="w-10 h-10 border-2 border-white shadow-sm rounded-xl"
                    src={user.profilePicture}
                  >
                    {user.name?.charAt(0) || (user as any).displayName?.charAt(0) || user.username?.charAt(0) || 'A'}
                  </Avatar>
                </button>
                <Menu 
                  model={userMenuItems} 
                  popup 
                  ref={userMenuRef}
                />
              </div>
            )}
          </div>
        </header>

        {/* Tab-like Breadcrumbs / Section Title area */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <nav className="flex items-center gap-2">
            <span className="text-slate-400 font-medium text-sm">Admin</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-teal-600 font-bold text-sm">
              {(() => {
                // Find matching item in menu structure
                for (const item of menuItems) {
                  if (item.path && (currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path)))) {
                    return item.label;
                  }
                  if (item.items) {
                    for (const subItem of item.items) {
                      if (currentPath === subItem.path || (subItem.path !== '/admin' && currentPath.startsWith(subItem.path))) {
                        return subItem.label;
                      }
                    }
                  }
                }
                return 'Details';
              })()}
            </span>
          </nav>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="rounded-lg text-slate-500 h-8 gap-2">
              <Settings size={16} />
              Settings
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Logo variant="icon" size={32} />
            <span className="font-black text-slate-900 tracking-tight text-lg">FindrHub Admin</span>
          </div>
          <button 
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {menuItems.map((item: any, index: number) => {
            // Handle grouped category items
            if (item.items && item.category) {
              return (
                <div key={`category-${index}`} className="space-y-2">
                  <div className="flex items-center gap-2 px-4 py-2 mt-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {item.categoryIcon && <span className="text-slate-300">{item.categoryIcon}</span>}
                    <span>{item.category}</span>
                  </div>
                  {item.items.map((subItem: any) => {
                    const isActive = currentPath === subItem.path || (subItem.path !== '/admin' && currentPath.startsWith(subItem.path));
                    const hasChildren = subItem.children && subItem.children.length > 0;
                    const isChildActive = hasChildren && subItem.children.some((child: any) => currentPath === child.path || (child.path !== '/admin' && currentPath.startsWith(child.path)));
                    const [expandedChild, setExpandedChild] = React.useState<string | null>(null);
                    
                    return (
                      <div key={subItem.id}>
                        <button
                          onClick={() => {
                            handleNavigation(subItem.path);
                            if (hasChildren && (isActive || isChildActive)) {
                              setExpandedChild(expandedChild === subItem.id ? null : subItem.id);
                            } else if (!hasChildren) {
                              setIsMobileMenuOpen(false);
                            }
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all",
                            (isActive || isChildActive) 
                              ? "bg-teal-50 text-teal-700 font-bold" 
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                          )}
                        >
                          <div className={cn(
                            "transition-colors",
                            (isActive || isChildActive) ? "text-teal-600" : "text-slate-400"
                          )}>
                            {subItem.icon}
                          </div>
                          <span>{subItem.label}</span>
                          {hasChildren && (
                            <div className="ml-auto text-xs">
                              {expandedChild === subItem.id ? '▲' : '▼'}
                            </div>
                          )}
                        </button>
                        {hasChildren && expandedChild === subItem.id && (
                          <div className="mt-1 ml-6 space-y-1 pl-2 border-l border-slate-200">
                            {subItem.children.map((child: any) => {
                              const childIsActive = currentPath === child.path || (child.path !== '/admin' && currentPath.startsWith(child.path));
                              return (
                                <button
                                  key={child.id}
                                  onClick={() => {
                                    handleNavigation(child.path);
                                    setIsMobileMenuOpen(false);
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                                    childIsActive
                                      ? "bg-teal-100 text-teal-700 font-bold"
                                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                  )}
                                >
                                  {child.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // Handle standalone items
            if (item.path) {
              const isActive = currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path));
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavigation(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all",
                    isActive 
                      ? "bg-teal-50 text-teal-700 font-bold" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  )}
                >
                  <div className={cn(
                    "transition-colors",
                    isActive ? "text-teal-600" : "text-slate-400"
                  )}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </button>
              );
            }
          })}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl bg-rose-50 text-rose-600 font-black transition-all"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default AdminLayout;
