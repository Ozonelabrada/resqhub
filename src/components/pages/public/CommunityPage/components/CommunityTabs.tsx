import React from 'react';
import { Newspaper, Users, Info, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import type { FeatureFlag } from '@/context/FeatureFlagContext';

export type CommunityTabType = 'feed' | 'chat' | 'members' | 'about';

interface CommunityTabsProps {
  activeTab: CommunityTabType;
  onTabChange: (tab: CommunityTabType) => void;
  memberCount?: number;
}

export const CommunityTabs: React.FC<CommunityTabsProps> = ({
  activeTab,
  onTabChange,
  memberCount = 0
}) => {
  const { isFeatureEnabled } = useFeatureFlags();

  const tabs: { id: CommunityTabType; label: string; icon: React.ReactNode; feature?: FeatureFlag; count?: number }[] = [
    { id: 'feed', label: 'Feed', icon: <Newspaper size={18} /> },
    { id: 'chat', label: 'Live Chat', icon: <TrendingUp size={18} />, feature: 'messages' },
    { id: 'members', label: 'Members', icon: <Users size={18} />, count: memberCount },
    { id: 'about', label: 'About', icon: <Info size={18} /> }
  ];

  return (
    <div className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        if (tab.feature && !isFeatureEnabled(tab.feature)) return null;

        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap group rounded-2xl",
              isActive 
                ? "bg-teal-600 text-white shadow-lg shadow-teal-100" 
                : "text-slate-400 hover:text-teal-600 hover:bg-teal-50"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={cn(
                "px-1.5 py-0.5 rounded-md text-[10px] font-black ml-1 shadow-sm",
                isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-700"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
