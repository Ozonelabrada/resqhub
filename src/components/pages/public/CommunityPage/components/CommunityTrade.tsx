import React, { useState, useEffect } from 'react';
import { Card, Button, Avatar, ShadcnBadge as Badge } from '@/components/ui';
import { 
  Search, 
  Filter, 
  ShoppingBag, 
  Tag, 
  MapPin, 
  MessageCircle,
  TrendingUp,
  Star,
  Package,
  ArrowUpRight,
  ArrowLeft,
  ShoppingCart,
  Store,
  ChevronRight,
  Info,
  Plus,
  Heart,
  Award,
  Zap,
  Download,
  Edit2,
  Trash2,
  Clock,
  Users,
  Utensils,
  Car,
  Calendar,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { StoreService } from '@/services/storeService';
import type { 
  StoreType, 
  RetailItem, 
  ServiceItem, 
  FoodItem, 
  RiderOption, 
  EventItem, 
  StoreItem 
} from '@/types/storeTypes';

interface Seller {
  storeId: number;
  storeName: string;
  ownerName?: string;
  avatar?: string;
  bannerImage?: string;
  bannerUrl?: string;
  description?: string;
  rating?: number;
  itemsCount?: number;
  location: string;
  joinedDate?: string;
  status: string;
  communityId: number;
  communityName: string;
  businessPermitUrl?: string;
  storeType: StoreType; // NEW: Store type (RETAIL, SERVICES, FOOD, RIDERS, EVENTS)
}

interface TradeItem {
  id: string;
  title: string;
  price: number;
  priceTag: string;
  category: string;
  sellerId: string;
  location: string;
  imageUrl: string;
  condition: 'Brand New' | 'Like New' | 'Used';
}

// ============================================
// Sample Store Data with Store Types
// ============================================

// Retail Items (Store 1 & 2)
const SAMPLE_RETAIL_ITEMS: RetailItem[] = [
  {
    id: 1,
    name: 'Emergency Power Station 500W',
    category: 'Electronics',
    description: 'Portable power station with 500W capacity for emergency use',
    price: 12500,
    originalPrice: 15000,
    stock: 5,
    rating: 4.8,
    reviews: 24,
    image: 'https://images.unsplash.com/photo-1621360841013-c7683c659ec6?w=500&auto=format',
    variants: { color: ['Black', 'Gray'] },
    storeId: 1
  },
  {
    id: 2,
    name: 'Heavy Duty First Aid Kit',
    category: 'Health',
    description: 'Complete medical emergency kit with 100+ items',
    price: 2200,
    stock: 12,
    rating: 4.6,
    reviews: 18,
    image: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=500&auto=format',
    storeId: 2
  },
  {
    id: 3,
    name: 'Solar Panel System 100W',
    category: 'Electronics',
    description: 'Portable solar charging system for off-grid power',
    price: 4500,
    stock: 8,
    rating: 4.7,
    reviews: 31,
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=500&auto=format',
    storeId: 1
  },
  {
    id: 4,
    name: 'Multi-tool Knife (15 in 1)',
    category: 'Tools',
    description: 'Professional grade survival multi-tool',
    price: 1100,
    stock: 15,
    rating: 4.9,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1528148343865-2218efbd3ee5?w=500&auto=format',
    variants: { color: ['Black', 'Silver', 'Camo'] },
    storeId: 2
  }
];

// Service Items (Store 3 - converted to SERVICES type)
const SAMPLE_SERVICE_ITEMS: ServiceItem[] = [
  {
    id: 1,
    name: 'Emergency Home Repair',
    category: 'Home Repair',
    description: 'Quick response home repair services for emergencies',
    price: 1500,
    duration: 180,
    rating: 4.8,
    reviews: 23,
    provider: {
      name: 'Roberto Diaz',
      avatar: 'https://i.pravatar.cc/150?u=roberto-diaz',
      experience: '15 years experience'
    },
    availability: [
      { day: 'Monday', slots: ['09:00', '11:00', '14:00', '16:00'] },
      { day: 'Tuesday', slots: ['09:00', '11:00', '14:00', '16:00'] },
      { day: 'Wednesday', slots: ['09:00', '11:00', '14:00'] }
    ],
    storeId: 3
  },
  {
    id: 2,
    name: 'Appliance Installation & Setup',
    category: 'Home Repair',
    description: 'Professional appliance installation and configuration',
    price: 800,
    duration: 120,
    rating: 4.9,
    reviews: 31,
    provider: {
      name: 'Roberto Diaz',
      avatar: 'https://i.pravatar.cc/150?u=roberto-diaz',
      experience: '15 years experience'
    },
    availability: [
      { day: 'Monday', slots: ['10:00', '13:00', '15:00'] },
      { day: 'Friday', slots: ['09:00', '11:00', '14:00'] }
    ],
    storeId: 3
  }
];

// Food Items (Store 4 - converted to FOOD type)
const SAMPLE_FOOD_ITEMS: FoodItem[] = [
  {
    id: 1,
    name: 'Emergency Meal Pack (Filipino)',
    category: 'Filipino',
    description: 'Traditional Filipino meal ready in minutes - Adobo with rice',
    price: 150,
    prepTime: 5,
    rating: 4.7,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561fe1?w=500&auto=format',
    tags: ['bestseller', 'traditional'],
    storeId: 4
  },
  {
    id: 2,
    name: 'Instant Noodle Soup',
    category: 'Beverages', 
    description: 'Hot and comforting noodle soup perfect for emergencies',
    price: 85,
    prepTime: 3,
    rating: 4.4,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1569718212165-05c80fff922a?w=500&auto=format',
    tags: ['quick', 'comfort'],
    storeId: 4
  },
  {
    id: 3,
    name: 'Power Bar Energy Pack',
    category: 'Desserts',
    description: 'High-energy bars with nuts and dried fruits',
    price: 120,
    prepTime: 0,
    rating: 4.6,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1571740922344-b5f86a93c58a?w=500&auto=format',
    tags: ['energy', 'healthy'],
    storeId: 4
  }
];

// Add some additional stores for other types
const ADDITIONAL_STORES: Seller[] = [
  {
    storeId: 5,
    storeName: 'FastGo Riders',
    ownerName: 'Miguel Rodriguez',
    avatar: 'https://i.pravatar.cc/150?u=miguel-rodriguez',
    bannerImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&auto=format',
    description: 'Reliable transportation and delivery services for the community.',
    rating: 4.5,
    itemsCount: 3,
    location: 'Zone 2 Transit',
    status: 'Approved',
    communityId: 1,
    communityName: 'Central Community',
    storeType: 'RIDERS'
  },
  {
    storeId: 6,
    storeName: 'Community Events Co.',
    ownerName: 'Lisa Chen',
    avatar: 'https://i.pravatar.cc/150?u=lisa-chen',
    bannerImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format',
    description: 'Organizing memorable community events and gatherings.',
    rating: 4.9,
    itemsCount: 2,
    location: 'Central Plaza',
    status: 'Approved',
    communityId: 1,
    communityName: 'Central Community',
    storeType: 'EVENTS'
  }
];

// Rider Options (Store 5)
const SAMPLE_RIDER_OPTIONS: RiderOption[] = [
  {
    id: 1,
    name: 'Budget Ride',
    category: 'Budget',
    pricePerKm: 12,
    basePrice: 50,
    rating: 4.3,
    availableRiders: 8,
    estimatedTime: 15,
    features: ['Basic service', 'Shared rides available'],
    storeId: 5
  },
  {
    id: 2,
    name: 'Comfort Plus',
    category: 'Comfort',
    pricePerKm: 18,
    basePrice: 80,
    rating: 4.7,
    availableRiders: 5,
    estimatedTime: 10,
    features: ['Air conditioned', 'Private rides', 'Licensed driver'],
    storeId: 5
  },
  {
    id: 3,
    name: 'Emergency Delivery',
    category: 'Delivery',
    pricePerKm: 25,
    basePrice: 100,
    rating: 4.8,
    availableRiders: 3,
    estimatedTime: 5,
    features: ['Urgent delivery', 'Medical supplies', 'Available 24/7'],
    storeId: 5
  }
];

// Event Items (Store 6)  
const SAMPLE_EVENT_ITEMS: EventItem[] = [
  {
    id: 1,
    name: 'Community Safety Workshop',
    category: 'Education',
    description: 'Learn emergency preparedness and community safety protocols',
    date: '2026-03-15',
    time: '14:00',
    location: 'Community Center Hall A',
    organizer: 'Emergency Response Team',
    capacity: 50,
    ticketPrice: 200,
    availableTickets: 32,
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&auto=format',
    tags: ['educational', 'safety', 'community'],
    storeId: 6
  },
  {
    id: 2,
    name: 'Weekend Food Festival',
    category: 'Food & Drinks',
    description: 'Celebrate local cuisine with food stalls from community vendors',
    date: '2026-03-22',
    time: '10:00',
    location: 'Central Plaza',
    organizer: 'Food Committee',
    capacity: 200,
    ticketPrice: 150,
    availableTickets: 84,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&auto=format',
    tags: ['food', 'festival', 'family-friendly'],
    storeId: 6
  }
];

// Legacy compatibility - convert to old format for existing UI
const SAMPLE_TRADE_ITEMS: TradeItem[] = [
  // Retail items converted
  ...SAMPLE_RETAIL_ITEMS.map(item => ({
    id: `retail_${item.id}`,
    title: item.name,
    price: item.price,
    priceTag: `₱${item.price.toLocaleString()}`,
    category: item.category,
    sellerId: item.storeId.toString(),
    location: item.storeId === 1 ? 'Zone 1 Central' : 'Sitio Maligaya',
    imageUrl: item.image,
    condition: 'Brand New' as const
  })),
  // Service items converted
  ...SAMPLE_SERVICE_ITEMS.map(item => ({
    id: `service_${item.id}`,
    title: item.name,
    price: item.price,
    priceTag: `₱${item.price.toLocaleString()}`,
    category: item.category,
    sellerId: item.storeId.toString(),
    location: 'Central Plaza',
    imageUrl: 'https://images.unsplash.com/photo-1581092162562-40038f56c239?w=800&auto=format',
    condition: 'Brand New' as const
  })),
  // Food items converted
  ...SAMPLE_FOOD_ITEMS.map(item => ({
    id: `food_${item.id}`,
    title: item.name,
    price: item.price,
    priceTag: `₱${item.price.toLocaleString()}`,
    category: item.category,
    sellerId: item.storeId.toString(),
    location: 'Zone 4 Outer',
    imageUrl: item.image,
    condition: 'Brand New' as const
  })),
  // Rider options converted
  ...SAMPLE_RIDER_OPTIONS.map(item => ({
    id: `rider_${item.id}`,
    title: item.name,
    price: item.basePrice,
    priceTag: `₱${item.basePrice} + ₱${item.pricePerKm}/km`,
    category: item.category,
    sellerId: item.storeId.toString(),
    location: 'Zone 2 Transit',
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&auto=format',
    condition: 'Brand New' as const
  })),
  // Event items converted
  ...SAMPLE_EVENT_ITEMS.map(item => ({
    id: `event_${item.id}`,
    title: item.name,
    price: item.ticketPrice,
    priceTag: `₱${item.ticketPrice.toLocaleString()}`,
    category: item.category,
    sellerId: item.storeId.toString(),
    location: 'Central Plaza',
    imageUrl: item.image,
    condition: 'Brand New' as const
  }))
];

const SAMPLE_SELLERS: Seller[] = [
  {
    storeId: 1,
    storeName: 'Emergency Gear Hub',
    ownerName: 'Maria Santos',
    avatar: 'https://i.pravatar.cc/150?u=maria-santos',
    bannerImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format',
    description: 'Your trusted source for emergency preparedness gear and survival equipment.',
    rating: 4.8,
    itemsCount: 8,
    location: 'Zone 1 Central',
    status: 'Approved',
    communityId: 1,
    communityName: 'Central Community',
    storeType: 'RETAIL'
  },
  {
    storeId: 2,
    storeName: 'Health & Wellness Shop',
    ownerName: 'John Cruz',
    avatar: 'https://i.pravatar.cc/150?u=john-cruz',
    bannerImage: 'https://images.unsplash.com/photo-1576091160550-112b8ce389fa?w=800&auto=format',
    description: 'Medicine, first aid, and wellness products for the whole family.',
    rating: 4.6,
    itemsCount: 6,
    location: 'Sitio Maligaya',
    status: 'Approved',
    communityId: 1,
    communityName: 'Central Community',
    storeType: 'RETAIL'
  },
  {
    storeId: 3,
    storeName: 'Hardware & Tools Village',
    ownerName: 'Roberto Diaz',
    avatar: 'https://i.pravatar.cc/150?u=roberto-diaz',
    bannerImage: 'https://images.unsplash.com/photo-1581092162562-40038f56c239?w=800&auto=format',
    description: 'Complete selection of hardware supplies, tools, and outdoor equipment.',
    rating: 4.9,
    itemsCount: 7,
    location: 'Central Plaza',
    status: 'Approved',
    communityId: 1,
    communityName: 'Central Community',
    storeType: 'RETAIL'
  },
  {
    storeId: 4,
    storeName: 'Kitchen Essentials Co.',
    ownerName: 'Angela Reyes',
    avatar: 'https://i.pravatar.cc/150?u=angela-reyes',
    bannerImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format',
    description: 'Quality kitchenware, cooking supplies, and food storage solutions.',
    rating: 4.7,
    itemsCount: 4,
    location: 'Zone 4 Outer',
    status: 'Approved',
    communityId: 1,
    communityName: 'Central Community',
    storeType: 'RETAIL'
  }
];

export const CommunityTrade: React.FC = () => {
  const [currentView, setCurrentView] = useState<'items' | 'stores'>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [stores, setStores] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');
  const [favoriteItems, setFavoriteItems] = useState<Set<string>>(new Set());
  
  // Store Management Features
  const [managementMode, setManagementMode] = useState(false);
  const [selectedStoreForManagement, setSelectedStoreForManagement] = useState<Seller | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TradeItem | null>(null);

  // Fetch stores from API
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await StoreService.getCommunityStores(1, 'Approved', 1, 10);
        
        if (response.succeeded && response.data.items && response.data.items.length > 0) {
          setStores(response.data.items);
        } else {
          // Fallback to mock data if API returns no results
          setStores(SAMPLE_SELLERS);
        }
      } catch (err) {
        // Fallback to mock data on error
        console.error('Error fetching stores:', err);
        setStores(SAMPLE_SELLERS);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const filteredSellers = stores.filter(s => 
    s.storeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.ownerName && s.ownerName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // All items from all community stores
  const allCommunityItems = SAMPLE_TRADE_ITEMS;

  // Filtered items with search and category/price filters
  const filteredItems = allCommunityItems
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'popular': return Math.random() - 0.5;
        default: return 0;
      }
    });

  const categories = Array.from(new Set(SAMPLE_TRADE_ITEMS.map(item => item.category)));

  const handleAddToCart = (item: TradeItem) => {
    setCartCount(prev => prev + 1);
    toast.success(`${item.title} added to cart!`, {
      icon: '🛒',
      style: {
        borderRadius: '1rem',
        background: '#0d9488',
        color: '#fff',
        fontWeight: 'bold'
      }
    });
  };

  const handleToggleFavorite = (itemId: string) => {
    const newFavorites = new Set(favoriteItems);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
      toast.success('Removed from favorites', { icon: '💔' });
    } else {
      newFavorites.add(itemId);
      toast.success('Added to favorites!', { icon: '❤️' });
    }
    setFavoriteItems(newFavorites);
  };

  // ============================================
  // Store Management Handlers
  // ============================================
  
  const getStoreTypeIcon = (storeType: StoreType) => {
    switch(storeType) {
      case 'RETAIL': return <ShoppingBag size={16} />;
      case 'SERVICES': return <Award size={16} />;
      case 'FOOD': return <Utensils size={16} />;
      case 'RIDERS': return <Car size={16} />;
      case 'EVENTS': return <Calendar size={16} />;
      default: return <Store size={16} />;
    }
  };

  const getStoreTypeColor = (storeType: StoreType) => {
    switch(storeType) {
      case 'RETAIL': return 'bg-blue-50 text-blue-600';
      case 'SERVICES': return 'bg-purple-50 text-purple-600';
      case 'FOOD': return 'bg-orange-50 text-orange-600';
      case 'RIDERS': return 'bg-green-50 text-green-600';
      case 'EVENTS': return 'bg-pink-50 text-pink-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const handleAddItem = () => {
    if (!selectedStoreForManagement) {
      toast.error('Select a store first');
      return;
    }
    setEditingItem(null);
    setShowAddItemModal(true);
  };

  const handleEditItem = (item: TradeItem) => {
    setEditingItem(item);
    setShowAddItemModal(true);
  };

  const handleSaveItem = (itemData: any) => {
    if (editingItem) {
      toast.success('Item updated successfully! 🎉');
    } else {
      toast.success('Item added successfully! 🎉');
    }
    setShowAddItemModal(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      toast.success('Item deleted successfully! 🗑️');
    }
  };

  const handleManageStore = (seller: Seller) => {
    setSelectedStoreForManagement(seller);
    setManagementMode(true);
  };

  const handleExitManagement = () => {
    setManagementMode(false);
    setSelectedStoreForManagement(null);
    setEditingItem(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Dynamic Marketplace Header */}
      <div className="bg-white p-4 md:p-6 lg:p-8 rounded-[3rem] shadow-sm border border-slate-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 lg:gap-8">
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 md:w-12 h-10 md:h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-200">
                <ShoppingBag size={20} className="md:w-6 md:h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase italic">
                Findr <span className="text-teal-600">Market</span>
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-500 font-medium max-w-lg">
              Explore local shops and trade with verified community members. Support neighborhood businesses and find essential gear.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <Store size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Local Shops</p>
                <p className="text-lg font-black text-slate-900">{stores.length} Stores</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                <Package size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Available Items</p>
                <p className="text-lg font-black text-slate-900">{SAMPLE_TRADE_ITEMS.length}+ Gear</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle Buttons */}
      <div className="flex gap-3 border-b border-slate-200">
        <button
          onClick={() => setCurrentView('items')}
          className={`px-6 py-3 font-black text-sm transition-all border-b-2 -mb-[2px] ${
            currentView === 'items'
              ? 'text-teal-600 border-teal-600'
              : 'text-slate-500 border-transparent hover:text-teal-600'
          }`}
        >
          All Items ({filteredItems.length})
        </button>
        <button
          onClick={() => setCurrentView('stores')}
          className={`px-6 py-3 font-black text-sm transition-all border-b-2 -mb-[2px] ${
            currentView === 'stores'
              ? 'text-teal-600 border-teal-600'
              : 'text-slate-500 border-transparent hover:text-teal-600'
          }`}
        >
          Stores ({stores.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-10">
        <div className="relative w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder={currentView === 'items' ? 'Search items...' : 'Search stores or shop owners...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-5 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none font-bold text-slate-700 transition-all"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-600 font-medium">Loading marketplace...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-[3rem] border-2 border-dashed border-red-200">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 text-red-300 shadow-sm">
            <Info size={32} />
          </div>
          <p className="text-red-600 font-bold text-center">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Items View */}
      {!loading && !error && currentView === 'items' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-32">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Category Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Categories</h3>
              <div className="space-y-2">
                {['All', ...Array.from(new Set(SAMPLE_TRADE_ITEMS.map(item => item.category)))].map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      selectedCategory === category
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Sort By</h3>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-sm"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Price Range</h3>
              <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase">₱{priceRange[0].toLocaleString()} - ₱{priceRange[1].toLocaleString()}</label>
                  <input 
                    type="range"
                    min="0"
                    max="50000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="lg:col-span-3">
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map((item) => {
                  const seller = stores.find(s => s.storeId.toString() === item.sellerId);
                  return (
                    <Card key={item.id} className="group p-0 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                      <div className="aspect-square relative overflow-hidden bg-slate-100">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        
                        {/* Overlays and Badges */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                          <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-black text-[9px] uppercase px-3 py-1.5 rounded-full">
                            {item.condition}
                          </Badge>
                          <button
                            onClick={() => handleToggleFavorite(item.id)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                              favoriteItems.has(item.id)
                                ? 'bg-red-500 text-white'
                                : 'bg-white/80 text-slate-400 hover:bg-white hover:text-red-500'
                            }`}
                          >
                            <Heart size={16} fill={favoriteItems.has(item.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="p-5 space-y-4 flex-1 flex flex-col">
                        <div>
                          <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-1">{item.category}</p>
                          <h4 className="text-sm font-black text-slate-800 line-clamp-2 uppercase tracking-tight leading-snug">{item.title}</h4>
                        </div>

                        {/* Seller & Location Info */}
                        <div className="space-y-2 text-slate-500">
                          {seller && (
                            <div className="text-[10px] font-bold text-teal-600">From: {seller.storeName}</div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <MapPin size={12} />
                            <span className="text-[10px] font-bold">{item.location}</span>
                          </div>
                        </div>

                        <div className="flex-1" />

                        {/* Price and Action */}
                        <div className="space-y-3 pt-3 border-t border-slate-100">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-teal-600">{item.priceTag}</span>
                            <span className="text-xs font-bold text-slate-400">In Stock</span>
                          </div>
                          
                          <Button 
                            onClick={() => handleAddToCart(item)}
                            className="w-full h-11 rounded-xl bg-slate-900 hover:bg-teal-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                          >
                            <ShoppingCart size={16} /> Add to Cart
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 text-slate-300 shadow-sm">
                  <Search size={32} />
                </div>
                <p className="text-slate-400 font-bold">No items found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stores View */}
      {!loading && !error && currentView === 'stores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {filteredSellers.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 text-slate-300 shadow-sm">
                <Search size={32} />
              </div>
              <p className="text-slate-400 font-bold">No stores found matching your search.</p>
            </div>
          ) : (
            filteredSellers.map((seller) => (
          <Card 
            key={seller.storeId} 
            className="group p-0 rounded-[3rem] bg-white border-none shadow-sm hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-500 overflow-hidden relative flex flex-col"
          >
            {/* Store Banner */}
            <div className="h-40 w-full overflow-hidden relative">
               <img 
                 src={seller.bannerUrl || seller.bannerImage || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format'} 
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                 alt={seller.storeName} 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
               {seller.rating && (
                 <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-amber-600 px-3 py-1.5 rounded-2xl shadow-sm">
                      <Star size={12} fill="currentColor" />
                      <span className="text-xs font-black">{seller.rating}</span>
                    </div>
                 </div>
               )}
            </div>

            <div className="px-6 pb-6 pt-0 relative flex-1 flex flex-col">
               {/* Owner Avatar - Circular and overlapping the banner */}
               <div className="flex justify-between items-end -mt-10 mb-4 relative z-20">
                  <Avatar className="w-20 h-20 rounded-full border-[6px] border-white shadow-xl bg-white overflow-hidden">
                     <img src={seller.avatar || 'https://i.pravatar.cc/150?u=' + seller.storeName} alt={seller.ownerName || seller.storeName} className="w-full h-full object-cover" />
                  </Avatar>
                  <div className="flex gap-2 pb-1">
                     <Badge className={`border-none font-black text-[9px] uppercase px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 ${getStoreTypeColor(seller.storeType)}`}>
                        {getStoreTypeIcon(seller.storeType)}
                        {seller.storeType}
                     </Badge>
                  </div>
               </div>

               <div className="space-y-4 flex-1">
                 <div>
                   <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tighter group-hover:text-teal-600 transition-colors">
                     {seller.storeName}
                   </h3>
                   {seller.ownerName && (
                     <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Owner: <span className="text-slate-600">{seller.ownerName}</span>
                        </p>
                     </div>
                   )}
                 </div>

                 <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed h-10 mb-2">
                   {seller.description || 'No description available.'}
                 </p>

                 <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
                    {seller.itemsCount && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                         <Package size={14} className="text-teal-500" />
                         <span className="text-[10px] font-black uppercase tracking-wider">{seller.itemsCount} Items</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-slate-400">
                       <MapPin size={14} className="text-rose-500" />
                       <span className="text-[10px] font-black uppercase tracking-wider">{seller.location}</span>
                    </div>
                 </div>

                 <div className="flex gap-3">
                   <Button 
                     className="flex-1 bg-slate-900 hover:bg-teal-600 text-white rounded-[1.5rem] h-12 font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 border-none shadow-lg shadow-slate-900/10"
                   >
                     View Store <ChevronRight size={16} />
                   </Button>
                   <Button 
                     onClick={() => handleManageStore(seller)}
                     className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-[1.5rem] h-12 font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 border-2 border-emerald-200 shadow-md"
                   >
                     <Edit2 size={16} /> Manage
                   </Button>
                 </div>
               </div>
            </div>
          </Card>
            ))
          )}
        </div>
      )}

      {/* Store Management Mode */}
      {managementMode && selectedStoreForManagement && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleExitManagement}
                  className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase">{selectedStoreForManagement.storeName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`border-none font-black text-[9px] uppercase px-3 py-1 rounded-full flex items-center gap-1 ${getStoreTypeColor(selectedStoreForManagement.storeType)}`}>
                      {getStoreTypeIcon(selectedStoreForManagement.storeType)}
                      {selectedStoreForManagement.storeType}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleAddItem}
                className="bg-white text-teal-600 hover:bg-slate-100 font-black text-xs uppercase gap-2 rounded-2xl h-12 px-6 flex items-center justify-center shadow-lg"
              >
                <Plus size={18} /> Add Item
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-4">
                {filteredItems
                  .filter(item => item.sellerId === selectedStoreForManagement.storeId.toString())
                  .length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <Package size={32} className="text-slate-400 mb-2" />
                    <p className="text-slate-500 font-bold">No items yet. Create your first item!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredItems
                      .filter(item => item.sellerId === selectedStoreForManagement.storeId.toString())
                      .map((item) => (
                        <Card 
                          key={item.id} 
                          className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            {item.imageUrl && (
                              <img 
                                src={item.imageUrl} 
                                alt={item.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <h4 className="font-black text-slate-900 uppercase text-sm">
                                {item.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-bold">
                                ₱{item.price}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <Button 
                              onClick={() => setEditingItem(item)}
                              className="h-9 w-9 p-0 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center"
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button 
                              onClick={() => {
                                toast.success('Item deleted! 🗑️');
                              }}
                              className="h-9 w-9 p-0 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </Card>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-8 py-4 bg-slate-50 flex justify-end gap-3">
              <Button 
                onClick={handleExitManagement}
                variant="outline"
                className="rounded-2xl h-11 px-8 font-black text-sm uppercase"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
