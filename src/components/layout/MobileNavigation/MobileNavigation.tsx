import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  LayoutGrid, 
  Users, 
  User, 
  MessageSquare, 
  LogIn 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useFeatureFlags } from '../../../hooks';
import { cn } from '@/lib/utils';

export const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated, openLoginModal } = useAuth();
  const { isFeatureEnabled } = useFeatureFlags();

  const navItems = [
    {
      icon: Home,
      label: t('common.home'),
      path: '/',
      active: location.pathname === '/'
    },
    {
      icon: LayoutGrid,
      label: t('common.feed'),
      path: '/hub',
      active: location.pathname.startsWith('/hub') || location.pathname.startsWith('/reports/')
    },
    {
      icon: Users,
      label: t('common.communities'),
      path: '/communities',
      active: location.pathname.startsWith('/communities') || location.pathname.startsWith('/community/')
    },
    ...(isFeatureEnabled('messages') ? [
      {
        icon: MessageSquare,
        label: t('common.messages'),
        path: '/messages',
        active: location.pathname === '/messages'
      }
    ] : []),
    {
      icon: isAuthenticated ? User : LogIn,
      label: isAuthenticated ? t('common.profile') : t('common.login'),
      path: isAuthenticated ? '/profile' : null,
      active: isAuthenticated && location.pathname === '/profile',
      onClick: !isAuthenticated ? () => openLoginModal() : undefined
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-t border-slate-100 px-2 py-1 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 min-w-[64px]",
                item.active 
                  ? "text-teal-600" 
                  : "text-slate-400 hover:text-slate-600"
              )}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else if (item.path) {
                  navigate(item.path);
                }
              }}
            >
              <div className={cn(
                "p-1 rounded-xl transition-all duration-300",
                item.active && "bg-teal-50"
              )}>
                <Icon size={20} strokeWidth={item.active ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-tighter mt-0.5",
                item.active ? "text-teal-600" : "text-slate-400"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
