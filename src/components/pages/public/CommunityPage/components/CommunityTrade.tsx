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
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradeItem {
  id: string;
  title: string;
  priceTag: string;
  category: string;
  seller: {
    name: string;
    avatar?: string;
    rating: number;
    isVerified: boolean;
  };
  location: string;
  imageUrl: string;
  condition: 'Brand New' | 'Like New' | 'Used';
}

const SAMPLE_TRADE_ITEMS: TradeItem[] = [
  {
    id: '1',
    title: 'Emergency Power Station 500W',
    priceTag: '₱12,500',
    category: 'Electronics',
    condition: 'Brand New',
    location: 'Zone 1 Central',
    imageUrl: 'https://images.unsplash.com/photo-1621360841013-c7683c659ec6?w=500&auto=format',
    seller: { name: 'Mario Rossi', rating: 4.9, isVerified: true }
  },
  {
    id: '2',
    title: 'Heavy Duty First Aid Kit',
    priceTag: '₱2,200',
    category: 'Health',
    condition: 'Like New',
    location: 'Sitio Maligaya',
    imageUrl: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=500&auto=format',
    seller: { name: 'Elena Gilbert', rating: 4.8, isVerified: true }
  },
  {
    id: '3',
    title: 'Solar Panel System 100W',
    priceTag: '₱4,500',
    category: 'Hardware',
    condition: 'Used',
    location: 'Central Plaza',
    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=500&auto=format',
    seller: { name: 'Jon Snow', rating: 5.0, isVerified: true }
  },
  {
    id: '4',
    title: 'LPG Gas Stove (Single burner)',
    priceTag: '₱850',
    category: 'Kitchen',
    condition: 'Used',
    location: 'Zone 4 Outer',
    imageUrl: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?w=500&auto=format',
    seller: { name: 'Sansa Stark', rating: 4.5, isVerified: false }
  },
];

export const CommunityTrade: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Electronics', 'Hard Goods', 'Essentials', 'Clothing', 'Services'];

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
              Support local trade within your community. Buy, sell, or barter essential items with verified neighbors.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Active Trades</p>
                <p className="text-lg font-black text-slate-900">124 Items</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                <Package size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Safe Spot</p>
                <p className="text-lg font-black text-slate-900">Community Hall</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-10">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                activeCategory === cat 
                  ? "bg-slate-900 text-white border-slate-900 shadow-xl" 
                  : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50 shadow-sm"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search for items, tools, gear..."
            className="w-full pl-14 pr-6 py-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none font-bold text-slate-700 transition-all"
          />
        </div>
      </div>

      {/* Marketplace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-32">
        {SAMPLE_TRADE_ITEMS.map((item) => (
          <Card key={item.id} className="group p-0 rounded-[2.5rem] bg-white border-none shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden relative">
            <div className="aspect-[4/5] relative overflow-hidden">
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-black text-[10px] uppercase px-3 py-1.5 rounded-full shadow-lg">
                  {item.condition}
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 border-2 border-white/50 shadow-sm">
                      {item.seller.name.charAt(0)}
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-[9px] font-black text-white/70 uppercase">Seller</p>
                      <p className="text-xs font-bold text-white tracking-tight">{item.seller.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 bg-black/20 px-2 py-1 rounded-xl">
                    <Star size={10} fill="currentColor" />
                    <span className="text-[10px] font-black">{item.seller.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">{item.category}</p>
                  <h3 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tighter group-hover:text-teal-600 transition-colors">
                    {item.title}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Price</p>
                  <p className="text-xl font-black text-slate-900 tracking-tighter">{item.priceTag}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                <MapPin size={14} className="text-rose-500" />
                {item.location}
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-12 font-black text-xs uppercase tracking-widest shadow-lg shadow-teal-100 transition-all flex items-center gap-2">
                  <MessageCircle size={16} /> Contact Seller
                </Button>
                <Button variant="outline" className="w-12 h-12 rounded-2xl border-slate-100 hover:bg-slate-50 flex items-center justify-center p-0">
                  <ArrowUpRight size={20} className="text-slate-400" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
