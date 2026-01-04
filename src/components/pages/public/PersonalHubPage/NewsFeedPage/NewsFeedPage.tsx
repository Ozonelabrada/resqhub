import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Calendar } from 'primereact/calendar';
import { Slider } from 'primereact/slider';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { Badge } from 'primereact/badge';
import { useNewsFeed } from '../../../../../hooks/useNewsFeed';
import { NewsFeed } from '../personalHub/NewsFeed';

const NewsFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const { items: newsFeedItems, loading: newsFeedLoading, error: newsFeedError, hasMore: newsFeedHasMore, loadMore: loadMoreNewsFeed, refetch: refetchNewsFeed } = useNewsFeed();
  
  const [filter, setFilter] = useState<'all' | 'lost' | 'found' | 'reunited' | 'myarea' | 'myposts' | 'saved'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState<Date[]>([]);
  const [distance, setDistance] = useState<number>(10);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'relevant' | 'distance' | 'popular'>('recent');
  const [newPostsCount, setNewPostsCount] = useState(0);

  const categories = [
    { label: 'Electronics', value: 'electronics' },
    { label: 'Personal Items', value: 'personal' },
    { label: 'Documents', value: 'documents' },
    { label: 'Clothing', value: 'clothing' },
    { label: 'Keys', value: 'keys' },
    { label: 'Bags', value: 'bags' }
  ];

  const sortOptions = [
    { label: 'Recent', value: 'recent' },
    { label: 'Most Relevant', value: 'relevant' },
    { label: 'Distance', value: 'distance' },
    { label: 'Popular', value: 'popular' }
  ];

  // Simulate new posts detection
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) setNewPostsCount(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredItems = newsFeedItems.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  }).filter(item => {
    if (selectedCategories.length > 0) {
      return selectedCategories.includes(item.category.toLowerCase());
    }
    return true;
  });

  const clearFilters = () => {
    setFilter('all');
    setDateRange([]);
    setDistance(10);
    setSelectedCategories([]);
    setSortBy('recent');
    setShowAdvancedFilters(false);
  };

  const loadNewPosts = () => {
    setNewPostsCount(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mock data for sidebar
  const trendingCategories = [
    { name: 'Electronics', count: 45, icon: 'pi pi-mobile' },
    { name: 'Keys', count: 32, icon: 'pi pi-key' },
    { name: 'Pets', count: 28, icon: 'pi pi-heart' }
  ];

  const recentActivity = [
    { type: 'reunited', message: 'Golden Retriever reunited', time: '2h ago', icon: 'pi pi-heart-fill' },
    { type: 'found', message: 'iPhone found at Central Park', time: '4h ago', icon: 'pi pi-mobile' }
  ];

  const emergencyContacts = [
    { name: 'NYPD Lost & Found', phone: '(212) 123-4567' },
    { name: 'MTA Lost & Found', phone: '(212) 638-7622' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @keyframes slide-down {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .sidebar-sticky { position: sticky; top: 1.5rem; height: fit-content; }
      `}</style>

      {/* Header */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Community Feed</h1>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">Real-time local updates</p>
          </div>
          <Button 
            label="My Hub" 
            icon="pi pi-home" 
            className="p-button-rounded p-button-text p-button-secondary"
            onClick={() => navigate('/hub')} 
          />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Feed - 9 Columns */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* New Posts Banner */}
            {newPostsCount > 0 && (
              <button 
                onClick={loadNewPosts}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-lg transition-all animate-slide-down font-semibold text-sm"
              >
                {newPostsCount} new {newPostsCount === 1 ? 'update' : 'updates'} available — View Now
              </button>
            )}

            {/* Quick Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              {[
                { key: 'all', label: 'All Posts' },
                { key: 'lost', label: 'Lost' },
                { key: 'found', label: 'Found' },
                { key: 'reunited', label: 'Reunited' },
                { key: 'saved', label: 'Saved' }
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as any)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
                    filter === f.key 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <Button
                icon="pi pi-sliders-h"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`p-button-rounded p-button-outlined ml-auto ${showAdvancedFilters ? 'bg-slate-100' : ''}`}
              />
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-slide-down space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Date Range</label>
                    <Calendar value={dateRange} onChange={(e) => setDateRange(e.value as Date[])} selectionMode="range" placeholder="Select dates" className="w-full" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Distance ({distance}km)</label>
                    <Slider value={distance} onChange={(e) => setDistance(e.value as number)} min={1} max={50} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Categories</label>
                    <MultiSelect value={selectedCategories} options={categories} onChange={(e) => setSelectedCategories(e.value)} placeholder="All" className="w-full" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Sort By</label>
                    <Dropdown value={sortBy} options={sortOptions} onChange={(e) => setSortBy(e.value)} className="w-full" />
                  </div>
                </div>
                <div className="flex justify-end pt-2 border-t">
                  <Button label="Reset Filters" className="p-button-text p-button-sm text-red-500" onClick={clearFilters} />
                </div>
              </div>
            )}

            {/* News Feed List */}
            {newsFeedLoading && filteredItems.length === 0 ? (
              <div className="flex justify-center py-20"><ProgressSpinner /></div>
            ) : newsFeedError ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-red-100">
                <i className="pi pi-exclamation-circle text-red-500 text-3xl mb-3"></i>
                <h3 className="text-lg font-bold">Unable to load feed</h3>
                <Button label="Try Again" className="mt-4 p-button-sm" onClick={refetchNewsFeed} />
              </div>
            ) : (
              <NewsFeed
                items={filteredItems}
                loading={newsFeedLoading}
                hasMore={newsFeedHasMore}
                onLoadMore={loadMoreNewsFeed}
                onItemClick={(item) => console.log(item)}
              />
            )}
          </div>

          {/* Sidebar - 3 Columns */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="sidebar-sticky space-y-6">
              
              {/* Primary Actions Card */}
              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
                <h3 className="font-bold text-lg mb-4">Have an update?</h3>
                <div className="space-y-3">
                  <Button 
                    label="Report Lost" 
                    icon="pi pi-plus" 
                    className="w-full p-button-danger border-none font-bold" 
                    onClick={() => navigate('/report-lost')}
                  />
                  <Button 
                    label="Report Found" 
                    icon="pi pi-check" 
                    className="w-full p-button-success border-none font-bold" 
                    onClick={() => navigate('/report-found')}
                  />
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center">
                  <i className="pi pi-chart-line mr-2 text-blue-500"></i> Local Activity
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl text-center">
                    <p className="text-2xl font-black text-slate-900">89</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Searching</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl text-center">
                    <p className="text-2xl font-black text-emerald-600">12</p>
                    <p className="text-[10px] uppercase font-bold text-emerald-400">Reunited</p>
                  </div>
                </div>
              </div>

              {/* Trending List */}
              <div className="px-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Trending Near You</h4>
                <div className="space-y-4">
                  {trendingCategories.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                          <i className={cat.icon}></i>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{cat.name}</span>
                      </div>
                      <Badge value={cat.count} severity="info" className="bg-slate-100 text-slate-600 border-none" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Help Numbers */}
              <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                <h4 className="text-xs font-black text-red-400 uppercase tracking-widest mb-3">Official Help</h4>
                {emergencyContacts.map((contact, i) => (
                  <div key={i} className="flex justify-between items-center mb-2 last:mb-0">
                    <span className="text-[11px] font-bold text-slate-600">{contact.name}</span>
                    <a href={`tel:${contact.phone}`} className="text-[11px] font-black text-red-600 hover:underline">{contact.phone}</a>
                  </div>
                ))}
              </div>
              
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default NewsFeedPage;