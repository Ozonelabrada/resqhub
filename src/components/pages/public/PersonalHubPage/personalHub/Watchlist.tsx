import React, { useState } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { Heart, Search, Clock, Filter } from 'lucide-react';
import { useWatchList } from '@/hooks';

export const Watchlist: React.FC = () => {
  const { items, loading } = useWatchList();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search saved items..."
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-teal-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="ghost" className="rounded-2xl font-bold bg-slate-50 text-slate-600">
           <Filter size={18} className="mr-2" /> Filter
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {[1,2,3,4].map(i => <div key={i} className="h-48 bg-slate-50 rounded-4xl animate-pulse" />)}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group overflow-hidden border border-slate-50 shadow-sm bg-white rounded-4xl hover:shadow-xl transition-all duration-500">
              <div className="relative h-48 overflow-hidden">
                <img 
                  // src={item.} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/95 backdrop-blur text-teal-600 border-none font-black px-3 py-1.5 text-[10px] uppercase tracking-wider shadow-md rounded-xl">
                    {item.similarity}% Match
                  </Badge>
                </div>
                <div className="absolute top-4 left-4">
                  <button className="p-2.5 bg-white/95 backdrop-blur text-red-500 rounded-xl transition-all shadow-md hover:scale-110">
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-teal-50 text-teal-600 rounded-lg">
                    {item.type}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 px-2.5 py-1 border border-slate-100 rounded-lg uppercase tracking-widest">
                    {item.location}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-teal-600 transition-colors">{item.title}</h3>
                <p className="text-xs text-slate-500 font-bold mb-6 flex items-center gap-1.5 focus:text-slate-900">
                   <Clock size={12} /> {item.date}
                </p>
                <div className="pt-5 border-t border-slate-50 flex justify-between items-center">
                   <span className="text-xs font-bold text-slate-400">{item.location}</span>
                   <Button variant="ghost" className="text-teal-600 font-black text-xs uppercase tracking-widest hover:bg-teal-50 rounded-xl h-9">
                      Details
                   </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-4xl">
           <Heart size={48} className="mx-auto text-slate-200 mb-4" />
           <h3 className="text-lg font-black text-slate-900">Your watchlist is empty</h3>
           <p className="text-slate-500 font-medium mt-1">Save items to track potential matches here.</p>
        </div>
      )}
    </div>
  );
};
