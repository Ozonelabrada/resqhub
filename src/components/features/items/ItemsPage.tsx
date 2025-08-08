import React, { useState, useEffect, useCallback } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Badge } from 'primereact/badge';
import { Tag } from 'primereact/tag';
import { Avatar } from 'primereact/avatar';
import { Dialog } from 'primereact/dialog';
import { Galleria } from 'primereact/galleria';
import { Chip } from 'primereact/chip';
import { Panel } from 'primereact/panel';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';

interface Item {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category_id: number;
  type: 'lost' | 'found';
  status: 'active' | 'matched' | 'closed' | 'expired';
  location_name: string;
  address: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  incident_date: Date;
  incident_time?: string;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  distinctive_features?: string;
  estimated_value?: number;
  contact_method: 'phone' | 'email' | 'both';
  reward_amount?: number;
  views_count: number;
  is_featured: boolean;
  expires_at?: Date;
  matched_at?: Date;
  matched_with_item_id?: number;
  images?: string[];
  user_name?: string;
  category_name?: string;
}

const ItemsPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    type: null,
    category: null,
    status: null,
    city: ''
  });

  // Sample data
  const sampleItems: Item[] = [
    {
      id: 1,
      user_id: 1,
      title: 'iPhone 14 Pro Max',
      description: 'Lost my iPhone 14 Pro Max in Space Black color. It has a clear case with a photo of my family. The phone was lost near the Central Park entrance around 3 PM. Very important as it contains work documents and family photos. Please contact me if you find it!',
      category_id: 1,
      type: 'lost',
      status: 'active',
      location_name: 'Central Park',
      address: '5th Ave & 59th St',
      city: 'New York',
      state: 'NY',
      incident_date: new Date('2024-01-15'),
      incident_time: '15:00',
      brand: 'Apple',
      model: 'iPhone 14 Pro Max',
      color: 'Space Black',
      size: '6.7 inch',
      distinctive_features: 'Clear case with family photo, small scratch on back',
      estimated_value: 1200,
      contact_method: 'both',
      reward_amount: 200,
      views_count: 156,
      is_featured: true,
      images: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
      user_name: 'John Smith',
      category_name: 'Electronics'
    },
    {
      id: 2,
      user_id: 2,
      title: 'Brown Leather Wallet',
      description: 'Found a brown leather wallet on subway platform. Contains ID, credit cards, and some cash. Looking to return to owner. The wallet has initials "M.J." embossed on the front and appears to be a Coach brand wallet.',
      category_id: 2,
      type: 'found',
      status: 'active',
      location_name: 'Times Square Subway',
      address: '42nd St & Broadway',
      city: 'New York',
      state: 'NY',
      incident_date: new Date('2024-01-16'),
      incident_time: '08:30',
      brand: 'Coach',
      color: 'Brown',
      distinctive_features: 'Initials "M.J." embossed on front',
      contact_method: 'email',
      views_count: 89,
      is_featured: false,
      images: ['/api/placeholder/300/200'],
      user_name: 'Sarah Johnson',
      category_name: 'Accessories'
    },
    {
      id: 3,
      user_id: 3,
      title: 'Silver MacBook Pro 13"',
      description: 'Lost my MacBook Pro 13" in Silver color at Starbucks on 42nd Street. It has several stickers on the back including a GitHub logo and university sticker. Very important for work - contains important presentations and documents.',
      category_id: 1,
      type: 'lost',
      status: 'active',
      location_name: 'Starbucks 42nd Street',
      address: '42nd St & 8th Ave',
      city: 'New York',
      state: 'NY',
      incident_date: new Date('2024-01-17'),
      incident_time: '14:20',
      brand: 'Apple',
      model: 'MacBook Pro 13"',
      color: 'Silver',
      size: '13 inch',
      distinctive_features: 'GitHub sticker, NYU sticker, small dent on corner',
      estimated_value: 1800,
      contact_method: 'both',
      reward_amount: 300,
      views_count: 234,
      is_featured: true,
      images: ['/api/placeholder/300/200', '/api/placeholder/300/200', '/api/placeholder/300/200'],
      user_name: 'Mike Chen',
      category_name: 'Electronics'
    }
  ];

  const categories = [
    { label: 'All Categories', value: null },
    { label: 'Electronics', value: 1 },
    { label: 'Accessories', value: 2 },
    { label: 'Keys', value: 3 },
    { label: 'Jewelry', value: 4 },
    { label: 'Documents', value: 5 },
    { label: 'Clothing', value: 6 }
  ];

  const statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Active', value: 'active' },
    { label: 'Matched', value: 'matched' },
    { label: 'Closed', value: 'closed' },
    { label: 'Expired', value: 'expired' }
  ];

  const typeOptions = [
    { label: 'All Types', value: null },
    { label: 'Lost Items', value: 'lost' },
    { label: 'Found Items', value: 'found' }
  ];

  // Load initial data
  useEffect(() => {
    setItems(sampleItems);
  }, []);

  // Reset items when filters change
  useEffect(() => {
    setItems(sampleItems);
    setCurrentPage(1);
    setHasMore(true);
  }, [filters]);

  // Infinite scroll function
  const loadMoreItems = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Generate new items for the next page
      const newItems = sampleItems.map((item, index) => ({
        ...item,
        id: item.id + (currentPage * 100) + index, // Ensure unique IDs
        user_name: `${item.user_name} ${currentPage + 1}`, // Vary the names slightly
        views_count: Math.floor(Math.random() * 500) + 50
      }));

      setItems(prevItems => [...prevItems, ...newItems]);
      setCurrentPage(prev => prev + 1);
      setLoading(false);

      // Simulate reaching the end after 5 pages
      if (currentPage >= 5) {
        setHasMore(false);
      }
    }, 1000);
  }, [currentPage, hasMore, loading]);

  // Scroll detection for infinite scroll
  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    const { scrollTop, scrollHeight, clientHeight } = target;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200; // 200px before bottom

    if (isNearBottom && hasMore && !loading) {
      loadMoreItems();
    }
  }, [hasMore, loading, loadMoreItems]);

  // Attach scroll listener to the scrollable container
  useEffect(() => {
    const scrollableDiv = document.getElementById('scrollable-items-container');
    if (scrollableDiv) {
      scrollableDiv.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollableDiv.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'matched': return 'info';
      case 'closed': return 'warning';
      case 'expired': return 'danger';
      default: return 'info';
    }
  };

  const getTypeSeverity = (type: string) => {
    return type === 'lost' ? 'danger' : 'success';
  };

  const itemTemplate = (item: Item) => {
    return (
      <Card className="mb-4 shadow-2" style={{ width: '100%' }}>
        <div className="grid" style={{ margin: 0 }}>
          {/* Image Section */}
          <div className="col-12 md:col-4" style={{ padding: '1rem' }}>
            <div className="relative">
              <img
                src={item.images?.[0] || '/api/placeholder/300/200'}
                alt={item.title}
                className="w-full h-12rem object-cover border-round"
              />
              {item.is_featured && (
                <Badge
                  value="FEATURED"
                  severity="warning"
                  className="absolute top-2 left-2"
                />
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <Tag
                  value={item.type.toUpperCase()}
                  severity={getTypeSeverity(item.type)}
                  className="text-xs"
                />
                <Tag
                  value={item.status.toUpperCase()}
                  severity={getStatusSeverity(item.status)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="col-12 md:col-8" style={{ padding: '1rem' }}>
            <div className="flex justify-content-between align-items-start mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                <div className="flex align-items-center gap-2 mb-2">
                  <Avatar icon="pi pi-user"/>
                  <span className="text-sm text-gray-600">{item.user_name}</span>
                  <Chip label={item.category_name} className="text-xs" />
                </div>
              </div>
              {item.reward_amount && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">Reward</div>
                  <div className="text-lg font-bold text-green-600">
                    ${item.reward_amount}
                  </div>
                </div>
              )}
            </div>

            <p className="text-gray-700 mb-3 line-height-3">
              {item.description.length > 150
                ? `${item.description.substring(0, 150)}...`
                : item.description}
            </p>

            {/* Item Details Grid */}
            <div className="grid mb-3" style={{ margin: 0 }}>
              <div className="col-6 md:col-3" style={{ padding: '0.25rem' }}>
                <div className="text-xs text-gray-500">Location</div>
                <div className="text-sm font-semibold">
                  <i className="pi pi-map-marker mr-1 text-blue-500"></i>
                  {item.location_name}
                </div>
                <div className="text-xs text-gray-600">
                  {item.city}, {item.state}
                </div>
              </div>
              <div className="col-6 md:col-3" style={{ padding: '0.25rem' }}>
                <div className="text-xs text-gray-500">Date & Time</div>
                <div className="text-sm font-semibold">
                  <i className="pi pi-calendar mr-1 text-orange-500"></i>
                  {item.incident_date.toLocaleDateString()}
                </div>
                {item.incident_time && (
                  <div className="text-xs text-gray-600">{item.incident_time}</div>
                )}
              </div>
              {item.brand && (
                <div className="col-6 md:col-3" style={{ padding: '0.25rem' }}>
                  <div className="text-xs text-gray-500">Brand</div>
                  <div className="text-sm font-semibold">{item.brand}</div>
                  {item.model && (
                    <div className="text-xs text-gray-600">{item.model}</div>
                  )}
                </div>
              )}
              {item.color && (
                <div className="col-6 md:col-3" style={{ padding: '0.25rem' }}>
                  <div className="text-xs text-gray-500">Color</div>
                  <div className="text-sm font-semibold">{item.color}</div>
                  {item.size && (
                    <div className="text-xs text-gray-600">Size: {item.size}</div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-content-between align-items-center">
              <div className="flex align-items-center gap-3">
                <Button
                  label="View Details"
                  icon="pi pi-eye"
                  className="p-button-outlined p-button-sm"
                  onClick={() => {
                    setSelectedItem(item);
                    setShowDialog(true);
                  }}
                />
                <Button
                  label="Contact"
                  icon="pi pi-envelope"
                  className="p-button-sm"
                  severity="success"
                />
                <span className="text-xs text-gray-500">
                  <i className="pi pi-eye mr-1"></i>
                  {item.views_count} views
                </span>
              </div>
              {item.estimated_value && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">Estimated Value</div>
                  <div className="text-sm font-semibold">${item.estimated_value}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const itemDetailDialog = () => {
    if (!selectedItem) return null;

    const responsiveOptions = [
      { breakpoint: '1024px', numVisible: 5 },
      { breakpoint: '768px', numVisible: 3 },
      { breakpoint: '560px', numVisible: 1 }
    ];

    const imageTemplate = (item: string) => {
      return <img src={item} alt="Item" className="w-full h-20rem object-cover" />;
    };

    const thumbnailTemplate = (item: string) => {
      return <img src={item} alt="Thumbnail" className="w-4rem h-3rem object-cover" />;
    };

    return (
      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header={selectedItem.title}
        style={{ width: '90vw', maxWidth: '800px' }}
        className="p-fluid"
      >
        <div className="grid">
          <div className="col-12">
            {selectedItem.images && selectedItem.images.length > 0 && (
              <Galleria
                value={selectedItem.images}
                responsiveOptions={responsiveOptions}
                numVisible={3}
                item={imageTemplate}
                thumbnail={thumbnailTemplate}
                className="mb-4"
                style={{ maxHeight: '400px' }}
              />
            )}
          </div>

          <div className="col-12 mb-3">
            <div className="flex gap-2 mb-3">
              <Tag
                value={selectedItem.type.toUpperCase()}
                severity={getTypeSeverity(selectedItem.type)}
              />
              <Tag
                value={selectedItem.status.toUpperCase()}
                severity={getStatusSeverity(selectedItem.status)}
              />
              {selectedItem.is_featured && (
                <Tag value="FEATURED" severity="warning" />
              )}
            </div>
          </div>

          <div className="col-12 md:col-6">
            <Panel header="Reporter Information" className="mb-3">
              <div className="flex align-items-center gap-3">
                <Avatar icon="pi pi-user" size="large" />
                <div>
                  <div className="font-semibold">{selectedItem.user_name}</div>
                  <div className="text-sm text-gray-600">Contact via {selectedItem.contact_method}</div>
                </div>
              </div>
            </Panel>
          </div>

          <div className="col-12 md:col-6">
            <Panel header="Financial Information" className="mb-3">
              {selectedItem.reward_amount && (
                <div className="mb-2">
                  <span className="font-semibold text-green-600">Reward: ${selectedItem.reward_amount}</span>
                </div>
              )}
              {selectedItem.estimated_value && (
                <div>
                  <span className="text-gray-600">Estimated Value: ${selectedItem.estimated_value}</span>
                </div>
              )}
            </Panel>
          </div>

          <div className="col-12">
            <Panel header="Description" className="mb-3">
              <p className="line-height-3">{selectedItem.description}</p>
            </Panel>
          </div>
        </div>

        <Divider />

        <div className="flex gap-2 justify-content-end">
          <Button
            label="Contact Reporter"
            icon="pi pi-envelope"
            severity="success"
          />
          <Button
            label="Report Item"
            icon="pi pi-flag"
            severity="warning"
            className="p-button-outlined"
          />
          <Button
            label="Close"
            icon="pi pi-times"
            className="p-button-outlined"
            onClick={() => setShowDialog(false)}
          />
        </div>
      </Dialog>
    );
  };

  return (
    <div 
      style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden' // Prevent page-level scrolling
      }}
    >
      {/* Fixed Header - No Scroll */}
      <div 
        style={{ 
          flexShrink: 0, 
          backgroundColor: 'white', 
          borderBottom: '1px solid #e5e7eb',
          zIndex: 10,
          position: 'relative'
        }}
      >
        <div className="p-4">
          <div className="flex justify-content-between align-items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 m-0">Items Management</h1>
            <Button
              label="Add New Item"
              icon="pi pi-plus"
              onClick={() => setShowCreateDialog(true)}
            />
          </div>

          {/* Fixed Filters */}
          <Card className="shadow-1">
            <div className="grid" style={{ margin: 0 }}>
              <div className="col-12 md:col-3" style={{ padding: '0.5rem' }}>
                <InputText
                  placeholder="Search items..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full"
                />
              </div>
              <div className="col-12 md:col-2" style={{ padding: '0.5rem' }}>
                <Dropdown
                  value={filters.type}
                  options={typeOptions}
                  onChange={(e) => setFilters({...filters, type: e.value})}
                  placeholder="Type"
                  className="w-full"
                />
              </div>
              <div className="col-12 md:col-2" style={{ padding: '0.5rem' }}>
                <Dropdown
                  value={filters.category}
                  options={categories}
                  onChange={(e) => setFilters({...filters, category: e.value})}
                  placeholder="Category"
                  className="w-full"
                />
              </div>
              <div className="col-12 md:col-2" style={{ padding: '0.5rem' }}>
                <Dropdown
                  value={filters.status}
                  options={statusOptions}
                  onChange={(e) => setFilters({...filters, status: e.value})}
                  placeholder="Status"
                  className="w-full"
                />
              </div>
              <div className="col-12 md:col-2" style={{ padding: '0.5rem' }}>
                <InputText
                  placeholder="City"
                  value={filters.city}
                  onChange={(e) => setFilters({...filters, city: e.target.value})}
                  className="w-full"
                />
              </div>
              <div className="col-12 md:col-1" style={{ padding: '0.5rem' }}>
                <Button
                  icon="pi pi-filter-slash"
                  className="p-button-outlined w-full"
                  onClick={() => setFilters({
                    search: '',
                    type: null,
                    category: null,
                    status: null,
                    city: ''
                  })}
                  tooltip="Clear Filters"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Scrollable Items Container - Only this scrolls */}
      <div 
        id="scrollable-items-container"
        style={{ 
          flexGrow: 1, 
          overflow: 'auto',
          backgroundColor: '#f8fafc',
          position: 'relative'
        }}
      >
        <div className="p-4">
          {/* Items Count Header */}
          <div className="mb-4">
            <div className="bg-white border-round-lg p-3 shadow-1">
              <div className="flex justify-content-between align-items-center">
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-list text-blue-500"></i>
                  <span className="font-semibold text-gray-800">
                    Showing {items.length} items
                  </span>
                  {!hasMore && items.length > 0 && (
                    <Badge value="All loaded" severity="info" />
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {loading ? 'Loading...' : hasMore ? 'Scroll down for more' : 'End of results'}
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          {items.map((item) => (
            <div key={item.id}>
              {itemTemplate(item)}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="text-center p-4">
              <div className="bg-white border-round-lg p-4 shadow-1">
                <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                <p className="mt-3 text-gray-600 font-semibold">Loading more items...</p>
                <p className="text-sm text-gray-500">Please wait while we fetch more results</p>
              </div>
            </div>
          )}

          {/* End of Data Indicator - Clear "Nothing Follows" Message */}
          {!hasMore && items.length > 0 && (
            <div className="text-center p-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-round-lg p-6 shadow-1 border-2 border-dashed border-gray-300">
                <div className="mb-3">
                  <i className="pi pi-check-circle text-gray-500 text-4xl block"></i>
                </div>
                <h4 className="text-gray-700 font-bold text-lg mb-2">
                  🎉 That's everything!
                </h4>
                <p className="text-gray-600 font-semibold mb-1">
                  You've reached the end of all available items.
                </p>
                <p className="text-gray-500 text-sm mb-3">
                  Nothing follows beyond this point.
                </p>
                <div className="flex justify-content-center gap-2">
                  <Button 
                    label="Back to Top" 
                    icon="pi pi-arrow-up" 
                    className="p-button-outlined p-button-sm"
                    onClick={() => {
                      const container = document.getElementById('scrollable-items-container');
                      if (container) {
                        container.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  />
                  <Button 
                    label="Add New Item" 
                    icon="pi pi-plus" 
                    className="p-button-sm"
                    onClick={() => setShowCreateDialog(true)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {items.length === 0 && !loading && (
            <div className="text-center p-8">
              <div className="bg-white border-round-lg p-6 shadow-1">
                <i className="pi pi-inbox text-gray-400 text-6xl mb-4 block"></i>
                <h3 className="text-gray-700 text-xl mb-2">No items found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search filters or add a new item.
                </p>
                <Button 
                  label="Add First Item" 
                  icon="pi pi-plus" 
                  onClick={() => setShowCreateDialog(true)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Dialog */}
      {itemDetailDialog()}

      {/* Add Item Dialog */}
      <Dialog
        visible={showCreateDialog}
        onHide={() => setShowCreateDialog(false)}
        header="Add New Item"
        style={{ width: '50vw' }}
      >
        <p>Add Item Form would go here...</p>
        <div className="flex justify-content-end gap-2">
          <Button
            label="Cancel"
            className="p-button-outlined"
            onClick={() => setShowCreateDialog(false)}
          />
          <Button label="Save" />
        </div>
      </Dialog>
    </div>
  );
};

export default ItemsPage;