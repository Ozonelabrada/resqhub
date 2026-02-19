import React from 'react';
import { ShieldCheck, ShieldAlert, Settings } from 'lucide-react';
import { Button } from '@/components/ui';
import type { CommunityTabType } from '@/components/pages/public/NewsFeedPage/components/NewsFeedSidebar';

interface CommunityHeaderWebProps {
  community: any;
  isAdmin: boolean;
  isMember: boolean;
  memberCount?: number;
  activeTab?: CommunityTabType;
  onTabChange?: (tab: CommunityTabType) => void;
  onSettingsClick: () => void;
  onModerationClick: () => void;
}

const CommunityHeaderWeb: React.FC<CommunityHeaderWebProps> = ({
  community,
  isAdmin,
  isMember,
  memberCount = 0,
  onSettingsClick,
  onModerationClick,
}) => {

  return (
    <div className="w-full relative shrink-0 z-30">
      <div className="h-72 bg-slate-900 relative overflow-visible text-white shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500 rounded-full -mr-64 -mt-64 blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500 rounded-full -ml-48 -mb-48 blur-[100px]"></div>
        </div>

        <div className="h-full w-full px-6 lg:px-8 flex items-end pb-16">
          <div className="flex items-end gap-10 w-full relative z-10">
            {/* Avatar */}
            <div className="flex w-48 h-48 rounded-[4rem] bg-white p-2 shadow-2xl z-20 mb-0 -mb-28 border-4 border-white overflow-hidden transition-transform hover:scale-105 duration-500">
              {community?.logo || community?.imageUrl ? (
                <img
                  src={community.logo || community.imageUrl}
                  alt={community.name}
                  className="w-full h-full rounded-[3.5rem] object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-[3.5rem] bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center text-7xl font-black text-white">
                  {community?.name?.charAt(0)}
                </div>
              )}
            </div>

            {/* Title & Admin Controls */}
            <div className="flex-1 text-left mb-4">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-6xl font-black text-white drop-shadow-md tracking-tight uppercase">
                  {community?.name}
                </h1>
                <ShieldCheck className="text-emerald-400 fill-emerald-400/10" size={40} />
              </div>

              <p className="text-teal-50 text-lg font-medium opacity-90 max-w-2xl line-clamp-1 mb-6">
                {community?.tagline}
              </p>

              {/* Admin/Member Controls */}
              <div className="flex items-end gap-3">
                {isAdmin && (
                  <>
                    <Button
                      onClick={onModerationClick}
                      className="bg-rose-500 hover:bg-rose-600 text-white h-14 w-14 rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-rose-500/20"
                      title="Moderation"
                    >
                      <ShieldAlert size={24} />
                    </Button>
                    <Button
                      onClick={onSettingsClick}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 h-14 w-14 rounded-2xl flex items-center justify-center transition-all"
                    >
                      <Settings size={24} />
                    </Button>
                  </>
                )}
                {isMember && (
                  <Button
                    disabled
                    className="bg-emerald-50 text-emerald-600 border border-emerald-100 h-14 rounded-2xl px-10 font-black cursor-default opacity-100"
                  >
                    Joined
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHeaderWeb;
