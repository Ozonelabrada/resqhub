import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  TrendingUp,
  Store,
  Package,
  Star,
  Search,
  ArrowRight,
  Zap,
  UserCheck,
  Filter,
  Utensils,
  Bike,
  Wrench,
  Grid3X3,
  List,
  MapPin,
  Sparkles
} from 'lucide-react';
import { Card, Button, Badge, Spinner, Input } from '@/components/ui';
import { StoreService, type Store as StoreType } from '@/services/storeService';
import { ItemsService } from '@/services/itemsService';
import { useAuth } from '@/context/AuthContext';
import { useCommunities } from '@/hooks/useCommunities';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface TradeItem {
  id: number;
  name: string;
  description: string;
  category: string;
  price?: number;
  image?: string;
  imageUrl?: string;
  storeId?: number;
  storeName?: string;
  rating?: number;
  reviews?: number;
  isVerified?: boolean;
  isAvailable?: boolean;
}

const TradeMarketHubPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { communities: userCommunities, loading: communitiesLoading } = useCommunities();
  
  const [stores, setStores] = useState<StoreType[]>([]);
  const [items, setItems] = useState<TradeItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<TradeItem[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreType[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [viewMode, setViewMode] = useState<'items' | 'stores'>('items');
  const [storesSearchQuery, setStoresSearchQuery] = useState('');
  const [selectedStoreCat, setSelectedStoreCat] = useState<string>('all');
  
  // Category filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  
  // Ref to store stable featured items
  const featuredItemsRef = useRef<TradeItem[]>([]);
  const previousItemsLengthRef = useRef<number>(0);
  const mockDataShownRef = useRef<boolean>(false);
  
  const categories = [
    { id: 'all', label: 'All Items', icon: ShoppingBag, color: 'text-slate-600' },
    { id: 'food', label: 'Food & Dining', icon: Utensils, color: 'text-orange-600' },
    { id: 'riders', label: 'Riders & Transport', icon: Bike, color: 'text-blue-600' },
    { id: 'services', label: 'Services', icon: Wrench, color: 'text-purple-600' }
  ];

  // Get user's community IDs - memoized to prevent effect from running on every render
  const userCommunityIds = useMemo(() => 
    userCommunities
      .filter(c => c.isMember === true || c.isMember === 'true')
      .map(c => c.id),
    [userCommunities]
  );

  // Fetch stores on mount
  useEffect(() => {
    const fetchStores = async () => {
      setStoresLoading(true);
      try {
        const response = await StoreService.getStores(1, 100);
        if (response?.data?.items) {
          setStores(response.data.items);
          setFilteredStores(response.data.items);
        }
      } catch (error) {
        console.error('Error fetching stores:', error instanceof Error ? error.message : String(error));
        toast.error('Failed to load stores');
      } finally {
        setStoresLoading(false);
      }
    };

    if (!communitiesLoading) {
      fetchStores();
    }
  }, [communitiesLoading]);

  // Fetch items from user's communities
  useEffect(() => {
    const fetchItems = async () => {
      if (userCommunityIds.length === 0) {
        setItems([]);
        setFilteredItems([]);
        setItemsLoading(false);
        return;
      }

      setItemsLoading(true);
      try {
        const response = await ItemsService.getItems(true, 100, 1);
        const fetchedItems = response?.data?.items || response?.data || [];
        
        // Filter items to only show items from user's communities
        const communityItems = fetchedItems.filter((item: TradeItem) => {
          return !item.storeId || userCommunityIds.some(id => 
            item.description?.includes(String(id)) || 
            item.storeName?.includes('community')
          );
        });

        // If no community-specific items, show all items as fallback
        const itemsToDisplay = communityItems.length > 0 ? communityItems : fetchedItems;
        setItems(itemsToDisplay);
        setFilteredItems(itemsToDisplay);
      } catch (error) {
        console.error('Error fetching items:', error instanceof Error ? error.message : String(error));
        // Show mock items as fallback
        const mockItems: TradeItem[] = [
          { id: 1, name: 'Grilled Chicken', description: 'Fresh grilled Filipino-style chicken', category: 'food', price: 250, image: 'https://via.placeholder.com/300x300?text=Grilled+Chicken' },
          { id: 2, name: 'City Taxi Booking', description: 'Professional taxi service', category: 'riders', price: 15, image: 'https://via.placeholder.com/300x300?text=Taxi+Service' },
          { id: 3, name: 'Plumbing Service', description: 'Professional plumbing repairs', category: 'services', price: 500, image: 'https://via.placeholder.com/300x300?text=Plumbing' },
          { id: 4, name: 'Fried Rice', description: 'Delicious Filipino fried rice', category: 'food', price: 180, image: 'https://via.placeholder.com/300x300?text=Fried+Rice' },
          { id: 5, name: 'Food Delivery', description: 'Fast food delivery service', category: 'riders', price: 50, image: 'https://via.placeholder.com/300x300?text=Delivery' },
          { id: 6, name: 'House Cleaning', description: 'Professional cleaning service', category: 'services', price: 1500, image: 'https://via.placeholder.com/300x300?text=Cleaning' }
        ];
        setItems(mockItems);
        setFilteredItems(mockItems);
        // Only show toast once when mock data is first loaded
        if (!mockDataShownRef.current) {
          mockDataShownRef.current = true;
          toast.success('Showing sample items');
        }
      } finally {
        setItemsLoading(false);
      }
    };

    if (!communitiesLoading) {
      fetchItems();
    }
  }, [userCommunityIds, communitiesLoading]);

  // Filter items based on search and category
  useEffect(() => {
    let result = items;

    // Filter by category
    if (!selectedCategories.includes('all')) {
      result = result.filter(item =>
        selectedCategories.some(cat =>
          item.category?.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    }

    setFilteredItems(result);
  }, [searchQuery, selectedCategories, items]);

  // Filter stores based on search
  useEffect(() => {
    let result = stores;

    // Filter by search query
    if (storesSearchQuery.trim()) {
      const query = storesSearchQuery.toLowerCase();
      result = result.filter(store =>
        store.name.toLowerCase().includes(query) ||
        store.description?.toLowerCase().includes(query)
      );
    }

    setFilteredStores(result);
  }, [storesSearchQuery, stores]);

  // Get featured items (stable - only changes when items array length changes)
  const featuredItems = useMemo(() => {
    // Only regenerate if items count changed significantly
    if (items.length === 0) {
      featuredItemsRef.current = [];
      previousItemsLengthRef.current = 0;
      return [];
    }

    // If same number of items, keep the previous featured selection
    if (previousItemsLengthRef.current === items.length && featuredItemsRef.current.length > 0) {
      return featuredItemsRef.current;
    }

    // Generate new featured items only when count changes
    const newFeatured = [...items].sort(() => 0.5 - Math.random()).slice(0, 3);
    featuredItemsRef.current = newFeatured;
    previousItemsLengthRef.current = items.length;
    return newFeatured;
  }, [items.length]); // Only depend on length, not the entire array

  // Calculate stats - memoized
  const verifiedStores = useMemo(() => 
    stores.filter(s => s.isVerified), 
    [stores]
  );
  
  const avgRating = useMemo(() => 
    stores.length > 0 
      ? (stores.reduce((sum, s) => sum + (s.rate || 0), 0) / stores.length).toFixed(1)
      : '0',
    [stores]
  );

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (categoryId === 'all') {
        return prev.includes('all') ? [] : ['all'];
      }
      const newCategories = prev.filter(c => c !== 'all');
      if (prev.includes(categoryId)) {
        return newCategories.filter(c => c !== categoryId);
      } else {
        return [...newCategories, categoryId];
      }
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'food':
        return <Utensils className="w-4 h-4" />;
      case 'riders':
      case 'rider':
        return <Bike className="w-4 h-4" />;
      case 'services':
      case 'service':
        return <Wrench className="w-4 h-4" />;
      default:
        return <ShoppingBag className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'food':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'riders':
      case 'rider':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'services':
      case 'service':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header Section */}
      <div className="px-4 md:px-8 lg:px-12 py-12 animate-in fade-in duration-700">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 shadow-lg">
            <ShoppingBag className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Trade Market Hub
            </h1>
            <p className="text-slate-600 font-medium mt-1">Discover verified stores and trade items</p>
          </div>
        </div>
      </div>

      {/* Featured Items Section */}
      {featuredItems.length > 0 && (
        <div className="px-4 md:px-8 lg:px-12 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-500" />
                Featured Items from Your Communities
              </h2>
              <p className="text-slate-500 font-medium text-sm mt-1">Discover trending items in your network</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredItems.map(item => (
              <Card
                key={item.id}
                onClick={() => navigate(`/item/${item.id}`)}
                className="group overflow-hidden hover:shadow-lg transition-all rounded-2xl cursor-pointer border-0 shadow-sm hover:scale-105 duration-300 bg-white flex flex-col"
              >
                {/* Image */}
                <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden relative">
                  {item.image || item.imageUrl ? (
                    <img
                      src={item.image || item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <ShoppingBag className="w-12 h-12 text-slate-300" />
                  )}
                  <Badge className={`absolute top-3 right-3 ${getCategoryColor(item.category)} border text-[10px] font-black`}>
                    <span className="inline-flex items-center gap-1">
                      {getCategoryIcon(item.category)}
                      {item.category}
                    </span>
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-black text-slate-900 text-sm line-clamp-2 mb-2">{item.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mb-3 line-clamp-2 flex-1">{item.description}</p>
                  
                  {item.price && (
                    <div className="mb-3">
                      <span className="text-lg font-black text-teal-600">₱{item.price.toLocaleString()}</span>
                    </div>
                  )}

                  {item.rating && (
                    <div className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-slate-900">{item.rating.toFixed(1)}</span>
                      <span className="text-xs text-slate-400">({item.reviews || 0} reviews)</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tabs: Items vs Stores */}
      <div className="px-4 md:px-8 lg:px-12 mb-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setViewMode('items')}
            className={cn(
              "px-6 py-3 rounded-2xl font-bold text-lg transition-all border-2",
              viewMode === 'items'
                ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-600 shadow-lg"
                : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
            )}
          >
            <ShoppingBag className="w-5 h-5 inline mr-2" />
            Items from My Communities
          </button>
          <button
            onClick={() => setViewMode('stores')}
            className={cn(
              "px-6 py-3 rounded-2xl font-bold text-lg transition-all border-2",
              viewMode === 'stores'
                ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-600 shadow-lg"
                : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
            )}
          >
            <Store className="w-5 h-5 inline mr-2" />
            Browse Stores
          </button>
        </div>
      </div>

      {/* Items View */}
      {viewMode === 'items' && (
        <>
          {/* Search and Filter Section */}
          <div className="px-4 md:px-8 lg:px-12 mb-8">
            <div className="w-full md:flex-1 relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search items by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 w-full rounded-2xl border-2 border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hidden">
              <Filter className="w-5 h-5 text-slate-400 flex-shrink-0" />
              {categories.map(cat => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      "px-4 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 flex-shrink-0 border-2",
                      isSelected
                        ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-600 shadow-lg"
                        : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                    )}
                  >
                    <IconComponent className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* View Toggle */}
          <div className="px-4 md:px-8 lg:px-12 mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Items Marketplace</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">{filteredItems.length} items available</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewType('grid')}
                className={cn(
                  "p-2.5 rounded-lg border-2 transition-all",
                  viewType === 'grid'
                    ? "bg-teal-50 border-teal-600 text-teal-600"
                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                )}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewType('list')}
                className={cn(
                  "p-2.5 rounded-lg border-2 transition-all",
                  viewType === 'list'
                    ? "bg-teal-50 border-teal-600 text-teal-600"
                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                )}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

      {/* Items Display Section */}
      <div className="px-4 md:px-8 lg:px-12 pb-12">
        {itemsLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" />
            <p className="mt-4 text-slate-500 font-medium">Loading items...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <>
            {viewType === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    onClick={() => navigate(`/item/${item.id}`)}
                    className="group overflow-hidden hover:shadow-lg transition-all rounded-2xl cursor-pointer border-0 shadow-sm hover:scale-105 duration-300 bg-white flex flex-col"
                  >
                    {/* Image */}
                    <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden relative">
                      {item.image || item.imageUrl ? (
                        <img
                          src={item.image || item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <ShoppingBag className="w-12 h-12 text-slate-300" />
                      )}
                      <Badge className={`absolute top-3 right-3 ${getCategoryColor(item.category)} border text-[10px] font-black`}>
                        <span className="inline-flex items-center gap-1">
                          {getCategoryIcon(item.category)}
                          {item.category}
                        </span>
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-black text-slate-900 text-sm line-clamp-2 mb-2">{item.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mb-3 line-clamp-2 flex-1">{item.description}</p>
                      
                      {item.price && (
                        <div className="mb-3">
                          <span className="text-lg font-black text-teal-600">₱{item.price.toLocaleString()}</span>
                        </div>
                      )}

                      {item.rating && (
                        <div className="flex items-center gap-2">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-bold text-slate-900">{item.rating.toFixed(1)}</span>
                          <span className="text-xs text-slate-400">({item.reviews || 0} reviews)</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    onClick={() => navigate(`/item/${item.id}`)}
                    className="p-4 rounded-2xl border-0 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white flex items-center gap-4 group"
                  >
                    {/* Thumbnail */}
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {item.image || item.imageUrl ? (
                        <img
                          src={item.image || item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <ShoppingBag className="w-8 h-8 text-slate-300" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-black text-slate-900">{item.name}</h3>
                        <Badge className={`${getCategoryColor(item.category)} border text-[10px] font-black flex-shrink-0`}>
                          <span className="inline-flex items-center gap-1">
                            {getCategoryIcon(item.category)}
                            {item.category}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 font-medium line-clamp-1 mb-2">{item.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {item.price && (
                            <span className="text-lg font-black text-teal-600">₱{item.price.toLocaleString()}</span>
                          )}
                          {item.rating && (
                            <div className="flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span className="text-xs font-bold text-slate-900">{item.rating.toFixed(1)}</span>
                              <span className="text-xs text-slate-400">({item.reviews || 0})</span>
                            </div>
                          )}
                        </div>
                        <ArrowRight className="w-5 h-5 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
            <ShoppingBag className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-black text-slate-700 mb-2">No items found</h3>
            <p className="text-slate-500 text-sm font-medium mb-6 text-center max-w-md">
              Try adjusting your filters or search query to find what you're looking for
            </p>
            <Button
              onClick={() => {
                setSelectedCategories(['all']);
                setSearchQuery('');
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2 rounded-xl"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
        </>
      )}

      {/* Stores View */}
      {viewMode === 'stores' && (
        <>
          {/* Stores Search and Filter Section */}
          <div className="px-4 md:px-8 lg:px-12 mb-8">
            <div className="w-full md:flex-1 relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search stores by name..."
                value={storesSearchQuery}
                onChange={(e) => setStoresSearchQuery(e.target.value)}
                className="pl-12 w-full rounded-2xl border-2 border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Stores Listing */}
          <div className="px-4 md:px-8 lg:px-12 pb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900">Available Stores</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">{filteredStores.length} stores available</p>
            </div>

            {storesLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Spinner size="lg" />
                <p className="mt-4 text-slate-500 font-medium">Loading stores...</p>
              </div>
            ) : filteredStores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStores.map(store => (
                  <Card
                    key={store.id}
                    onClick={() => navigate(`/store/${store.id}`)}
                    className="group overflow-hidden hover:shadow-lg transition-all rounded-2xl cursor-pointer border-0 shadow-sm hover:scale-105 duration-300 bg-white"
                  >
                    {/* Banner */}
                    <div className="h-40 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center overflow-hidden relative">
                      {store.bannerUrl ? (
                        <img src={store.bannerUrl} alt={store.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      ) : (
                        <Store className="w-12 h-12 text-teal-300 opacity-40" />
                      )}
                      {store.isVerified && (
                        <Badge className="absolute top-3 left-3 bg-green-100 text-green-700 text-[10px] font-black">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-black text-slate-900 text-lg line-clamp-1 mb-2">{store.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-2 h-8">{store.description}</p>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-black text-slate-900">{(store.rate || 0).toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 font-medium">{store.itemsCount || 0} items</span>
                      </div>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/store/${store.id}`);
                        }}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl py-2 flex items-center justify-center gap-2"
                      >
                        Visit Store
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
                <Store className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-black text-slate-700 mb-2">No stores found</h3>
                <p className="text-slate-500 text-sm font-medium mb-6 text-center max-w-md">
                  Try adjusting your filters or search query to find stores
                </p>
                <Button
                  onClick={() => {
                    setStoresSearchQuery('');
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2 rounded-xl"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Seller CTA Section */}
      <div className="px-4 md:px-8 lg:px-12 pb-12">
        <Card className="overflow-hidden rounded-3xl border-0 shadow-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white p-8 md:p-12">
          <div className="flex items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-4">Do you want to be a seller?</h2>
              <div className="space-y-2 text-purple-100 font-medium max-w-md">
                <p className="flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  <span>Reach thousands of community members</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-lg">📦</span>
                  <span>List items, food, services, or rides easily</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <span>Build your seller reputation and grow your business</span>
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/store/create')}
              className="bg-white text-violet-600 hover:bg-purple-50 font-black px-8 py-4 rounded-2xl whitespace-nowrap shadow-xl flex-shrink-0 h-auto text-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TradeMarketHubPage;