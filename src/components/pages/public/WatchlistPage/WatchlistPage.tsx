import React, { useState } from 'react';
import { 
  Heart, 
  Search, 
  Trash2, 
  AlertCircle
} from 'lucide-react';
import { 
  Button, 
  Input, 
  Badge,
  Spinner,
  ItemCard,
  Select
} from '../../../../components/ui';
import { useWatchList } from '../../../../hooks/useWatchList';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, loading, hasMore, loadMore } = useWatchList();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || item.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'similarity') return b.similarity - a.similarity;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  const handleRemoveItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, this would call a service to remove the item
    console.log('Remove item:', id);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/item/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <nav className="flex mb-4" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm font-medium text-slate-500">
                  <li>
                    <button onClick={() => navigate('/')} className="hover:text-teal-600 transition-colors">Home</button>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-900">Watchlist</span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                <Heart className="text-rose-500 fill-rose-500" size={32} />
                My Watchlist
              </h1>
              <p className="mt-2 text-slate-600 font-medium">
                Keep track of reports you've saved. We'll notify you of any updates or potential matches.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="rounded-2xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                onClick={() => navigate('/hub')}
              >
                Browse More Reports
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search in watchlist..." 
              className="pl-11 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center gap-2 mr-4 border-r border-slate-100 pr-4">
               <span className="text-sm font-bold text-slate-500 whitespace-nowrap">Sort by:</span>
               <div className="w-40">
                  <Select
                    options={[
                      { value: 'newest', label: 'Recently Added' },
                      { value: 'oldest', label: 'Oldest' },
                      { value: 'similarity', label: 'Best Match' },
                      { value: 'title', label: 'Title (A-Z)' },
                    ]}
                    value={sortBy}
                    onChange={(val) => setSortBy(val)}
                    fullWidth={false}
                    className="h-10 rounded-xl"
                  />
               </div>
            </div>

            <Button 
              variant={filterType === 'all' ? 'primary' : 'ghost'}
              size="sm"
              className={cn(
                "rounded-xl font-bold px-4",
                filterType === 'all' ? "bg-teal-600 hover:bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100"
              )}
              onClick={() => setFilterType('all')}
            >
              All Items
            </Button>
            <Button 
              variant={filterType === 'lost' ? 'primary' : 'ghost'}
              size="sm"
              className={cn(
                "rounded-xl font-bold px-4",
                filterType === 'lost' ? "bg-rose-500 hover:bg-rose-600 text-white" : "text-slate-600 hover:bg-slate-100"
              )}
              onClick={() => setFilterType('lost')}
            >
              Lost
            </Button>
            <Button 
              variant={filterType === 'found' ? 'primary' : 'ghost'}
              size="sm"
              className={cn(
                "rounded-xl font-bold px-4",
                filterType === 'found' ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
              )}
              onClick={() => setFilterType('found')}
            >
              Found
            </Button>
          </div>
        </div>

        {/* List of Items */}
        {loading && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 border-dashed">
            <Spinner size="lg" className="text-teal-600" />
            <p className="mt-4 text-slate-500 font-bold">Loading your saved items...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="group relative">
                <ItemCard
                  title={item.title}
                  location={item.location}
                  date={item.date ? new Date(item.date).toLocaleDateString() : undefined}
                  status={item.type.toUpperCase()}
                  onClick={() => handleViewDetails(item.id)}
                  className="h-full"
                />
                <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-10 w-10 p-0 rounded-full bg-white/90 backdrop-blur shadow-md text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                    onClick={(e) => handleRemoveItem(item.id, e)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
                {item.similarity > 0 && (
                  <div className="absolute bottom-28 left-4 z-10">
                    <Badge variant="success" className="bg-teal-600 hover:bg-teal-600 border-none text-white shadow-lg">
                      {item.similarity}% Match
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 border-dashed">
            <div className="p-6 bg-slate-50 rounded-full mb-4">
              <Heart size={48} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Your watchlist is empty</h3>
            <p className="text-slate-500 mt-2 max-w-sm text-center font-medium">
              Start following reports that interest you to see them here and get notified of updates.
            </p>
            <Button 
              className="mt-8 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 shadow-lg shadow-teal-100 transition-all hover:-translate-y-1"
              onClick={() => navigate('/hub')}
            >
              Explore Hub
            </Button>
          </div>
        )}

        {/* Load More */}
        {hasMore && filteredItems.length > 0 && (
          <div className="mt-12 text-center">
            <Button 
              onClick={loadMore} 
              disabled={loading}
              variant="outline"
              className="rounded-2xl border-slate-200 px-10 py-6 font-bold text-slate-700 hover:bg-white hover:text-teal-600 transition-all"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Loading...
                </>
              ) : 'Load More Saved Items'}
            </Button>
          </div>
        )}

        {/* Feature info */}
        <div className="mt-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="bg-teal-500/10 p-4 rounded-3xl backdrop-blur-sm border border-teal-500/20">
              <AlertCircle size={40} className="text-teal-400" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-2xl font-bold">Stay Updated with Watchlist</h4>
              <p className="text-slate-300 mt-2 text-lg">
                We're working on a feature that will automatically notify you via email and push notifications when an item you're watching has a potential match found by our AI.
              </p>
            </div>
            <Button className="rounded-2xl bg-white text-slate-900 font-bold px-8 py-6 hover:bg-slate-100 transition-colors shrink-0">
              Notification Settings
            </Button>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default WatchlistPage;
