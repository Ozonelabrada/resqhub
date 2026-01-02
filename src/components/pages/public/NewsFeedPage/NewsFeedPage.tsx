import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useNewsFeed } from '../../../../hooks/useNewsFeed';
import { NewsFeed, type NewsFeedItem } from '../personalHub/NewsFeed';

const NewsFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const { items: newsFeedItems, loading: newsFeedLoading, hasMore: newsFeedHasMore, loadMore: loadMoreNewsFeed } = useNewsFeed();

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {newsFeedLoading && newsFeedItems.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <ProgressSpinner />
          </div>
        ) : (
          <NewsFeed
            items={newsFeedItems}
            loading={newsFeedLoading}
            hasMore={newsFeedHasMore}
            onLoadMore={loadMoreNewsFeed}
            onItemClick={handleItemClick}
            onContactClick={handleContactClick}
            onWatchClick={handleWatchClick}
            onProfileClick={handleProfileClick}
          />
        )}

        {newsFeedItems.length === 0 && !newsFeedLoading && (
          <Card className="text-center py-12">
            <div className="text-gray-500">
              <i className="pi pi-info-circle text-4xl mb-4"></i>
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p>Be the first to post a lost or found item in your community!</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NewsFeedPage;