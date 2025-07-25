import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Divider } from 'primereact/divider';
import { Chip } from 'primereact/chip';
import { Tag } from 'primereact/tag';
import { Avatar } from 'primereact/avatar';
import { Timeline } from 'primereact/timeline';

interface LostFoundItem {
  id: number;
  title: string;
  category: string;
  location: string;
  date: string;
  status: 'lost' | 'found' | 'matched';
  reportedBy: string;
  image?: string;
  description?: string;
  contactInfo?: string;
  reward?: string;
  timeReported?: string;
  specificLocation?: string;
  itemColor?: string;
  itemBrand?: string;
  itemSize?: string;
  matchedWith?: number;
}

interface ItemDetailsModalProps {
  item: LostFoundItem | null;
  visible: boolean;
  onHide: () => void;
  onContact: (item: LostFoundItem) => void;
  onMarkMatch?: (item: LostFoundItem) => void;
}

const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  visible,
  onHide,
  onContact,
  onMarkMatch
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!item) return null;

  const getStatusConfig = (status: string) => {
    const configs = {
      lost: { 
        severity: 'danger' as const, 
        icon: 'pi-minus-circle', 
        label: 'LOST ITEM',
        bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        color: '#dc2626',
        textColor: '#991b1b'
      },
      found: { 
        severity: 'warning' as const, 
        icon: 'pi-plus-circle', 
        label: 'FOUND ITEM',
        bg: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        color: '#d97706',
        textColor: '#92400e'
      },
      matched: { 
        severity: 'success' as const, 
        icon: 'pi-check-circle', 
        label: 'SUCCESSFULLY MATCHED',
        bg: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        color: '#059669',
        textColor: '#047857'
      }
    };
    return configs[status as keyof typeof configs];
  };

  const statusConfig = getStatusConfig(item.status);

  // Mock additional images for demonstration
  const itemImages = [
    item.image || '/api/placeholder/400/300',
    '/api/placeholder/400/300',
    '/api/placeholder/400/300'
  ].filter((img, index) => index === 0 || item.image); // Only show multiple if item has image

  // Timeline data for item history
  const timelineEvents = [
    {
      status: 'Reported',
      date: item.timeReported || item.date,
      icon: 'pi pi-plus',
      color: '#3B82F6',
      description: `Item reported as ${item.status} by ${item.reportedBy}`
    },
    ...(item.status === 'matched' ? [{
      status: 'Matched',
      date: '2025-07-25 10:30',
      icon: 'pi pi-check',
      color: '#10B981',
      description: `Successfully matched with report #${item.matchedWith}`
    }] : [])
  ];

  const headerContent = (
    <div className="flex align-items-start gap-4" style={{ padding: '0.5rem 0' }}>
      {/* Status Icon with Gradient Background */}
      <div 
        className="w-4rem h-4rem border-round-xl flex align-items-center justify-content-center shadow-2"
        style={{ background: statusConfig.bg }}
      >
        <i 
          className={`pi ${statusConfig.icon}`} 
          style={{ 
            fontSize: '2rem', 
            color: statusConfig.color,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }}
        ></i>
      </div>
      
      <div className="flex-1">
        <div className="flex align-items-center gap-3 mb-2">
          <h2 className="m-0 text-2xl font-bold text-gray-800">{item.title}</h2>
          <Tag 
            value={statusConfig.label} 
            severity={statusConfig.severity}
            className="font-semibold"
            style={{ fontSize: '0.75rem' }}
          />
        </div>
        
        {/* Quick Info Tags */}
        <div className="flex flex-wrap gap-2">
          <Chip 
            label={item.category} 
            icon="pi pi-tag"
            className="bg-blue-50 text-blue-700 border-blue-200"
            style={{ fontSize: '0.875rem' }}
          />
          <Chip 
            label={item.location} 
            icon="pi pi-map-marker"
            className="bg-purple-50 text-purple-700 border-purple-200"
            style={{ fontSize: '0.875rem' }}
          />
          <Chip 
            label={`ID: #${item.id.toString().padStart(4, '0')}`} 
            icon="pi pi-hashtag"
            className="bg-gray-50 text-gray-700 border-gray-200"
            style={{ fontSize: '0.875rem' }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Dialog
      header={headerContent}
      visible={visible}
      onHide={onHide}
      style={{ width: '95vw', maxWidth: '1000px' }}
      modal
      dismissableMask
      className="item-details-modal"
      contentClassName="p-0"
    >
      {/* REMOVED margin from grid to use full width */}
      <div className="grid" style={{ margin: '0', width: '100%' }}>
        {/* Left Column - Images and Gallery */}
        <div className="col-12 lg:col-5" style={{ padding: '1rem' }}>
          {/* Main Image */}
          <div className="mb-3">
            <div 
              className="w-full border-round-xl overflow-hidden bg-gray-50 shadow-3 relative"
              style={{ height: '300px' }}
            >
              {item.image ? (
                <>
                  <img 
                    src={itemImages[selectedImageIndex]} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Image overlay with status */}
                  <div className="absolute top-3 right-3">
                    <Badge 
                      value={statusConfig.label.split(' ')[0]} 
                      severity={statusConfig.severity}
                      className="shadow-2"
                    />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-column align-items-center justify-content-center text-gray-400">
                  <i className="pi pi-image mb-3" style={{ fontSize: '4rem' }}></i>
                  <span className="text-lg font-medium">No Image Available</span>
                  <span className="text-sm">Image pending upload</span>
                </div>
              )}
            </div>
          </div>

          {/* Image Thumbnails */}
          {item.image && itemImages.length > 1 && (
            <div className="flex gap-2 mb-4">
              {itemImages.map((img, index) => (
                <div
                  key={index}
                  className={`w-4rem h-3rem border-round overflow-hidden cursor-pointer transition-all duration-200 ${
                    selectedImageIndex === index 
                      ? 'border-3 border-primary shadow-2' 
                      : 'border-2 border-gray-300 hover:border-primary opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Quick Stats Cards - FULL WIDTH */}
          <div className="grid" style={{ margin: '0 -0.25rem' }}>
            <div className="col-6" style={{ padding: '0 0.25rem' }}>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 border-round-lg text-center border-1 border-blue-200 w-full">
                <i className="pi pi-calendar text-blue-600 mb-2 block" style={{ fontSize: '1.5rem' }}></i>
                <div className="text-xs text-blue-600 font-medium">REPORTED</div>
                <div className="font-bold text-blue-800">{item.date}</div>
              </div>
            </div>
            <div className="col-6" style={{ padding: '0 0.25rem' }}>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 border-round-lg text-center border-1 border-green-200 w-full">
                <i className="pi pi-clock text-green-600 mb-2 block" style={{ fontSize: '1.5rem' }}></i>
                <div className="text-xs text-green-600 font-medium">STATUS</div>
                <div className="font-bold text-green-800">{item.status.toUpperCase()}</div>
              </div>
            </div>
          </div>

          {/* Reward Banner - FULL WIDTH */}
          {item.reward && (
            <div className="mt-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-round-xl border-1 border-orange-200 w-full">
              <div className="flex align-items-center gap-3">
                <div className="w-3rem h-3rem bg-orange-100 border-round-xl flex align-items-center justify-content-center">
                  <i className="pi pi-gift text-orange-600" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <div className="font-bold text-orange-800 mb-1">Reward Offered</div>
                  <div className="text-2xl font-bold text-orange-600">{item.reward}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Detailed Information */}
        <div className="col-12 lg:col-7" style={{ padding: '1rem' }}>
          {/* Description Section - FULL WIDTH */}
          <div className="mb-4">
            <div className="flex align-items-center gap-2 mb-3">
              <div className="w-2rem h-2rem bg-gray-100 border-round flex align-items-center justify-content-center">
                <i className="pi pi-file-text text-gray-600"></i>
              </div>
              <h3 className="m-0 text-lg font-bold text-gray-800">Description</h3>
            </div>
            <div className="bg-gray-50 p-4 border-round-lg border-1 border-gray-200 w-full">
              <p className="text-gray-700 line-height-3 m-0">
                {item.description || 'No detailed description has been provided for this item. Please contact the reporter for additional information.'}
              </p>
            </div>
          </div>

          {/* Location Information - FULL WIDTH */}
          <div className="mb-4">
            <div className="flex align-items-center gap-2 mb-3">
              <div className="w-2rem h-2rem bg-purple-100 border-round flex align-items-center justify-content-center">
                <i className="pi pi-map-marker text-purple-600"></i>
              </div>
              <h3 className="m-0 text-lg font-bold text-gray-800">Location Information</h3>
            </div>
            <div className="grid" style={{ margin: '0 -0.5rem' }}>
              <div className="col-12 md:col-6" style={{ padding: '0 0.5rem' }}>
                <div className="bg-purple-50 p-3 border-round-lg border-1 border-purple-200 w-full h-full">
                  <div className="text-sm font-medium text-purple-600 mb-1">GENERAL AREA</div>
                  <div className="font-bold text-purple-800">{item.location}</div>
                </div>
              </div>
              {item.specificLocation && (
                <div className="col-12 md:col-6" style={{ padding: '0 0.5rem' }}>
                  <div className="bg-indigo-50 p-3 border-round-lg border-1 border-indigo-200 w-full h-full">
                    <div className="text-sm font-medium text-indigo-600 mb-1">SPECIFIC LOCATION</div>
                    <div className="font-bold text-indigo-800">{item.specificLocation}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Item Specifications - FULL WIDTH */}
          {(item.itemColor || item.itemBrand || item.itemSize) && (
            <div className="mb-4">
              <div className="flex align-items-center gap-2 mb-3">
                <div className="w-2rem h-2rem bg-blue-100 border-round flex align-items-center justify-content-center">
                  <i className="pi pi-info-circle text-blue-600"></i>
                </div>
                <h3 className="m-0 text-lg font-bold text-gray-800">Item Specifications</h3>
              </div>
              <div className="grid" style={{ margin: '0 -0.25rem' }}>
                {item.itemColor && (
                  <div className="col-12 md:col-4" style={{ padding: '0 0.25rem' }}>
                    <div className="bg-red-50 p-3 border-round-lg border-1 border-red-200 text-center w-full h-full">
                      <div className="text-sm font-medium text-red-600 mb-1">COLOR</div>
                      <div className="font-bold text-red-800">{item.itemColor}</div>
                    </div>
                  </div>
                )}
                {item.itemBrand && (
                  <div className="col-12 md:col-4" style={{ padding: '0 0.25rem' }}>
                    <div className="bg-green-50 p-3 border-round-lg border-1 border-green-200 text-center w-full h-full">
                      <div className="text-sm font-medium text-green-600 mb-1">BRAND</div>
                      <div className="font-bold text-green-800">{item.itemBrand}</div>
                    </div>
                  </div>
                )}
                {item.itemSize && (
                  <div className="col-12 md:col-4" style={{ padding: '0 0.25rem' }}>
                    <div className="bg-yellow-50 p-3 border-round-lg border-1 border-yellow-200 text-center w-full h-full">
                      <div className="text-sm font-medium text-yellow-600 mb-1">SIZE</div>
                      <div className="font-bold text-yellow-800">{item.itemSize}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reporter Information - FULL WIDTH */}
          <div className="mb-4">
            <div className="flex align-items-center gap-2 mb-3">
              <div className="w-2rem h-2rem bg-teal-100 border-round flex align-items-center justify-content-center">
                <i className="pi pi-user text-teal-600"></i>
              </div>
              <h3 className="m-0 text-lg font-bold text-gray-800">Reporter Information</h3>
            </div>
            <div className="bg-teal-50 p-4 border-round-lg border-1 border-teal-200 w-full">
              <div className="flex align-items-center gap-3 mb-3">
                <Avatar 
                  label={item.reportedBy.charAt(0).toUpperCase()} 
                  size="large"
                  style={{ backgroundColor: '#14b8a6', color: 'white' }}
                  className="shadow-2"
                />
                <div>
                  <div className="font-bold text-teal-800 text-lg">{item.reportedBy}</div>
                  <div className="text-teal-600 text-sm flex align-items-center gap-1">
                    <i className="pi pi-clock"></i>
                    Reported on {item.timeReported || item.date}
                  </div>
                </div>
              </div>
              
              <div className="flex align-items-center gap-2 text-teal-600">
                <i className="pi pi-shield"></i>
                <span className="text-sm font-medium">Verified Reporter • Contact via secure messaging</span>
              </div>
            </div>
          </div>

          {/* Match Information - FULL WIDTH */}
          {item.status === 'matched' && item.matchedWith && (
            <div className="mb-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-round-xl border-1 border-green-200 w-full">
                <div className="flex align-items-center gap-3 mb-3">
                  <div className="w-3rem h-3rem bg-green-100 border-round-xl flex align-items-center justify-content-center">
                    <i className="pi pi-check-circle text-green-600" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                  <div>
                    <div className="font-bold text-green-800 text-lg">Successfully Matched!</div>
                    <div className="text-green-600">This item has been reunited with its owner</div>
                  </div>
                </div>
                <div className="bg-white p-3 border-round-lg w-full">
                  <div className="text-sm text-green-600 mb-1">MATCHED WITH REPORT</div>
                  <div className="font-bold text-green-800">#{item.matchedWith?.toString().padStart(4, '0')}</div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline - FULL WIDTH */}
          <div className="mb-3">
            <div className="flex align-items-center gap-2 mb-3">
              <div className="w-2rem h-2rem bg-gray-100 border-round flex align-items-center justify-content-center">
                <i className="pi pi-history text-gray-600"></i>
              </div>
              <h3 className="m-0 text-lg font-bold text-gray-800">Activity Timeline</h3>
            </div>
            <Timeline 
              value={timelineEvents} 
              content={(item) => (
                <div className="bg-white p-3 border-round-lg shadow-1 ml-3 w-full">
                  <div className="font-bold text-gray-800">{item.status}</div>
                  <div className="text-sm text-gray-600 mb-1">{item.date}</div>
                  <div className="text-sm text-gray-700">{item.description}</div>
                </div>
              )}
              marker={(item) => (
                <div 
                  className="w-2rem h-2rem border-round-2xl flex align-items-center justify-content-center shadow-2"
                  style={{ backgroundColor: item.color, color: 'white' }}
                >
                  <i className={item.icon} style={{ fontSize: '0.875rem' }}></i>
                </div>
              )}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Footer with Action Buttons - FULL WIDTH */}
      <div 
        className="flex justify-content-between align-items-center px-4 py-3 border-top-1 surface-border w-full"
        style={{ backgroundColor: '#fafafa', margin: 0 }}
      >
        <div className="flex align-items-center gap-2 text-sm text-gray-500">
          <i className="pi pi-info-circle"></i>
          <span>Report ID: #{item.id.toString().padStart(4, '0')}</span>
        </div>
        
        <div className="flex gap-2">
          <Button
            label="Close"
            icon="pi pi-times"
            outlined
            onClick={onHide}
            className="p-button-sm"
          />
          
          {item.status !== 'matched' && (
            <>
              <Button
                label="Contact Reporter"
                icon="pi pi-envelope"
                onClick={() => onContact(item)}
                className="p-button-sm"
              />
              
              {onMarkMatch && (
                <Button
                  label="Mark as Match"
                  icon="pi pi-check"
                  severity="success"
                  onClick={() => onMarkMatch(item)}
                  className="p-button-sm"
                />
              )}
            </>
          )}

          {item.status === 'matched' && (
            <Button
              label="View Match Details"
              icon="pi pi-external-link"
              severity="info"
              className="p-button-sm"
            />
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default ItemDetailsModal;