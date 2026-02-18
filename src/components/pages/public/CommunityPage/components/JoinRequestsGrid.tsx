import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JoinRequest } from '@/types/community';

interface JoinRequestsGridProps {
  requests: (JoinRequest | any)[];
  processingId: number | null;
  onApprove: (requestId: number, userId: string) => void;
  onReject: (requestId: number, userId: string) => void;
  onViewProfile: (userId: string) => void;
}

/**
 * Join requests table component with pagination and search
 */
const JoinRequestsGrid: React.FC<JoinRequestsGridProps> = ({
  requests,
  processingId,
  onApprove,
  onReject,
  onViewProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = 
        (request.userFullName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (request.userName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (request.userEmail?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [requests, searchQuery]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="space-y-6 pb-20">
      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search by name, username, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all font-bold text-slate-700"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Name</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Email</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Requested</th>
              <th className="px-6 py-4 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="text-slate-500 font-semibold">No join requests found</p>
                </td>
              </tr>
            ) : (
              paginatedRequests.map((request) => {
                const requestDate = new Date(request.dateCreated);
                const daysAgo = Math.floor(
                  (new Date().getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <tr key={request.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900 text-sm">{request.userFullName}</p>
                      <p className="text-xs text-slate-600">@{request.userName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 break-all">{request.userEmail || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1.5">
                        Pending
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-600">
                        {daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onApprove(request.id, request.userId)}
                          disabled={processingId === request.id}
                          className="p-2 rounded-lg hover:bg-green-100 text-slate-600 hover:text-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Approve request"
                        >
                          {processingId === request.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Check size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => onReject(request.id, request.userId)}
                          disabled={processingId === request.id}
                          className="p-2 rounded-lg hover:bg-red-100 text-slate-600 hover:text-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reject request"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredRequests.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-500">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
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
                      ? "bg-amber-500 text-white"
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
    </div>
  );
};

export default JoinRequestsGrid;
