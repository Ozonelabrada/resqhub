import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCommunities } from '@/hooks/useCommunities';
import { Card, Button, Spinner, Input, Badge } from '@/components/ui';
import { Users, Search, Plus, MapPin, ArrowRight } from 'lucide-react';
import { CreateCommunityModal } from '@/components/modals';

export const CommunitiesContainer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { communities, loading, refresh } = useCommunities();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && communities.length === 0) {
    return (
      <Card className="flex h-[calc(100vh-140px)] items-center justify-center border-none shadow-xl rounded-[2.5rem] bg-white">
        <Spinner size="lg" className="text-teal-500" />
      </Card>
    );
  }

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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <Card 
                key={community.id}
                className="group border border-slate-100 rounded-[2rem] overflow-hidden bg-white hover:shadow-2xl hover:shadow-teal-100/30 transition-all duration-500 cursor-pointer"
                onClick={() => navigate(`/community/${community.id}`)}
              >
                <div className="h-32 bg-gradient-to-br from-teal-500 to-emerald-600 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                  {community.tagline && (
                    <Badge className="absolute top-3 right-3 bg-white/20 backdrop-blur-md border-white/30 text-white font-black uppercase text-[8px] tracking-widest px-2 py-0.5">
                      {community.tagline}
                    </Badge>
                  )}
                  <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-center gap-2 text-teal-600 mb-2">
                    <MapPin size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{community.location || 'Global'}</span>
                  </div>
                  
                  <h3 className="text-base font-black text-slate-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-1">
                    {community.name}
                  </h3>
                  
                  <p className="text-slate-500 text-[11px] leading-relaxed mb-4 line-clamp-2 font-medium">
                    {community.description || 'No description available.'}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users size={12} />
                      <span className="text-[11px] font-bold">{community.membersCount || 0} Members</span>
                    </div>
                    <ArrowRight size={16} className="text-teal-600 transform translate-x-0 group-hover:translate-x-1 transition-transform" />
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