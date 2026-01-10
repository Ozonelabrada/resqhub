import React, { useState } from 'react';
import { 
  Button, 
  Badge
} from '../../ui';
import { 
  Home, 
  LayoutGrid, 
  FileText, 
  MinusCircle, 
  PlusCircle, 
  Calendar, 
  User, 
  Settings, 
  LogOut, 
  ChevronRight,
  Heart
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const LeftSideBarPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
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
          icon: <Home className="w-5 h-5" />,
          path: '/dashboard',
          description: 'Overview & statistics',
          badge: null
        },
        {
          label: 'Main Hub',
          icon: <LayoutGrid className="w-5 h-5" />,
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
          icon: <FileText className="w-5 h-5" />,
          path: '/reports',
          description: 'Browse all items',
          badge: notifications.newReports
        },
        {
          label: 'Report Lost Item',
          icon: <MinusCircle className="w-5 h-5" />,
          path: '/reports/lost',
          description: 'I lost something',
          badge: null,
          severity: 'danger'
        },
        {
          label: 'Report Found Item',
          icon: <PlusCircle className="w-5 h-5" />,
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
          icon: <Calendar className="w-5 h-5" />,
          path: '/events',
          description: 'Community events',
          badge: null
        },
        {
          label: 'Profile',
          icon: <User className="w-5 h-5" />,
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
      <div key={item.path} className="relative group">
        <Button
          variant={active ? 'primary' : 'ghost'}
          onClick={() => handleNavigation(item.path, item.label)}
          className={`
            w-full justify-start mb-1 px-4 py-3 rounded-xl transition-all duration-200
            ${active 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
            }
          `}
        >
          <div className="flex items-center gap-3 w-full">
            <div className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`}>
              {item.icon}
            </div>
            <span className="font-semibold text-sm flex-1 text-left">{item.label}</span>
            {item.badge && (
              <Badge variant="danger" className="rounded-full px-2 py-0.5 text-[10px]">
                {item.badge}
              </Badge>
            )}
            {active && <ChevronRight className="w-4 h-4 opacity-50" />}
          </div>
        </Button>
      </div>
    );
  };

  return (
    <div className="p-4 h-full flex flex-col bg-white border-r border-slate-100">
      {/* Enhanced Header */}
      <div className="mb-8 text-center space-y-3">
        <div className="relative inline-block">
          <div className="p-3 bg-teal-50 rounded-2xl">
            <Heart className="w-8 h-8 text-teal-600" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
        </div>
        <div>
          <h4 className="text-xl font-black tracking-tighter text-slate-800">SHERRA</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Community About</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <div className="text-lg font-bold text-teal-600">{notifications.newReports}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">New</div>
          </div>
          <div className="space-y-1 border-x border-slate-200">
            <div className="text-lg font-bold text-green-600">{notifications.newMatches}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Matches</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-amber-600">{notifications.messages}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Inbox</div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Menu */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">
              {section.title}
            </h6>
            
            <div className="flex flex-col">
              {section.items.map(renderMenuItem)}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="mt-auto pt-6 space-y-2">
        <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-blue-600 rounded-xl">
          <Settings className="w-5 h-5 mr-3" />
          <span className="font-semibold text-sm">Settings</span>
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
          onClick={logout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-semibold text-sm">Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default LeftSideBarPage;