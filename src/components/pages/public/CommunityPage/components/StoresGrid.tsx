import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui';
import {
  Clock,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
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
 * Stores/Sellers table component with status tabs, pagination and search
 */
const StoresGrid: React.FC<StoresGridProps> = ({
  stores,
  isLoading,
  activeTab,
  statusCounts,
  onViewDetails,
  onTabChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statusTabs = [
    { id: 'pending', label: 'Pending', count: statusCounts.pending, icon: Clock, color: 'blue' },
    { id: 'approved', label: 'Approved', count: statusCounts.approved, icon: CheckCircle2, color: 'emerald' },
    { id: 'denied', label: 'Denied', count: statusCounts.rejected || 0, icon: X, color: 'rose' },
    { id: 'suspended', label: 'Suspended', count: statusCounts.suspended, icon: AlertCircle, color: 'amber' },
  ];

  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const matchesSearch = 
        store.storeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.storeEmail?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [stores, searchQuery]);

  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStores = filteredStores.slice(startIndex, endIndex);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const getStatusColor = (tab: string) => {
    switch (tab) {
      case 'pending': return 'blue';
      case 'approved': return 'emerald';
      case 'denied': return 'rose';
      case 'suspended': return 'amber';
      default: return 'slate';
    }
  };

  const statusColor = getStatusColor(activeTab);

  return (
    <div className="space-y-6 pb-20">
      {/* Status Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl w-full overflow-x-auto">
        {statusTabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id as any)}
              className={cn(
                "px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-[0.1em] transition-all flex items-center gap-1.5 whitespace-nowrap",
                activeTab === tab.id
                  ? `bg-${tab.color}-500 text-white shadow-lg`
                  : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <TabIcon size={14} />
              {tab.label}
              <Badge
                className={cn(
                  'border-none px-1.5 py-0 min-w-[20px] h-5 text-[9px]',
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-slate-200 text-slate-600'
                )}
              >
                {tab.count}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search by store name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
        />
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Store Name</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Verified</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p className="text-slate-500 font-semibold">No stores found</p>
                    </td>
                  </tr>
                ) : (
                  paginatedStores.map((store) => (
                    <tr key={store.storeId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm font-black text-white">
                            {store.storeName?.charAt(0) || 'S'}
                          </div>
                          <p className="font-black text-slate-900 text-sm">{store.storeName || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 break-all">{store.storeEmail || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={cn(
                          "border-none font-black text-[9px] uppercase tracking-widest px-3 py-1.5",
                          activeTab === 'pending' && 'bg-blue-100 text-blue-700',
                          activeTab === 'approved' && 'bg-emerald-100 text-emerald-700',
                          activeTab === 'denied' && 'bg-rose-100 text-rose-700',
                          activeTab === 'suspended' && 'bg-amber-100 text-amber-700'
                        )}>
                          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {store.isVerified ? (
                            <>
                              <CheckCircle2 size={16} className="text-emerald-600" />
                              <span className="text-sm font-bold text-slate-600">Yes</span>
                            </>
                          ) : (
                            <>
                              <X size={16} className="text-slate-400" />
                              <span className="text-sm font-bold text-slate-600">No</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onViewDetails(store)}
                            className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-emerald-600 transition-all"
                            title="View details"
                          >
                            <ExternalLink size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredStores.length > itemsPerPage && (
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-500">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredStores.length)} of {filteredStores.length} store{filteredStores.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "px-3 py-1 rounded-lg font-bold text-sm transition-all",
                        currentPage === page
                          ? `bg-${statusColor}-500 text-white`
                          : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StoresGrid;
