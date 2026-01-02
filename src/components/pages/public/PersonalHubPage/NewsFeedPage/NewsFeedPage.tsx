import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Calendar } from 'primereact/calendar';
import { Slider } from 'primereact/slider';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { Chip } from 'primereact/chip';
import { useNewsFeed } from '../../../../../hooks/useNewsFeed';
import { NewsFeed, type NewsFeedItem } from '../personalHub/NewsFeed';

const NewsFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const { items: newsFeedItems, loading: newsFeedLoading, hasMore: newsFeedHasMore, loadMore: loadMoreNewsFeed } = useNewsFeed();
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
      if (Math.random() > 0.8) {
        setNewPostsCount(prev => prev + 1);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredItems = newsFeedItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'lost') return item.status === 'lost';
    if (filter === 'found') return item.status === 'found';
    if (filter === 'reunited') return item.status === 'reunited';
    // For myarea, myposts, saved - would need user data, placeholder
    return true;
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
    // Simulate loading new posts
    setNewPostsCount(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemClick = (item: NewsFeedItem) => {
    // Navigate to item details page (you can implement this later)
    console.log('Item clicked:', item);
  };

  const handleContactClick = (item: NewsFeedItem) => {
    // Handle contact functionality (you can implement this later)
    console.log('Contact clicked:', item);
  };

  const handleWatchClick = (item: NewsFeedItem) => {
    // Handle watch functionality (you can implement this later)
    console.log('Watch clicked:', item);
  };

  const handleProfileClick = (userId: string) => {
    // Navigate to user's personal hub
    navigate(`/hub?user=${userId}`);
  };

  const handleCommentClick = (item: NewsFeedItem) => {
    // Handle comment functionality
    console.log('Comment clicked:', item);
  };

  const handleShareClick = (item: NewsFeedItem) => {
    // Handle share functionality
    console.log('Share clicked:', item);
  };

  // Mock data for sidebar widgets
  const communityStats = {
    totalItems: 1247,
    activeSearches: 89,
    reunitedToday: 12,
    newPostsToday: 34
  };

  const trendingCategories = [
    { name: 'Electronics', count: 45, icon: 'pi pi-mobile' },
    { name: 'Keys', count: 32, icon: 'pi pi-key' },
    { name: 'Pets', count: 28, icon: 'pi pi-heart' },
    { name: 'Bags', count: 21, icon: 'pi pi-briefcase' },
    { name: 'Jewelry', count: 18, icon: 'pi pi-circle' }
  ];

  const recentActivity = [
    { type: 'reunited', message: 'Golden Retriever reunited with owner', time: '2h ago', icon: 'pi pi-heart-fill' },
    { type: 'found', message: 'iPhone found at Central Park', time: '4h ago', icon: 'pi pi-mobile' },
    { type: 'lost', message: 'Wedding ring lost at beach', time: '6h ago', icon: 'pi pi-circle' },
    { type: 'found', message: 'Keys found at Union Square', time: '8h ago', icon: 'pi pi-key' }
  ];

  const emergencyContacts = [
    { name: 'NYPD Lost & Found', phone: '(212) 123-4567', type: 'Police' },
    { name: 'ASPCA', phone: '(212) 876-7700', type: 'Animal Control' },
    { name: 'MTA Lost & Found', phone: '(212) 638-7622', type: 'Transit' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes slide-down {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .sidebar-sticky {
          position: sticky;
          top: 2rem;
          height: fit-content;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Community Feed</h1>
              <p className="text-gray-600">Discover lost and found items in your community</p>
            </div>
            <Button
              label="My Hub"
              icon="pi pi-home"
              className="p-button-outlined"
              onClick={() => navigate('/hub')}
            />
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Feed - 3 columns */}
          <div className="lg:col-span-3">
            {/* New Posts Banner */}
            {newPostsCount > 0 && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between animate-slide-down">
                <span className="text-blue-800 font-medium">
                  {newPostsCount} new {newPostsCount === 1 ? 'item' : 'items'} in your area!
                </span>
                <Button label="View" className="p-button-sm p-button-primary" onClick={loadNewPosts} />
              </div>
            )}

            {/* Quick Filter Bar */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 sticky top-0 z-40 bg-white/80 backdrop-blur-md mb-4 font-color-slate-700 color-red-700">
              {[
                { key: 'all', label: 'All Posts' },
                { key: 'lost', label: 'Lost Items' },
                { key: 'found', label: 'Found Items' },
                { key: 'reunited', label: 'Reunited Stories' },
                { key: 'myarea', label: 'My Area' },
                { key: 'myposts', label: 'My Posts' },
                { key: 'saved', label: 'Saved Items' }
              ].map((f) => (
                <Button
                  key={f.key}
                  label={f.label}
                  onClick={() => setFilter(f.key as any)}
                  className={`p-button-sm rounded-full capitalize px-5 border-none shadow-sm whitespace-nowrap transition-all duration-300 ${filter === f.key ? 'bg-slate-900 text-red-700 scale-105' : 'bg-gray text-slate-600 hover:bg-slate-100'}`}
                />
              ))}
              <Button
                label="Filters"
                icon="pi pi-filter"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`p-button-sm rounded-full px-5 border-none shadow-sm transition-all duration-300 ${showAdvancedFilters ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
              />
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <Card className="mb-6 animate-slide-down">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <Calendar
                      value={dateRange}
                      onChange={(e) => setDateRange(e.value as Date[])}
                      selectionMode="range"
                      placeholder="Select dates"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Distance: {distance}km</label>
                    <Slider
                      value={distance}
                      onChange={(e) => setDistance(e.value as number)}
                      min={1}
                      max={50}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                    <MultiSelect
                      value={selectedCategories}
                      options={categories}
                      onChange={(e) => setSelectedCategories(e.value)}
                      placeholder="Select categories"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <Dropdown
                      value={sortBy}
                      options={sortOptions}
                      onChange={(e) => setSortBy(e.value)}
                      placeholder="Sort by"
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button label="Clear All" className="p-button-text p-button-sm" onClick={clearFilters} />
                </div>
              </Card>
            )}

            {newsFeedLoading && filteredItems.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <ProgressSpinner />
              </div>
            ) : (
              <NewsFeed
                items={filteredItems}
                loading={newsFeedLoading}
                hasMore={newsFeedHasMore}
                onLoadMore={loadMoreNewsFeed}
                onItemClick={handleItemClick}
                onContactClick={handleContactClick}
                onWatchClick={handleWatchClick}
                onProfileClick={handleProfileClick}
                onCommentClick={handleCommentClick}
                onShareClick={handleShareClick}
              />
            )}

            {filteredItems.length === 0 && !newsFeedLoading && (
              <Card className="text-center py-12">
                <div className="text-gray-500">
                  <i className="pi pi-search text-4xl mb-4"></i>
                  <h3 className="text-lg font-semibold mb-2">No items found</h3>
                  <p>Try adjusting your filters or be the first to post in your area!</p>
                  <Button label="Post an Item" className="mt-4" />
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Community Stats Widget */}
            <Card className="sidebar-sticky">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <i className="pi pi-chart-bar mr-2 text-blue-600"></i>
                Community Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Items</span>
                  <Badge value={communityStats.totalItems.toString()} severity="info" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Searches</span>
                  <Badge value={communityStats.activeSearches.toString()} severity="warning" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Reunited Today</span>
                  <Badge value={communityStats.reunitedToday.toString()} severity="success" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Posts Today</span>
                  <Badge value={communityStats.newPostsToday.toString()} severity="info" />
                </div>
              </div>
            </Card>

            {/* Quick Actions Widget */}
            <Card className="sidebar-sticky">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <i className="pi pi-bolt mr-2 text-green-600"></i>
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button
                  label="Report Lost Item"
                  icon="pi pi-plus"
                  className="w-full p-button-sm p-button-primary"
                  onClick={() => navigate('/report-lost')}
                />
                <Button
                  label="Report Found Item"
                  icon="pi pi-plus"
                  className="w-full p-button-sm p-button-success"
                  onClick={() => navigate('/report-found')}
                />
                <Button
                  label="Search Items"
                  icon="pi pi-search"
                  className="w-full p-button-sm p-button-outlined"
                  onClick={() => navigate('/search')}
                />
                <Button
                  label="My Reports"
                  icon="pi pi-list"
                  className="w-full p-button-sm p-button-outlined"
                  onClick={() => navigate('/my-reports')}
                />
              </div>
            </Card>

            {/* Trending Categories Widget */}
            <Card className="sidebar-sticky">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <i className="pi pi-fire mr-2 text-orange-600"></i>
                Trending Categories
              </h3>
              <div className="space-y-2">
                {trendingCategories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <div className="flex items-center">
                      <i className={`${category.icon} mr-2 text-gray-600`}></i>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <Chip label={category.count.toString()} className="text-xs" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Activity Widget */}
            <Card className="sidebar-sticky">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <i className="pi pi-clock mr-2 text-purple-600"></i>
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <i className={`${activity.icon} mt-1 text-sm ${
                      activity.type === 'reunited' ? 'text-green-600' :
                      activity.type === 'found' ? 'text-blue-600' : 'text-red-600'
                    }`}></i>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Emergency Contacts Widget */}
            <Card className="sidebar-sticky">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <i className="pi pi-phone mr-2 text-red-600"></i>
                Emergency Contacts
              </h3>
              <div className="space-y-2">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="p-2 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{contact.name}</p>
                        <p className="text-xs text-gray-600">{contact.type}</p>
                      </div>
                      <Button
                        icon="pi pi-phone"
                        className="p-button-rounded p-button-sm p-button-outlined"
                        onClick={() => window.open(`tel:${contact.phone}`)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{contact.phone}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Weather/Location Widget */}
            <Card className="sidebar-sticky">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <i className="pi pi-sun mr-2 text-yellow-600"></i>
                Local Weather
              </h3>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <i className="pi pi-sun text-3xl text-yellow-500"></i>
                  <span className="ml-2 text-2xl font-bold">72°F</span>
                </div>
                <p className="text-sm text-gray-600">Sunny</p>
                <p className="text-xs text-gray-500">New York, NY</p>
                <div className="mt-3 text-xs text-gray-600">
                  <p>Good weather for outdoor searches!</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsFeedPage;