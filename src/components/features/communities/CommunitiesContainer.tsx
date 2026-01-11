import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCommunities } from '@/hooks/useCommunities';
import { Card, Button, Spinner, Input, Badge } from '@/components/ui';
import { Users, Search, Plus, MapPin, ArrowRight, UserPlus } from 'lucide-react';
import { CreateCommunityModal } from '@/components/modals';
import { CommunityService } from '@/services/communityService';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export const CommunitiesContainer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { communities, loading, refresh } = useCommunities();
  const { isAuthenticated, openLoginModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [joiningId, setJoiningId] = useState<string | number | null>(null);

  const handleJoin = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    setJoiningId(id);
    try {
      const success = await CommunityService.joinCommunity(String(id));
      if (success) {
        refresh();
      }
    } finally {
      setJoiningId(null);
    }
  };

  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Card className="flex flex-col h-[calc(100vh-140px)] border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative">
      <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('common.communities', 'Communities')}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Join local groups to stay updated and help others in your area.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group w-64">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-gray-50 rounded-xl border border-transparent group-focus-within:bg-white group-focus-within:border-slate-100 transition-all overflow-hidden px-3">
              <Search className="text-slate-400 w-4 h-4" />
              <Input 
                placeholder={t('communities.search_placeholder', 'Search...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none focus-visible:ring-0 h-10 text-slate-800 text-sm font-medium bg-transparent"
              />
            </div>
          </div>

          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold h-10 px-4 rounded-xl shadow-lg shadow-teal-100 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('communities.create', 'Create')}</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" />
            <p className="mt-4 text-slate-500 font-medium">Loading communities...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6">
            {filteredCommunities.map((community, idx) => (
              <Card 
                key={community.id || (community as any)._id || idx}
                className="group border border-slate-100 rounded-[2rem] overflow-hidden bg-white hover:shadow-2xl hover:shadow-teal-100/30 transition-all duration-500 cursor-pointer flex flex-col h-full"
                onClick={() => navigate(`/community/${community.id || (community as any)._id}`)}
              >
                <div className="h-32 relative overflow-hidden shrink-0">
                  {community.banner || community.imageUrl ? (
                    <img src={community.banner || community.imageUrl || undefined} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600" />
                  )}
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                  
                  {isAuthenticated && community.isMember && (
                    <Badge className="absolute top-3 left-3 bg-emerald-500 text-white font-black uppercase text-[8px] tracking-widest px-2 py-0.5 border-none shadow-sm">
                      Joined
                    </Badge>
                  )}

                  {community.tagline && (
                    <Badge className="absolute top-3 right-3 bg-white/20 backdrop-blur-md border-white/30 text-white font-black uppercase text-[8px] tracking-widest px-2 py-0.5">
                      {community.tagline}
                    </Badge>
                  )}
                  <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-teal-600">
                      <MapPin size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{community.location || 'Local Community'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 mb-3">
                    {(community.logo || community.imageUrl) && (
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-50">
                        <img src={community.logo || community.imageUrl || undefined} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h3 className="text-base font-black text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2 leading-tight">
                      {community.name}
                    </h3>
                  </div>
                  
                  <p className="text-slate-500 text-[11px] leading-relaxed mb-6 line-clamp-3 font-medium flex-1">
                    {community.description || 'No description available for this community.'}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users size={12} />
                      <span className="text-[11px] font-bold text-slate-500">{community.memberCount || community.membersCount || 0} Members</span>
                    </div>
                    
                    {isAuthenticated && community.isMember ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-0 h-auto hover:bg-transparent text-teal-600 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all"
                      >
                        Visit Hub
                        <ArrowRight size={14} />
                      </Button>
                    ) : (
                      <Button 
                        onClick={(e) => handleJoin(e, community.id)}
                        disabled={joiningId === community.id}
                        size="sm"
                        className={cn(
                          "h-8 rounded-lg px-4 text-[10px] font-black uppercase tracking-widest transition-all",
                          "bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-100",
                          joiningId === community.id && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {joiningId === community.id ? (
                          <Spinner size="xs" className="border-white" />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <UserPlus size={12} strokeWidth={3} />
                            Request to Join
                          </div>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {filteredCommunities.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-slate-200 w-10 h-10" />
                </div>
                <h3 className="text-slate-400 font-bold text-xl">No communities found</h3>
                <p className="text-slate-400">Try a different search term or create your own community.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateCommunityModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refresh();
        }}
      />
    </Card>
  );
};