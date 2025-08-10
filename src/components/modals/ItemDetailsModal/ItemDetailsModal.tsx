import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Divider } from 'primereact/divider';
import { Card } from 'primereact/card';
import { Timeline } from 'primereact/timeline';
import { Avatar } from 'primereact/avatar';
import CommentSection from '../../features/comments/CommentSection';

export interface ItemDetailsModalProps {
  visible: boolean;
  onHide: () => void;
  item: {
    id: number;
    title: string;
    description: string;
    category: string;
    location: string;
    date: string;
    images: string[];
    status: 'active' | 'claimed' | 'returned';
    type: 'lost' | 'found';
    contactInfo?: {
      name: string;
      phone?: string;
      email?: string;
    };
    ownerId: number;
  } | null;
}

const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({ visible, onHide, item }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);

  if (!item) return null;

  const handleContactOwner = () => {
    const isAuthenticated = localStorage.getItem('publicUserToken');
    if (!isAuthenticated) {
      localStorage.setItem('intendedAction', 'contact');
      localStorage.setItem('returnPath', window.location.pathname);
      window.location.href = '/signup';
      return;
    }
    setShowContactInfo(true);
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'active': return 'info';
      case 'claimed': return 'warning';
      case 'returned': return 'success';
      default: return 'info';
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Simple timeline events
  const timelineEvents = [
    {
      status: 'Item Reported',
      date: item.date,
      icon: 'pi pi-flag',
      color: '#3b82f6'
    },
    {
      status: 'Under Investigation',
      date: new Date(new Date(item.date).getTime() + 2 * 60 * 60 * 1000).toISOString(),
      icon: 'pi pi-search',
      color: '#f59e0b'
    }
  ];

  return (
    <Dialog
      header={item.title}
      visible={visible}
      onHide={onHide}
      style={{ width: '90vw', maxWidth: '800px' }}
      modal
      maximizable
    >
      <div className="p-3">
        {/* Header Info */}
        <div className="flex align-items-center gap-3 mb-4">
          <Badge 
            value={item.type.toUpperCase()} 
            severity={item.type === 'lost' ? 'danger' : 'success'}
          />
          <Badge 
            value={formatStatus(item.status)} 
            severity={getStatusSeverity(item.status)}
          />
          <span className="text-gray-500">•</span>
          <span className="text-gray-500">{item.category}</span>
        </div>

        {/* Image */}
        <div className="mb-4">
          <img
            src={item.images[activeImageIndex] || '/placeholder-image.jpg'}
            alt={item.title}
            className="w-full border-round"
            style={{ height: '300px', objectFit: 'cover' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNTAgMTIwSDE1OFYxMjhIMTY2VjEzNkgxNzRWMTQ0SDE4MlYxNTJIMTkwVjE2MEgxOThWMTY4SDIwNlYxNzZIMjE0VjE4NEgyMjJWMTkySDIzMFYyMDBIMjM4VjIwOEgyNDZWMjE2SDI1NFYyMjRIMjYyVjIzMkgyNzBWMjQwSDI3OFYyNDhIMjg2VjI1NkgyOTRWMjY0SDMwMlYyNzJIMzEwVjI4MEgzMThWMjg4SDMyNlYyOTZIMzM0VjMwNEgzNDJWMzEySDM1MFYzMjBIMzU4VjMyOEgzNjZWMzM2SDM3NFYzNDRIMzgyVjM1MkgzODBWMzQ0SDM3MlYzMzZIMzY0VjMyOEgzNTZWMzIwSDM0OFYzMTJIMzQwVjMwNEgzMzJWMjk2SDMyNFYyODhIMzE2VjI4MEgzMDhWMjcySDMwMFYyNjRIMjkyVjI1NkgyODRWMjQ4SDI3NlYyNDBIMjY4VjIzMkgyNjBWMjI0SDI1MlYyMTZIMjQ0VjIwOEgyMzZWMjAwSDIyOFYxOTJIMjIwVjE4NEgyMTJWMTc2SDIwNFYxNjhIMTk2VjE2MEgxODhWMTUySDI4MFYxNDRIMTcyVjEzNkgxNjRWMTI4SDE1NlYxMjBIMTUwWiIgZmlsbD0iI0M0QzRDNCIvPgo8L3N2Zz4K';
            }}
          />
          
          {item.images.length > 1 && (
            <div className="flex gap-2 justify-content-center mt-2">
              {item.images.map((_, index) => (
                <Button
                  key={index}
                  className={`p-button-rounded p-button-sm ${index === activeImageIndex ? 'p-button-primary' : 'p-button-outlined'}`}
                  style={{ width: '10px', height: '10px' }}
                  onClick={() => setActiveImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <h3 className="mb-2">Description</h3>
          <p className="text-gray-700 line-height-3">{item.description}</p>
        </div>

        {/* Details Grid */}
        <div className="grid mb-4">
          <div className="col-6">
            <div className="mb-3">
              <strong>Location:</strong>
              <div className="flex align-items-center gap-2 mt-1">
                <i className="pi pi-map-marker text-primary"></i>
                <span>{item.location}</span>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="mb-3">
              <strong>Date:</strong>
              <div className="flex align-items-center gap-2 mt-1">
                <i className="pi pi-calendar text-primary"></i>
                <span>{new Date(item.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="mb-3">
              <strong>Case ID:</strong>
              <div className="flex align-items-center gap-2 mt-1">
                <i className="pi pi-hashtag text-primary"></i>
                <span>#{item.id.toString().padStart(6, '0')}</span>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="mb-3">
              <strong>Status:</strong>
              <div className="mt-1">
                <Badge 
                  value={formatStatus(item.status)} 
                  severity={getStatusSeverity(item.status)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-4">
          <h3 className="mb-3">Timeline</h3>
          <Timeline 
            value={timelineEvents} 
            align="left"
            content={(event) => (
              <div>
                <div className="font-semibold">{event.status}</div>
                <div className="text-sm text-gray-500">
                  {new Date(event.date).toLocaleString()}
                </div>
              </div>
            )}
            marker={(event) => (
              <div 
                className="flex align-items-center justify-content-center text-white border-circle"
                style={{ 
                  backgroundColor: event.color,
                  width: '32px',
                  height: '32px'
                }}
              >
                <i className={event.icon}></i>
              </div>
            )}
          />
        </div>

        <Divider />

        {/* Contact Section */}
        <div className="text-center">
          <Button
            label={showContactInfo ? 'Hide Contact Info' : 'Contact Owner'}
            icon="pi pi-envelope"
            className="p-button-primary"
            onClick={handleContactOwner}
          />

          {showContactInfo && item.contactInfo && (
            <Card className="mt-3 bg-green-50">
              <div className="flex align-items-center gap-3 justify-content-center">
                <Avatar 
                  icon="pi pi-user" 
                  shape="circle" 
                  style={{ backgroundColor: '#10b981', color: 'white' }} 
                />
                <div className="text-left">
                  <div className="font-semibold">{item.contactInfo.name}</div>
                  {item.contactInfo.phone && (
                    <div className="text-sm">📞 {item.contactInfo.phone}</div>
                  )}
                  {item.contactInfo.email && (
                    <div className="text-sm">✉️ {item.contactInfo.email}</div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        <Divider className="my-4" />

        {/* Comments Section */}
        <div>
          <h3 className="mb-3">Community Comments</h3>
          <CommentSection 
            itemId={item.id}
            itemType={item.type}
            itemOwnerId={item.ownerId}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ItemDetailsModal;