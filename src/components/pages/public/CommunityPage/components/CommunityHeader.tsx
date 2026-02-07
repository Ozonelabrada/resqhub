import React from 'react';
import { ShieldCheck, ShieldAlert, Settings } from 'lucide-react';
import { Button } from '@/components/ui';

interface CommunityHeaderProps {
  community: any;
  isAdmin: boolean;
  isMember: boolean;
  onSettingsClick: () => void;
  onModerationClick: () => void;
}

const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  community,
  isAdmin,
  isMember,
  onSettingsClick,
  onModerationClick,
}) => {
  return (
    <div className="w-full relative shrink-0 z-30">
      <div className="h-64 md:h-72 bg-slate-900 relative overflow-visible text-white shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500 rounded-full -mr-64 -mt-64 blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500 rounded-full -ml-48 -mb-48 blur-[100px]"></div>
        </div>

        <div className="h-full w-full px-4 md:px-6 lg:px-8 flex items-end pb-12 md:pb-16">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 w-full relative z-10">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] md:rounded-[4rem] bg-white p-2 shadow-2xl z-20 -mb-20 md:-mb-28 border-4 border-white overflow-hidden transition-transform hover:scale-105 duration-500">
              {community?.logo || community?.imageUrl ? (
                <img
                  src={community.logo || community.imageUrl}
                  alt={community.name}
                  className="w-full h-full rounded-[2.2rem] md:rounded-[3.5rem] object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-[2.2rem] md:rounded-[3.5rem] bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center text-4xl md:text-7xl font-black text-white">
                  {community?.name?.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left mb-2 md:mb-4">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-md tracking-tight uppercase">
                  {community?.name}
                </h1>
                <ShieldCheck className="text-emerald-400 fill-emerald-400/10 hidden md:block" size={40} />
              </div>
              <p className="text-teal-50 text-lg md:text-xl font-medium opacity-90 max-w-2xl line-clamp-1">
                {community?.tagline}
              </p>
            </div>

            <div className="mb-4 md:mb-6 flex gap-3">
              <div className="flex gap-2">
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
                  <div className="flex gap-3">
                    <Button
                      disabled
                      className="bg-emerald-50 text-emerald-600 border border-emerald-100 h-14 rounded-2xl px-10 font-black cursor-default opacity-100"
                    >
                      Joined
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHeader;
