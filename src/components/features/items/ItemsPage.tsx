import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Input, 
  Select, 
  Badge, 
  Avatar, 
  Modal, 
  ModalBody,
  ModalFooter,
  ImageGallery, 
  Spinner,
  Container,
  Grid,
  StatusBadge
} from '../../ui';
import { 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag as TagIcon, 
  Eye, 
  Share2, 
  MessageSquare, 
  ChevronRight,
  X,
  Info,
  CheckCircle2,
  DollarSign,
  User as UserIcon,
  ArrowRight
} from 'lucide-react';
import { formatCurrencyPHP, formatDate } from '@/utils';

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
    { label: 'All Categories', value: '' },
    { label: 'Electronics', value: 1 },
    { label: 'Accessories', value: 2 },
    { label: 'Keys', value: 3 },
    { label: 'Jewelry', value: 4 },
    { label: 'Documents', value: 5 },
    { label: 'Clothing', value: 6 }
  ];

  const statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Matched', value: 'matched' },
    { label: 'Closed', value: 'closed' },
    { label: 'Expired', value: 'expired' }
  ];

  const typeOptions = [
    { label: 'All Types', value: '' },
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

  const getStatusVariant = (status: string): "success" | "info" | "warning" | "error" | "default" => {
    switch (status) {
      case 'active': return 'success';
      case 'matched': return 'info';
      case 'closed': return 'warning';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getTypeVariant = (type: string): "error" | "success" => {
    return type === 'lost' ? 'error' : 'success';
  };

  const itemTemplate = (item: Item) => {
    return (
      <Card className="mb-6 border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-2xl transition-all duration-500">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="w-full md:w-1/3 relative overflow-hidden">
            <img
              src={item.images?.[0] || '/api/placeholder/300/200'}
              alt={item.title}
              className="w-full h-64 md:h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {item.is_featured && (
              <div className="absolute top-4 left-4">
                <Badge variant="warning" className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg">
                  Featured
                </Badge>
              </div>
            )}
            
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <StatusBadge
                status={item.type}
                variant={getTypeVariant(item.type)}
                className="shadow-lg backdrop-blur-md bg-white/90"
              />
              <StatusBadge
                status={item.status}
                variant={getStatusVariant(item.status)}
                className="shadow-lg backdrop-blur-md bg-white/90"
              />
            </div>
          </div>

          {/* Content Section */}
          <div className="w-full md:w-2/3 p-8 md:p-10 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar size="sm" className="bg-blue-100 text-blue-600 font-bold" />
                    <span className="text-sm font-bold text-slate-600">{item.user_name}</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-slate-300" />
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold">
                    {item.category_name}
                  </Badge>
                </div>
              </div>
              {item.reward_amount && (
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Reward</div>
                  <div className="text-2xl font-black text-emerald-600">
                    {formatCurrencyPHP(item.reward_amount)}
                  </div>
                </div>
              )}
            </div>

            <p className="text-slate-500 font-medium leading-relaxed mb-8 line-clamp-2">
              {item.description}
            </p>

            {/* Item Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-blue-600">
                  <MapPin size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Location</span>
                </div>
                <div className="text-sm font-bold text-slate-900 truncate">{item.location_name}</div>
                <div className="text-xs font-medium text-slate-500">{item.city}, {item.state}</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-orange-500">
                  <Calendar size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Date</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{formatDate(item.incident_date)}</div>
                {item.incident_time && (
                  <div className="text-xs font-medium text-slate-500">{item.incident_time}</div>
                )}
              </div>

              {item.brand && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-purple-500">
                    <TagIcon size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Brand</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 truncate">{item.brand}</div>
                  {item.model && (
                    <div className="text-xs font-medium text-slate-500">{item.model}</div>
                  )}
                </div>
              )}

              {item.color && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-pink-500">
                    <Info size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Color</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{item.color}</div>
                  {item.size && (
                    <div className="text-xs font-medium text-slate-500">Size: {item.size}</div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="rounded-xl px-6 py-2 h-auto font-black uppercase tracking-widest text-[10px] flex items-center gap-2"
                  onClick={() => {
                    setSelectedItem(item);
                    setShowDialog(true);
                  }}
                >
                  <Eye size={14} />
                  Details
                </Button>
                <Button
                  className="rounded-xl px-6 py-2 h-auto font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-lg shadow-blue-100"
                  onClick={() => {}}
                >
                  <MessageSquare size={14} />
                  Contact
                </Button>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Eye size={14} />
                  <span className="text-xs font-bold">{item.views_count}</span>
                </div>
                {item.estimated_value && (
                  <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Value</div>
                    <div className="text-sm font-black text-slate-900">{formatCurrencyPHP(item.estimated_value)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const itemDetailDialog = () => {
    if (!selectedItem) return null;

    return (
      <Modal
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title={selectedItem.title}
        size="lg"
      >
        <ModalBody className="p-0">
          <div className="flex flex-col">
            {/* Image Gallery */}
            <div className="w-full bg-slate-900">
              {selectedItem.images && selectedItem.images.length > 0 ? (
                <ImageGallery 
                  images={selectedItem.images} 
                  className="h-[400px]"
                />
              ) : (
                <div className="h-[400px] flex items-center justify-center bg-slate-100 text-slate-400">
                  <Info size={48} />
                </div>
              )}
            </div>

            <div className="p-8">
              <div className="flex flex-wrap gap-3 mb-8">
                <StatusBadge
                  status={selectedItem.type}
                  variant={getTypeVariant(selectedItem.type)}
                  className="px-4 py-1.5"
                />
                <StatusBadge
                  status={selectedItem.status}
                  variant={getStatusVariant(selectedItem.status)}
                  className="px-4 py-1.5"
                />
                {selectedItem.is_featured && (
                  <Badge variant="warning" className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                    Featured
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <UserIcon size={14} className="text-blue-600" />
                      Reporter Information
                    </h4>
                    <div className="flex items-center gap-4">
                      <Avatar size="lg" className="bg-blue-100 text-blue-600 font-bold" />
                      <div>
                        <div className="text-lg font-black text-slate-900">{selectedItem.user_name}</div>
                        <div className="text-sm font-medium text-slate-500">Contact via {selectedItem.contact_method}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <DollarSign size={14} className="text-emerald-600" />
                      Financial Details
                    </h4>
                    <div className="space-y-3">
                      {selectedItem.reward_amount && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-500">Reward Amount</span>
                          <span className="text-lg font-black text-emerald-600">{formatCurrencyPHP(selectedItem.reward_amount)}</span>
                        </div>
                      )}
                      {selectedItem.estimated_value && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-500">Estimated Value</span>
                          <span className="text-lg font-black text-slate-900">{formatCurrencyPHP(selectedItem.estimated_value)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <Info size={14} className="text-blue-600" />
                    Description
                  </h4>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="bg-slate-50/50 p-6 flex justify-end gap-4">
          <Button
            variant="outline"
            className="rounded-2xl px-8 py-3 h-auto font-black uppercase tracking-widest text-xs"
            onClick={() => setShowDialog(false)}
          >
            Close
          </Button>
          <Button
            className="rounded-2xl px-8 py-3 h-auto font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200"
          >
            Contact Reporter
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 z-20 relative shadow-sm">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Items Management</h1>
              <p className="text-slate-500 font-medium">Track and manage lost and found items across the platform</p>
            </div>
            <Button
              className="rounded-2xl px-8 py-4 h-auto font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-blue-200"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus size={18} />
              Add New Item
            </Button>
          </div>

          {/* Fixed Filters */}
          <Card className="border-none shadow-xl rounded-[2rem] bg-slate-50/50 p-2">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <Input
                  placeholder="Search items..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="bg-white border-none rounded-xl h-12"
                  icon={<Search size={18} className="text-slate-400" />}
                />
              </div>
              <div className="md:col-span-2">
                <Select
                  value={filters.type || ''}
                  options={typeOptions}
                  onChange={(val) => setFilters({...filters, type: val})}
                  placeholder="All Types"
                  className="bg-white border-none rounded-xl h-12"
                />
              </div>
              <div className="md:col-span-2">
                <Select
                  value={filters.category || ''}
                  options={categories}
                  onChange={(val) => setFilters({...filters, category: val})}
                  placeholder="All Categories"
                  className="bg-white border-none rounded-xl h-12"
                />
              </div>
              <div className="md:col-span-2">
                <Select
                  value={filters.status || ''}
                  options={statusOptions}
                  onChange={(val) => setFilters({...filters, status: val})}
                  placeholder="All Status"
                  className="bg-white border-none rounded-xl h-12"
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  placeholder="City"
                  value={filters.city}
                  onChange={(e) => setFilters({...filters, city: e.target.value})}
                  className="bg-white border-none rounded-xl h-12"
                  icon={<MapPin size={18} className="text-slate-400" />}
                />
              </div>
              <div className="md:col-span-1">
                <Button
                  variant="ghost"
                  className="w-full h-12 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
                  onClick={() => setFilters({
                    search: '',
                    type: null,
                    category: null,
                    status: null,
                    city: ''
                  })}
                >
                  <X size={20} />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Scrollable Items Container */}
      <div 
        id="scrollable-items-container"
        className="flex-grow overflow-auto bg-slate-50 scroll-smooth"
      >
        <Container className="py-10">
          {/* Items Count Header */}
          <div className="mb-8">
            <div className="bg-white/50 backdrop-blur-sm border border-white rounded-3xl p-6 shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <TagIcon size={20} />
                </div>
                <div>
                  <span className="text-lg font-black text-slate-900">
                    {items.length} Items Found
                  </span>
                  {!hasMore && items.length > 0 && (
                    <Badge variant="info" className="ml-3 bg-blue-100 text-blue-600 border-none font-bold">
                      All Loaded
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Updating...
                  </div>
                ) : hasMore ? (
                  'Scroll for more'
                ) : (
                  'End of results'
                )}
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id}>
                {itemTemplate(item)}
              </div>
            ))}
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 text-center">
              <Card className="max-w-md mx-auto border-none shadow-xl rounded-[2.5rem] p-10 bg-white/80 backdrop-blur-xl">
                <Spinner size="lg" className="mx-auto mb-6" />
                <h4 className="text-xl font-black text-slate-900 mb-2">Loading More Items</h4>
                <p className="text-slate-500 font-medium">Please wait while we fetch more results...</p>
              </Card>
            </div>
          )}

          {/* End of Data Indicator */}
          {!hasMore && items.length > 0 && (
            <div className="py-12 text-center">
              <div className="max-w-2xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/20 blur-[100px] rounded-full" />
                  <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-emerald-600/20 blur-[100px] rounded-full" />
                </div>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white mx-auto mb-8">
                    <CheckCircle2 size={40} />
                  </div>
                  <h4 className="text-3xl font-black text-white mb-4">
                    That's everything!
                  </h4>
                  <p className="text-slate-300 font-medium mb-10 max-w-md mx-auto">
                    You've reached the end of all available items. Nothing follows beyond this point.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button 
                      variant="ghost"
                      className="rounded-2xl px-8 py-4 h-auto font-black uppercase tracking-widest text-xs text-white hover:bg-white/10"
                      onClick={() => {
                        const container = document.getElementById('scrollable-items-container');
                        if (container) {
                          container.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                    >
                      Back to Top
                    </Button>
                    <Button 
                      className="rounded-2xl px-8 py-4 h-auto font-black uppercase tracking-widest text-xs bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/10"
                      onClick={() => setShowCreateDialog(true)}
                    >
                      Add New Item
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {items.length === 0 && !loading && (
            <div className="py-24 text-center">
              <Card className="max-w-lg mx-auto border-none shadow-2xl rounded-[3rem] p-16 bg-white">
                <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-300 mx-auto mb-8">
                  <Search size={48} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">No items found</h3>
                <p className="text-slate-500 font-medium mb-10">
                  Try adjusting your search filters or be the first to add a new item to the platform.
                </p>
                <Button 
                  className="rounded-2xl px-10 py-4 h-auto font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus size={18} className="mr-2" />
                  Add First Item
                </Button>
              </Card>
            </div>
          )}
        </Container>
      </div>

      {/* Item Detail Dialog */}
      {itemDetailDialog()}

      {/* Add Item Dialog */}
      <Modal
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        title="Add New Item"
        size="md"
      >
        <ModalBody className="p-10">
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 mx-auto mb-6">
              <Plus size={36} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Create New Report</h3>
            <p className="text-slate-500 font-medium mb-8">Fill in the details to post a new lost or found item.</p>
            <div className="p-8 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 text-slate-400 font-bold">
              Form implementation would go here...
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="bg-slate-50/50 p-6 flex justify-end gap-4">
          <Button
            variant="ghost"
            className="rounded-2xl px-8 py-3 h-auto font-black uppercase tracking-widest text-xs"
            onClick={() => setShowCreateDialog(false)}
          >
            Cancel
          </Button>
          <Button 
            className="rounded-2xl px-8 py-3 h-auto font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200"
            onClick={() => setShowCreateDialog(false)}
          >
            Save Report
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ItemsPage;