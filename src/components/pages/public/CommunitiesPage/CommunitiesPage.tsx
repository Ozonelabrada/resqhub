import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCommunities } from '@/hooks/useCommunities';
import { Card, Button, Spinner, Input, Badge } from '@/components/ui';
import { Users, Search, Plus, MapPin, ArrowRight } from 'lucide-react';
import { CreateCommunityModal } from '@/components/modals';

const CommunitiesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { communities, loading, refresh } = useCommunities();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {t('common.communities', 'Communities')}
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Join local groups to stay updated and help others in your area.
          </p>
        </div>

        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold h-12 px-6 rounded-2xl shadow-lg shadow-teal-100 transition-all flex items-center gap-2 self-start md:self-center"
        >
          <Plus className="w-5 h-5" />
          <span>{t('communities.create', 'Create Community')}</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-10 max-w-2xl">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
          <div className="relative flex items-center bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden px-4">
            <Search className="text-teal-600 w-5 h-5" />
            <Input 
              placeholder={t('communities.search_placeholder', 'Find a community by name or location...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none focus-visible:ring-0 h-14 text-slate-800 font-medium bg-transparent"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-500 font-medium">Loading communities...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community) => (
            <Card 
              key={community.id}
              className="group border border-slate-100 rounded-[2rem] overflow-hidden bg-white hover:shadow-2xl hover:shadow-teal-100/30 transition-all duration-500 cursor-pointer"
              onClick={() => navigate(`/community/${community.id}`)}
            >
              <div className="h-40 bg-gradient-to-br from-teal-500 to-emerald-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                {community.tagline && (
                  <Badge className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border-white/30 text-white font-black uppercase text-[10px] tracking-widest px-3 py-1">
                    {community.tagline}
                  </Badge>
                )}
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
              </div>
              
              <div className="p-8">
                <div className="flex items-center gap-2 text-teal-600 mb-3">
                  <MapPin size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">{community.location || 'Global Community'}</span>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">
                  {community.name}
                </h3>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2 font-medium">
                  {community.description || 'No description available for this community.'}
                </p>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Users size={16} />
                    <span className="text-sm font-bold">{community.membersCount || 0} Members</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-teal-600 font-black text-sm group-hover:gap-2 transition-all">
                    <span>Explore</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredCommunities.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No communities found</h3>
              <p className="text-slate-500">Try adjusting your search query or start your own community.</p>
            </div>
          )}
        </div>
      )}

      <CreateCommunityModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refresh();
        }}
      />
    </div>
  );
};

export default CommunitiesPage;
