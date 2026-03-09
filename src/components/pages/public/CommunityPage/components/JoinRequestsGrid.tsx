import React, { useState, useMemo } from 'react';
import { Badge, Button } from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JoinRequest } from '@/types/community';

interface JoinRequestsGridProps {
  requests: JoinRequest[];
  processingId: number | string | null;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  onRefresh?: () => void;
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
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | null;
    request: JoinRequest | null;
  }>({
    isOpen: false,
    type: null,
    request: null,
  });

  const filteredRequests = useMemo(() => {
    if (!Array.isArray(requests)) return [];
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

  // Handle opening confirmation dialog
  const handleConfirmAction = (type: 'approve' | 'reject', request: JoinRequest) => {
    setConfirmDialog({
      isOpen: true,
      type,
      request,
    });
  };

  // Handle executing the confirmed action
  const handleExecuteAction = async () => {
    if (!confirmDialog.request || !confirmDialog.type) return;

    const { type, request } = confirmDialog;

    // Close dialog first
    setConfirmDialog({ isOpen: false, type: null, request: null });

    // Execute the action
    if (type === 'approve') {
      await onApprove(request.userId);
    } else if (type === 'reject') {
      await onReject(request.userId);
    }
  };

  // Handle canceling the confirmation
  const handleCancelAction = () => {
    setConfirmDialog({ isOpen: false, type: null, request: null });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900">Join Requests</h3>
          <p className="text-sm text-slate-600">
            {filteredRequests.length} pending request{filteredRequests.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
        {onRefresh && (
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </Button>
        )}
      </div>

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
                const requestDate = new Date(request.requestedDate);
                const daysAgo = Math.floor(
                  (new Date().getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <tr key={request.userId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900 text-sm">{request.userFullName}</p>
                      <p className="text-xs text-slate-600">@{request.userName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 break-all">{request.userEmail || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={cn(
                        "border-none font-black text-[9px] uppercase tracking-widest px-3 py-1.5",
                        request.status === 'pending' ? "bg-amber-100 text-amber-700" :
                        request.status === 'approved' ? "bg-green-100 text-green-700" :
                        request.status === 'rejected' ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      )}>
                        {request.status || 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-600">
                        {daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          onClick={() => handleConfirmAction('approve', request)}
                          disabled={processingId === parseInt(request.userId) || processingId === request.userId}
                          size="sm"
                          className="h-9 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          title="Approve join request"
                        >
                          {(processingId === parseInt(request.userId) || processingId === request.userId) ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              <span className="text-xs">Approving...</span>
                            </>
                          ) : (
                            <>
                              <Check size={16} />
                              <span className="text-xs">Approve</span>
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleConfirmAction('reject', request)}
                          disabled={processingId === parseInt(request.userId) || processingId === request.userId}
                          variant="outline"
                          size="sm"
                          className="h-9 px-4 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          title="Reject join request"
                        >
                          {(processingId === parseInt(request.userId) || processingId === request.userId) ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              <span className="text-xs">Rejecting...</span>
                            </>
                          ) : (
                            <>
                              <X size={16} />
                              <span className="text-xs">Reject</span>
                            </>
                          )}
                        </Button>
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

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={handleCancelAction}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-full",
                confirmDialog.type === 'approve' 
                  ? "bg-emerald-100 text-emerald-600" 
                  : "bg-rose-100 text-rose-600"
              )}>
                {confirmDialog.type === 'approve' ? (
                  <Check size={20} />
                ) : (
                  <AlertTriangle size={20} />
                )}
              </div>
              <div>
                <DialogTitle className="text-left">
                  {confirmDialog.type === 'approve' ? 'Approve Join Request' : 'Reject Join Request'}
                </DialogTitle>
                <DialogDescription className="text-left">
                  Are you sure you want to {confirmDialog.type === 'approve' ? 'approve' : 'reject'} the join request from{' '}
                  <span className="font-semibold text-slate-900">
                    {confirmDialog.request?.userFullName}
                  </span>
                  ?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Name:</span>
                  <span className="font-medium text-slate-900">{confirmDialog.request?.userFullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Username:</span>
                  <span className="font-medium text-slate-900">@{confirmDialog.request?.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Email:</span>
                  <span className="font-medium text-slate-900 break-all">{confirmDialog.request?.userEmail || 'Not provided'}</span>
                </div>
              </div>
            </div>
            
            <div className={cn(
              "mt-4 p-3 rounded-lg border text-sm",
              confirmDialog.type === 'approve'
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            )}>
              <p className="font-medium">
                {confirmDialog.type === 'approve' 
                  ? '✅ This user will be granted access to the community.'
                  : '❌ This user will be denied access to the community.'
                }
              </p>
              <p className="text-xs mt-1 opacity-75">
                {confirmDialog.type === 'approve'
                  ? 'They will receive a notification about their approval.'
                  : 'They will receive a notification about the rejection.'
                }
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancelAction}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecuteAction}
              className={cn(
                "flex-1",
                confirmDialog.type === 'approve'
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-rose-600 hover:bg-rose-700 text-white"
              )}
            >
              {confirmDialog.type === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JoinRequestsGrid;
