import React from 'react';
import { Card, Button, ShadcnBadge as Badge } from '@/components/ui';
import {
  Clock,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  ShoppingBag,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoreStatusCounts {
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
}

interface StoresGridProps {
  stores: any[];
  isLoading: boolean;
  activeTab: 'pending' | 'approved' | 'denied' | 'suspended';
  statusCounts: StoreStatusCounts;
  onViewDetails: (store: any) => void;
  onTabChange?: (tab: 'pending' | 'approved' | 'rejected' | 'suspended') => void;
}

/**
 * Stores/Sellers grid component
 * <180 lines - handles store listings and status filtering
 */
const StoresGrid: React.FC<StoresGridProps> = ({
  stores,
  isLoading,
  activeTab,
  statusCounts,
  onViewDetails,
  onTabChange,
}) => {
  const getStatusConfig = (tab: string) => {
    switch (tab) {
      case 'pending':
        return { color: 'blue', icon: Clock, label: 'Pending Store Applications' };
      case 'approved':
        return { color: 'emerald', icon: CheckCircle2, label: 'Approved Stores' };
      case 'denied':
        return { color: 'rose', icon: X, label: 'Denied Stores' };
      case 'suspended':
        return { color: 'amber', icon: AlertCircle, label: 'Suspended Stores' };
      default:
        return { color: 'slate', icon: ShoppingBag, label: 'Stores' };
    }
  };

  const config = getStatusConfig(activeTab);
  const IconComponent = config.icon;

  const statusTabs = [
    { id: 'pending', label: 'Pending', count: statusCounts.pending, icon: Clock, color: 'blue' },
    { id: 'approved', label: 'Approved', count: statusCounts.approved, icon: CheckCircle2, color: 'emerald' },
    { id: 'denied', label: 'Denied', count: statusCounts.denied, icon: X, color: 'rose' },
    { id: 'suspended', label: 'Suspended', count: statusCounts.suspended, icon: AlertCircle, color: 'amber' },
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* Status Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl w-full overflow-x-auto">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id as 'pending' | 'approved' | 'denied' | 'suspended')}
            className={cn(
              "px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-[0.1em] transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === tab.id
                ? `bg-${tab.color}-500 text-white shadow-lg shadow-${tab.color}-100`
                : 'text-slate-400 hover:text-slate-600'
            )}
          >
            <tab.icon size={12} />
            {tab.label}
            <Badge
              className={cn(
                'border-none px-1.5 py-0 min-w-[20px] h-5 text-[10px]',
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-slate-200 text-slate-600'
              )}
            >
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
            <IconComponent
              className={cn(
                'size-7',
                activeTab === 'pending' && 'text-blue-600',
                activeTab === 'approved' && 'text-emerald-600',
                activeTab === 'denied' && 'text-rose-600',
                activeTab === 'suspended' && 'text-amber-600'
              )}
            />
            {config.label}
          </h3>
          <p className="text-slate-500 font-medium mt-1">
            {activeTab === 'pending' && 'Stores awaiting approval to sell in the community'}
            {activeTab === 'approved' && 'Stores approved to sell in the community'}
            {activeTab === 'denied' && 'Stores that did not meet community requirements'}
            {activeTab === 'suspended' && 'Stores with suspended selling privileges'}
          </p>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
        </div>
      ) : stores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <Card
              key={store.storeId}
              className={cn(
                'group relative p-0 rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50 shadow-sm hover:shadow-2xl hover:border-opacity-50 transition-all duration-300 overflow-hidden flex flex-col h-full',
                activeTab === 'pending' && 'border border-blue-100 hover:shadow-blue-100/30 hover:border-blue-200',
                activeTab === 'approved' && 'border border-emerald-100 hover:shadow-emerald-100/30 hover:border-emerald-200',
                activeTab === 'denied' && 'border border-rose-100 hover:shadow-rose-100/30 hover:border-rose-200',
                activeTab === 'suspended' && 'border border-amber-100 hover:shadow-amber-100/30 hover:border-amber-200'
              )}
            >
              <div
                className={cn(
                  'h-1.5 transition-all',
                  activeTab === 'pending' && 'bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:from-blue-500 group-hover:to-cyan-500',
                  activeTab === 'approved' && 'bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-500',
                  activeTab === 'denied' && 'bg-gradient-to-r from-rose-400 to-pink-400 group-hover:from-rose-500 group-hover:to-pink-500',
                  activeTab === 'suspended' && 'bg-gradient-to-r from-amber-400 to-orange-400 group-hover:from-amber-500 group-hover:to-orange-500'
                )}
              />

              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <Badge
                  className={cn(
                    'border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5 shadow-sm flex items-center gap-1 w-fit',
                    activeTab === 'pending' && 'bg-blue-100 text-blue-700',
                    activeTab === 'approved' && 'bg-emerald-100 text-emerald-700',
                    activeTab === 'denied' && 'bg-rose-100 text-rose-700',
                    activeTab === 'suspended' && 'bg-amber-100 text-amber-700'
                  )}
                >
                  <IconComponent size={10} />
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </Badge>
              </div>

              <div className="px-6 py-8 flex-1 flex flex-col items-center text-center space-y-4">
                <div
                  className={cn(
                    'w-16 h-16 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center font-black text-lg text-white',
                    activeTab === 'pending' && 'bg-blue-400',
                    activeTab === 'approved' && 'bg-emerald-400',
                    activeTab === 'denied' && 'bg-rose-400',
                    activeTab === 'suspended' && 'bg-amber-400'
                  )}
                >
                  {store.storeName?.charAt(0)}
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">
                    {store.storeName}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 font-mono mb-2">
                    ID: {store.storeId}
                  </p>
                  {store.location && (
                    <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                      <MapPin size={12} />
                      {store.location}
                    </p>
                  )}
                </div>
              </div>

              <div className="px-6 pb-6 border-t border-slate-100">
                <Button
                  onClick={() => onViewDetails(store)}
                  className={cn(
                    'w-full h-10 rounded-xl text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2',
                    activeTab === 'pending' && 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
                    activeTab === 'approved' && 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
                    activeTab === 'denied' && 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
                    activeTab === 'suspended' && 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                  )}
                >
                  <ExternalLink size={14} />
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
          <ShoppingBag size={48} className="text-slate-300 mb-4" />
          <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">
            {activeTab === 'pending' && 'No Pending Applications'}
            {activeTab === 'approved' && 'No Approved Stores'}
            {activeTab === 'denied' && 'No Denied Stores'}
            {activeTab === 'suspended' && 'No Suspended Stores'}
          </h3>
        </div>
      )}
    </div>
  );
};

export default StoresGrid;
