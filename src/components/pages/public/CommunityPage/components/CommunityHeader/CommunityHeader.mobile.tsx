import React from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import type { CommunityTabType } from '@/components/pages/public/NewsFeedPage/components/NewsFeedSidebar';

interface CommunityHeaderMobileProps {
  community: any;
  isAdmin: boolean;
  isMember: boolean;
  memberCount?: number;
  activeTab?: CommunityTabType;
  onTabChange?: (tab: CommunityTabType) => void;
  onSettingsClick: () => void;
  onModerationClick: () => void;
}

const CommunityHeaderMobile: React.FC<CommunityHeaderMobileProps> = ({
  community,
  memberCount = 0,
  activeTab = 'feed',
  onTabChange,
}) => {
  const handleBackClick = () => {
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  const tabs = [
    { id: 'feed', label: 'Feed', width: 'min-w-[84px]' },
    { id: 'updates', label: 'News', width: 'min-w-[84px]' },
    { id: 'events', label: 'Events', width: 'min-w-[84px]' },
    { id: 'members', label: 'Members', width: 'min-w-[84px]' },
  ] as const;

  return (
    <div className="w-full relative shrink-0 z-30">
      <div className="h-64 bg-slate-900 relative overflow-visible text-white shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500 rounded-full -mr-64 -mt-64 blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500 rounded-full -ml-48 -mb-48 blur-[100px]"></div>
        </div>

        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="absolute left-4 top-4 z-30 bg-white/90 p-2 rounded-lg shadow-sm border border-slate-100"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>

        {/* Title Section (No Avatar on Mobile) */}
        <div className="h-full w-full px-4 flex items-end pb-12 relative z-10">
          <div className="flex flex-col items-center w-full pt-4">
            <h1 className="text-4xl font-black text-white drop-shadow-md tracking-tight uppercase text-center">
              {community?.name}
            </h1>

            <p className="text-teal-50 text-base font-medium opacity-90 max-w-sm line-clamp-1 mt-2 text-center">
              {community?.tagline}
            </p>

            {/* Member Count Pill */}
            <div className="mt-3">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="bg-white pt-3 pb-3 border-t border-slate-100 shadow-sm relative z-20">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex gap-3 overflow-x-auto scrollbar-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Tab clicked:', tab.id);
                  onTabChange?.(tab.id as any);
                }}
                className={`px-4 py-2 rounded-lg font-bold text-sm ${tab.width} transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-teal-50 text-teal-600 border-b-2 border-teal-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default CommunityHeaderMobile;
