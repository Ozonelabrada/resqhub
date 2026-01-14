import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface Seller {
  id: string;
  storeName: string;
  ownerName: string;
  avatar?: string;
  bannerImage?: string;
  description: string;
  rating: number;
  itemsCount: number;
  location: string;
  joinedDate: string;
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

const SAMPLE_SELLERS: Seller[] = [
  {
    id: 's1',
    storeName: "Mario's Emergency Gear",
    ownerName: "Mario Rossi",
    avatar: 'https://i.pravatar.cc/150?u=mario',
    bannerImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format',
    description: "Your one-top shop for disaster preparedness. We specialize in portable power, lighting, and survival essentials.",
    rating: 4.9,
    itemsCount: 12,
    location: "Zone 1 Central",
    joinedDate: "Jan 2024"
  },
  {
    id: 's2',
    storeName: "Elena's Health & Safety",
    ownerName: "Elena Gilbert",
    avatar: 'https://i.pravatar.cc/150?u=elena',
    bannerImage: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&auto=format',
    description: "Certified medical supplies and safety equipment for families. Quality you can trust in times of need.",
    rating: 4.8,
    itemsCount: 8,
    location: "Sitio Maligaya",
    joinedDate: "Feb 2024"
  },
  {
    id: 's3',
    storeName: "Survivalist Hub",
    ownerName: "Jon Snow",
    avatar: 'https://i.pravatar.cc/150?u=jon',
    bannerImage: 'https://images.unsplash.com/photo-1445065849936-05be3a496b94?w=800&auto=format',
    description: "Rugged gear for the toughest conditions. Solar systems, water filtration, and winter preparations.",
    rating: 5.0,
    itemsCount: 15,
    location: "Central Plaza",
    joinedDate: "Nov 2023"
  },
  {
    id: 's4',
    storeName: "Neighborhood Kitchen",
    ownerName: "Sansa Stark",
    avatar: 'https://i.pravatar.cc/150?u=sansa',
    bannerImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format',
    description: "Cooking essentials and durable kitchenware. Helping you keep the hearth warm for your family.",
    rating: 4.5,
    itemsCount: 6,
    location: "Zone 4 Outer",
    joinedDate: "Mar 2024"
  },
];

const SAMPLE_TRADE_ITEMS: TradeItem[] = [
  {
    id: '1',
    title: 'Emergency Power Station 500W',
    price: 12500,
    priceTag: '₱12,500',
    category: 'Electronics',
    condition: 'Brand New',
    location: 'Zone 1 Central',
    imageUrl: 'https://images.unsplash.com/photo-1621360841013-c7683c659ec6?w=500&auto=format',
    sellerId: 's1'
  },
  {
    id: '2',
    title: 'Heavy Duty First Aid Kit',
    price: 2200,
    priceTag: '₱2,200',
    category: 'Health',
    condition: 'Like New',
    location: 'Sitio Maligaya',
    imageUrl: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=500&auto=format',
    sellerId: 's2'
  },
  {
    id: '3',
    title: 'Solar Panel System 100W',
    price: 4500,
    priceTag: '₱4,500',
    category: 'Hardware',
    condition: 'Used',
    location: 'Central Plaza',
    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=500&auto=format',
    sellerId: 's3'
  },
  {
    id: '4',
    title: 'LPG Gas Stove (Single burner)',
    price: 850,
    priceTag: '₱850',
    category: 'Kitchen',
    condition: 'Used',
    location: 'Zone 4 Outer',
    imageUrl: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?w=500&auto=format',
    sellerId: 's4'
  },
  {
    id: '5',
    title: 'Tactical Flashlight 2000LM',
    price: 1200,
    priceTag: '₱1,200',
    category: 'Electronics',
    condition: 'Brand New',
    location: 'Zone 1 Central',
    imageUrl: 'https://images.unsplash.com/photo-1542128913-7590d96d7410?w=500&auto=format',
    sellerId: 's1'
  },
  {
    id: '6',
    title: 'Water Purification Tablets (50pk)',
    price: 450,
    priceTag: '₱450',
    category: 'Health',
    condition: 'Brand New',
    location: 'Sitio Maligaya',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format',
    sellerId: 's2'
  }
];

export const CommunityTrade: React.FC = () => {
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const filteredSellers = SAMPLE_SELLERS.filter(s => 
    s.storeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const storeItems = selectedSeller 
    ? SAMPLE_TRADE_ITEMS.filter(item => 
        item.sellerId === selectedSeller.id && 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

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

  if (selectedSeller) {
    return (
      <div className="space-y-8 animate-in slide-in-from-right duration-500">
        {/* Enhanced Store Header with Banner */}
        <div className="relative rounded-[3rem] overflow-hidden bg-white shadow-xl shadow-slate-200/50 border border-slate-50">
           <div className="h-48 md:h-64 w-full relative">
              <img 
                src={selectedSeller.bannerImage} 
                className="w-full h-full object-cover" 
                alt={selectedSeller.storeName} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Back Button */}
              <button 
                onClick={() => { setSelectedSeller(null); setSearchQuery(''); }}
                className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 flex items-center justify-center transition-all z-20"
              >
                <ArrowLeft size={24} />
              </button>
           </div>

           <div className="px-8 pb-8 pt-0 relative">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-12 md:-mt-16">
                 <div className="flex flex-col md:flex-row md:items-end gap-6">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 rounded-full border-[8px] border-white shadow-2xl bg-white relative z-10 overflow-hidden">
                       <img src={selectedSeller.avatar} className="w-full h-full object-cover" alt={selectedSeller.ownerName} />
                    </Avatar>
                    <div className="pb-2">
                       <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase italic drop-shadow-sm">
                         {selectedSeller.storeName}
                       </h2>
                       <div className="flex items-center gap-3 mt-1">
                          <p className="text-slate-500 font-bold">Store of <span className="text-teal-600">{selectedSeller.ownerName}</span></p>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-100" />
                          <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg">
                            <Star size={14} fill="currentColor" />
                            <span className="text-sm font-black">{selectedSeller.rating}</span>
                          </div>
                          <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase px-3 py-1 rounded-full">
                             Verified Store
                          </Badge>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 pb-2">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-black gap-2 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">
                       <MessageCircle size={20} className="text-teal-600" /> Contact Shop
                    </Button>
                    <div className="relative">
                       <Button className="h-14 w-14 rounded-2xl bg-slate-900 hover:bg-teal-600 text-white p-0 shadow-xl shadow-slate-900/20 transition-all">
                         <ShoppingCart size={24} />
                       </Button>
                       {cartCount > 0 && (
                         <span className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 text-white text-[11px] font-black rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-bounce">
                           {cartCount}
                         </span>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           {/* Store Sidebar Info */}
           <div className="lg:col-span-1 space-y-6">
              <Card className="p-6 rounded-[2rem] border-none bg-slate-50 space-y-6">
                 <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Store Philosophy</h3>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{selectedSeller.description}</p>
                 </div>
                 
                 <div className="space-y-4 pt-4 border-t border-slate-200/50">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-slate-400">
                          <MapPin size={16} />
                          <span className="text-xs font-bold">Location</span>
                       </div>
                       <span className="text-xs font-black text-slate-700">{selectedSeller.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-slate-400">
                          <Package size={16} />
                          <span className="text-xs font-bold">Total Items</span>
                       </div>
                       <span className="text-xs font-black text-slate-700">{selectedSeller.itemsCount} Products</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-slate-400">
                          <Tag size={16} />
                          <span className="text-xs font-bold">Member Since</span>
                       </div>
                       <span className="text-xs font-black text-slate-700">{selectedSeller.joinedDate}</span>
                    </div>
                 </div>
              </Card>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search in store..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-teal-500/10 outline-none font-bold text-sm"
                />
              </div>
           </div>

           {/* Inventory Grid */}
           <div className="lg:col-span-3">
              {storeItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {storeItems.map((item) => (
                    <Card key={item.id} className="group p-0 rounded-[2rem] bg-white border border-slate-50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <div className="aspect-square relative overflow-hidden bg-slate-100">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-black text-[9px] uppercase px-3 py-1.5 rounded-full">
                            {item.condition}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-5 space-y-4">
                        <div>
                          <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-1">{item.category}</p>
                          <h4 className="text-md font-black text-slate-800 line-clamp-1 uppercase tracking-tighter">{item.title}</h4>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-lg font-black text-slate-900">{item.priceTag}</span>
                          <Button 
                            onClick={() => handleAddToCart(item)}
                            className="h-10 w-10 p-0 rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition-all shadow-sm"
                          >
                            <Plus size={20} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 text-slate-300 shadow-sm">
                    <Search size={32} />
                  </div>
                  <p className="text-slate-400 font-bold">No matching items found in this store.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Dynamic Marketplace Header */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-200">
                <ShoppingBag size={24} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">
                Findr <span className="text-teal-600">Market</span>
              </h2>
            </div>
            <p className="text-slate-500 font-medium max-w-lg">
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
                <p className="text-lg font-black text-slate-900">{SAMPLE_SELLERS.length} Stores</p>
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

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-10">
        <div className="relative w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search stores or shop owners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-5 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none font-bold text-slate-700 transition-all"
          />
        </div>
      </div>

      {/* Sellers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
        {filteredSellers.map((seller) => (
          <Card 
            key={seller.id} 
            className="group p-0 rounded-[3rem] bg-white border-none shadow-sm hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-500 overflow-hidden relative flex flex-col"
          >
            {/* Store Banner */}
            <div className="h-40 w-full overflow-hidden relative">
               <img 
                 src={seller.bannerImage || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format'} 
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                 alt={seller.storeName} 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
               <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-amber-600 px-3 py-1.5 rounded-2xl shadow-sm">
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs font-black">{seller.rating}</span>
                  </div>
               </div>
            </div>

            <div className="px-6 pb-6 pt-0 relative flex-1 flex flex-col">
               {/* Owner Avatar - Circular and overlapping the banner */}
               <div className="flex justify-between items-end -mt-10 mb-4 relative z-20">
                  <Avatar className="w-20 h-20 rounded-full border-[6px] border-white shadow-xl bg-white overflow-hidden">
                     <img src={seller.avatar} alt={seller.ownerName} className="w-full h-full object-cover" />
                  </Avatar>
                  <div className="pb-1">
                     <Badge className="bg-teal-50 text-teal-600 border-none font-black text-[9px] uppercase px-3 py-1.5 rounded-full shadow-sm">
                        Verified Shop
                     </Badge>
                  </div>
               </div>

               <div className="space-y-4 flex-1">
                 <div>
                   <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tighter group-hover:text-teal-600 transition-colors">
                     {seller.storeName}
                   </h3>
                   <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Owner: <span className="text-slate-600">{seller.ownerName}</span>
                      </p>
                   </div>
                 </div>

                 <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed h-10 mb-2">
                   {seller.description}
                 </p>

                 <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-slate-400">
                       <Package size={14} className="text-teal-500" />
                       <span className="text-[10px] font-black uppercase tracking-wider">{seller.itemsCount} Items</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                       <MapPin size={14} className="text-rose-500" />
                       <span className="text-[10px] font-black uppercase tracking-wider">{seller.location}</span>
                    </div>
                 </div>

                 <Button 
                   onClick={() => { setSelectedSeller(seller); setSearchQuery(''); }}
                   className="w-full bg-slate-900 hover:bg-teal-600 text-white rounded-[1.5rem] h-14 font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 border-none shadow-lg shadow-slate-900/10"
                 >
                   Visit Store <ChevronRight size={18} />
                 </Button>
               </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
