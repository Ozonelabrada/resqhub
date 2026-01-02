import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Badge } from 'primereact/badge';
import { Chip } from 'primereact/chip';
import { Image } from 'primereact/image';
import type { UserReport } from '../../../../types/personalHub';

export interface NewsFeedItem extends UserReport {
  user: {
    id: string;
    fullName: string;
    username: string;
    profilePicture?: string;
  };
  timeAgo: string;
}

interface NewsFeedProps {
  items: NewsFeedItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onItemClick?: (item: NewsFeedItem) => void;
  onContactClick?: (item: NewsFeedItem) => void;
  onWatchClick?: (item: NewsFeedItem) => void;
  onProfileClick?: (userId: string) => void;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({
  items,
  loading,
  hasMore,
  onLoadMore,
  onItemClick,
  onContactClick,
  onWatchClick,
  onProfileClick
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const formatLocation = (location: string) => {
    return location.length > 30 ? `${location.substring(0, 30)}...` : location;
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
          {/* Header with user info */}
          <div className="flex items-start gap-3 mb-3">
            <Avatar
              image={item.user.profilePicture}
              icon={!item.user.profilePicture ? "pi pi-user" : undefined}
              size="large"
              shape="circle"
              className="border-2 border-white shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onProfileClick?.(item.user.id)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4
                  className="font-semibold text-gray-900 m-0 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => onProfileClick?.(item.user.id)}
                >
                  {item.user.fullName}
                </h4>
                <Badge
                  value="LOST"
                  severity="danger"
                  className="text-xs px-2 py-1"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <i className="pi pi-clock"></i>
                <span>{item.timeAgo}</span>
                <span>•</span>
                <i className="pi pi-map-marker"></i>
                <span>{formatLocation(item.location)}</span>
              </div>
            </div>
          </div>

          {/* Item details */}
          <div className="mb-3">
            <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>

            <div className="flex flex-wrap gap-2 mb-3">
              <Chip
                label={item.category}
                className="bg-blue-100 text-blue-800 text-xs"
              />
              <Chip
                label={item.condition.toUpperCase()}
                className="bg-green-100 text-green-800 text-xs"
              />
              <Chip
                label={`${item.views} views`}
                className="bg-gray-100 text-gray-700 text-xs"
              />
            </div>

            <p className="text-gray-700 mb-3">
              {expandedItems.has(item.id)
                ? item.description
                : item.description.length > 150
                  ? `${item.description.substring(0, 150)}...`
                  : item.description
              }
              {item.description.length > 150 && (
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="text-blue-600 hover:text-blue-800 ml-1 font-medium"
                >
                  {expandedItems.has(item.id) ? 'Show less' : 'Read more'}
                </button>
              )}
            </p>

            {/* Additional details */}
            {item.identifyingFeatures && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3">
                <div className="flex items-start gap-2">
                  <i className="pi pi-info-circle text-yellow-600 mt-1"></i>
                  <div>
                    <p className="text-sm font-medium text-yellow-800 mb-1">Identifying Features:</p>
                    <p className="text-sm text-yellow-700">{item.identifyingFeatures}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reward info */}
            {item.reward.amount > 0 && (
              <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-3">
                <div className="flex items-center gap-2">
                  <i className="pi pi-dollar text-green-600"></i>
                  <span className="font-semibold text-green-800">
                    Reward: ${item.reward.amount}
                  </span>
                  {item.reward.description && (
                    <span className="text-sm text-green-700">- {item.reward.description}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Images */}
          {item.images && item.images.length > 0 && (
            <div className="mb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {item.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={image}
                      alt={`${item.title} - Image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer"
                      preview
                    />
                    {item.images.length > 4 && index === 3 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          +{item.images.length - 4} more
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <Button
                icon="pi pi-eye"
                label="View Details"
                className="p-button-text p-button-sm"
                onClick={() => onItemClick?.(item)}
              />
              <Button
                icon="pi pi-phone"
                label="Contact"
                className="p-button-text p-button-sm"
                onClick={() => onContactClick?.(item)}
              />
            </div>
            <Button
              icon="pi pi-bookmark"
              label="Watch"
              className="p-button-outlined p-button-sm"
              onClick={() => onWatchClick?.(item)}
            />
          </div>
        </Card>
      ))}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-4">
          <ProgressSpinner style={{ width: '40px', height: '40px' }} />
        </div>
      )}

      {/* Load more button */}
      {hasMore && !loading && (
        <div className="text-center py-4">
          <Button
            label="Load More Items"
            icon="pi pi-plus"
            className="p-button-outlined"
            onClick={onLoadMore}
          />
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="text-center py-8">
          <i className="pi pi-search text-gray-300 text-4xl mb-4 block"></i>
          <h3 className="text-gray-500 mb-2">No lost items found</h3>
          <p className="text-gray-400">Check back later for new lost item reports.</p>
        </div>
      )}
    </div>
  );
};