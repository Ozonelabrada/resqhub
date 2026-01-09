import React, { useState } from 'react';
import { Card, Avatar, Button, ShadcnBadge as Badge } from '@/components/ui';
import { 
  HeartHandshake, 
  Package, 
  Clock, 
  MapPin, 
  MessageSquare,
  ShieldCheck,
  Search,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Need {
  id: string;
  title: string;
  description: string;
  category: 'Resource' | 'Service' | 'Volunteer' | 'Emergency';
  priority: 'low' | 'medium' | 'high';
  requester: {
    name: string;
    avatar?: string;
    isVerified: boolean;
  };
  location: string;
  postedAt: string;
  respondersCount: number;
}

const MOCK_NEEDS: Need[] = [
  {
    id: '1',
    title: 'Food Assistance for Elderly Couple',
    description: 'Looking for someone who can help deliver groceries once a week for an elderly couple in the neighborhood. They have mobility issues.',
    category: 'Service',
    priority: 'high',
    requester: { name: 'Juan Dela Cruz', isVerified: true },
    location: 'Bacolod City',
    postedAt: '2 hours ago',
    respondersCount: 3
  },
  {
    id: '2',
    title: 'Extra Medical Supplies (Bandages/Alcohol)',
    description: 'We are organizing a local first-aid kit for the community center. Any spare unopened bandages or alcohol would be greatly appreciated.',
    category: 'Resource',
    priority: 'medium',
    requester: { name: 'Maria Santos', isVerified: true },
    location: 'District 4',
    postedAt: '5 hours ago',
    respondersCount: 0
  },
  {
    id: '3',
    title: 'Street Clean-up Volunteers',
    description: 'Need 5-10 volunteers this Saturday for our monthly street clean-up drive. Bags and gloves will be provided.',
    category: 'Volunteer',
    priority: 'low',
    requester: { name: 'Community Admin', isVerified: true },
    location: 'Central Plaza',
    postedAt: 'Yesterday',
    respondersCount: 12
  }
];

export const NeedsBoard: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'Resource' | 'Service' | 'Volunteer' | 'Emergency'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNeeds = MOCK_NEEDS.filter(need => {
    const matchesFilter = filter === 'all' || need.category === filter;
    const matchesSearch = need.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         need.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-teal-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
            <HeartHandshake className="text-rose-500" size={32} />
            Community Needs
          </h2>
          <p className="text-slate-500 font-medium">Help your neighbors by fulfilling requests or providing resources.</p>
        </div>
        
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search needs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-3xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none transition-all font-bold text-slate-700"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {(['all', 'Resource', 'Service', 'Volunteer', 'Emergency'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border",
              filter === f 
                ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                : "bg-white text-slate-500 hover:bg-slate-50 border-slate-100 shadow-sm"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Needs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {filteredNeeds.map((need) => (
          <Card key={need.id} className="group relative bg-white border-none shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 rounded-[2.5rem] overflow-hidden flex flex-col h-full border border-slate-50">
            {/* Priority Indicator */}
            <div className={cn("absolute top-0 left-0 w-2 h-full", getPriorityColor(need.priority))} />
            
            <div className="p-8 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-none px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest">
                  {need.category}
                </Badge>
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                  <Clock size={14} />
                  {need.postedAt}
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
                {need.title}
              </h3>
              
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8 flex-1">
                {need.description}
              </p>

              <div className="space-y-6">
                {/* Requester Info - Privacy Conscious */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-white shadow-sm ring-1 ring-slate-100 font-bold bg-slate-50">
                      {need.requester.name.charAt(0)}
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-black text-slate-800">{need.requester.name}</span>
                        {need.requester.isVerified && <ShieldCheck className="text-teal-500" size={14} />}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <MapPin size={10} />
                        {need.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-teal-600 bg-teal-50 px-3 py-1.5 rounded-xl">
                    <Users size={14} />
                    <span className="text-[10px] font-black">{need.respondersCount} Helping</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full rounded-2xl border-slate-100 hover:bg-slate-50 font-black text-xs text-slate-600 h-12 uppercase tracking-widest">
                    Details
                  </Button>
                  <Button className="w-full rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs h-12 uppercase tracking-widest shadow-lg shadow-teal-100">
                    Respond
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredNeeds.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Package size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No needs found</h3>
            <p className="text-slate-500 font-medium">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {/* Post a Need CTA */}
      <Card className="p-10 rounded-[3rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black mb-3">Don't see what you need?</h3>
            <p className="text-slate-400 font-medium max-w-md">
              Submit a request to the community. Whether it's a resource, a service, or a call for volunteers.
            </p>
          </div>
          <Button className="bg-white hover:bg-teal-50 text-slate-900 h-14 rounded-2xl px-10 font-black shadow-xl transition-all active:scale-95 whitespace-nowrap">
            Submit a Request
          </Button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-teal-500/20 transition-colors duration-700"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] -ml-24 -mb-24"></div>
      </Card>
    </div>
  );
};
