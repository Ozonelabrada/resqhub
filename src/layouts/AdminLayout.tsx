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
  Home
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
import ConfirmationModal from '../components/modals/ConfirmationModal/ConfirmationModal';

const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

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
    {
      id: 'dashboard',
      label: 'Overview',
      icon: <BarChart3 size={20} />,
      path: '/admin'
    },
    {
      id: 'communities',
      label: 'Communities',
      icon: <Users size={20} />,
      path: '/admin/communities'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText size={20} />,
      path: '/admin/reports'
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: <CreditCard size={20} />,
      path: '/admin/subscriptions'
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: <History size={20} />,
      path: '/admin/audit'
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
          {menuItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path));
            
            return (
              <button
                key={item.id}
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
                  isActive ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600 text-lg" // increased text size for icon fallback
                )}>
                  {item.icon}
                </div>
                {!isSidebarCollapsed && <span>{item.label}</span>}
                {!isSidebarCollapsed && isActive && (
                  <div className="ml-auto w-1.5 h-1.5 bg-teal-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-4">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full hidden lg:flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-all font-medium"
          >
            <ChevronRight className={cn("transition-transform", isSidebarCollapsed ? "" : "rotate-180")} size={20} />
            {!isSidebarCollapsed && <span>Collapse</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all font-medium"
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
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <MenuIcon size={24} />
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

            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
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
              {menuItems.find(item => currentPath === item.path || (item.id !== 'dashboard' && currentPath.startsWith(item.path)))?.label || 'Details'}
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
          {menuItems.map((item) => {
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
