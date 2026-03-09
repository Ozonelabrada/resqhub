import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Spinner, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  MapPin,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  Eye,
  Trash2,
  QrCode,
  Smartphone,
  Monitor
} from 'lucide-react';
import { CommunityService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface CheckIn {
  id: string | number;
  userId: string | number;
  userName: string;
  userAvatar?: string;
  eventId: string | number;
  eventTitle: string;
  checkInTime: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  checkInMethod: 'qr_code' | 'manual' | 'web';
  verificationMethod: 'qr_code' | 'manual' | 'web';
  notes?: string;
  moderatorNotes?: string;
  moderatorId?: string | number;
  moderatorName?: string;
  processedAt?: string;
}

interface EventCheckInsProps {
  eventId: string | number;
  eventTitle: string;
  isModerator?: boolean;
  className?: string;
}

export const EventCheckIns: React.FC<EventCheckInsProps> = ({
  eventId,
  eventTitle,
  isModerator = false,
  className
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const pageSize = 20;

  const loadCheckIns = useCallback(async () => {
    try {
      setLoading(true);
      const result = await CommunityService.getEventCheckIns(eventId, page, pageSize);
      setCheckIns(result.checkIns);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error loading check-ins:', error);
      toast.error(t('checkIns.loadError', 'Failed to load check-ins'));
    } finally {
      setLoading(false);
    }
  }, [eventId, page, pageSize, t]);

  useEffect(() => {
    loadCheckIns();
  }, [loadCheckIns]);

  const handleApproveCheckIn = async (checkInId: string | number) => {
    if (!isModerator) return;

    try {
      setProcessing(checkInId.toString());
      const result = await CommunityService.approveCheckIn(eventId, checkInId);

      if (result.success) {
        toast.success(t('checkIns.approved', 'Check-in approved'));
        await loadCheckIns();
      } else {
        toast.error(result.message || t('checkIns.approveError', 'Failed to approve check-in'));
      }
    } catch (error) {
      console.error('Error approving check-in:', error);
      toast.error(t('checkIns.approveError', 'Failed to approve check-in'));
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectCheckIn = async (checkInId: string | number) => {
    if (!isModerator) return;

    try {
      setProcessing(checkInId.toString());
      const result = await CommunityService.rejectCheckIn(eventId, checkInId);

      if (result.success) {
        toast.success(t('checkIns.rejected', 'Check-in rejected'));
        await loadCheckIns();
      } else {
        toast.error(result.message || t('checkIns.rejectError', 'Failed to reject check-in'));
      }
    } catch (error) {
      console.error('Error rejecting check-in:', error);
      toast.error(t('checkIns.rejectError', 'Failed to reject check-in'));
    } finally {
      setProcessing(null);
    }
  };

  const handleCancelCheckIn = async (checkInId: string | number) => {
    if (!isModerator) return;

    if (!confirm(t('checkIns.confirmCancel', 'Are you sure you want to cancel this check-in?'))) {
      return;
    }

    try {
      setProcessing(checkInId.toString());
      const result = await CommunityService.cancelCheckIn(eventId, checkInId);

      if (result.success) {
        toast.success(t('checkIns.cancelled', 'Check-in cancelled'));
        await loadCheckIns();
      } else {
        toast.error(result.message || t('checkIns.cancelError', 'Failed to cancel check-in'));
      }
    } catch (error) {
      console.error('Error cancelling check-in:', error);
      toast.error(t('checkIns.cancelError', 'Failed to cancel check-in'));
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: CheckIn['status']) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {t('checkIns.status.approved', 'Approved')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            {t('checkIns.status.rejected', 'Rejected')}
          </Badge>
        );
      case 'pending_approval':
      default:
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {t('checkIns.status.pending', 'Pending')}
          </Badge>
        );
    }
  };

  const getMethodIcon = (method: CheckIn['checkInMethod']) => {
    switch (method) {
      case 'qr_code':
        return <QrCode className="w-4 h-4" />;
      case 'manual':
        return <User className="w-4 h-4" />;
      case 'web':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Smartphone className="w-4 h-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && checkIns.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('checkIns.title', 'Event Check-ins')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {eventTitle} • {totalCount} {t('checkIns.total', 'total check-ins')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadCheckIns}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          {t('common.refresh', 'Refresh')}
        </Button>
      </div>

      {/* Check-ins List */}
      {checkIns.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <QrCode className="w-12 h-12 text-gray-400" />
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('checkIns.noCheckIns', 'No check-ins yet')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('checkIns.noCheckInsDesc', 'Check-ins will appear here once users scan QR codes')}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {checkIns.map((checkIn) => (
            <Card key={checkIn.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Avatar
                    src={checkIn.userAvatar}
                    alt={checkIn.userName}
                    size="sm"
                    fallback={checkIn.userName.charAt(0).toUpperCase()}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {checkIn.userName}
                      </span>
                      {getStatusBadge(checkIn.status)}
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        {getMethodIcon(checkIn.checkInMethod)}
                        <span className="text-xs">
                          {checkIn.checkInMethod === 'qr_code' ? 'QR' :
                           checkIn.checkInMethod === 'manual' ? 'Manual' : 'Web'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateTime(checkIn.checkInTime)}
                      </div>
                      {checkIn.processedAt && (
                        <div className="flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {t('checkIns.processedAt', 'Processed')}: {formatDateTime(checkIn.processedAt)}
                        </div>
                      )}
                    </div>

                    {checkIn.notes && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {checkIn.notes}
                      </p>
                    )}

                    {checkIn.moderatorNotes && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>{t('checkIns.moderatorNotes', 'Moderator notes')}:</strong> {checkIn.moderatorNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCheckIn(checkIn);
                      setShowDetailsModal(true);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('common.view', 'View')}</span>
                  </Button>

                  {isModerator && checkIn.status === 'pending_approval' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApproveCheckIn(checkIn.id)}
                        disabled={processing === checkIn.id.toString()}
                        className="flex items-center gap-1"
                      >
                        {processing === checkIn.id.toString() ? (
                          <Spinner size="sm" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">{t('checkIns.approve', 'Approve')}</span>
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRejectCheckIn(checkIn.id)}
                        disabled={processing === checkIn.id.toString()}
                        className="flex items-center gap-1"
                      >
                        {processing === checkIn.id.toString() ? (
                          <Spinner size="sm" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">{t('checkIns.reject', 'Reject')}</span>
                      </Button>
                    </>
                  )}

                  {isModerator && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelCheckIn(checkIn.id)}
                      disabled={processing === checkIn.id.toString()}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      {processing === checkIn.id.toString() ? (
                        <Spinner size="sm" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">{t('checkIns.cancel', 'Cancel')}</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            {t('common.previous', 'Previous')}
          </Button>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('common.pageOf', 'Page {{current}} of {{total}}', { current: page, total: totalPages })}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            {t('common.next', 'Next')}
          </Button>
        </div>
      )}

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('checkIns.details', 'Check-in Details')}</DialogTitle>
          </DialogHeader>

          {selectedCheckIn && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={selectedCheckIn.userAvatar}
                  alt={selectedCheckIn.userName}
                  size="md"
                  fallback={selectedCheckIn.userName.charAt(0).toUpperCase()}
                />
                <div>
                  <h4 className="font-medium">{selectedCheckIn.userName}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedCheckIn.eventTitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">
                    {t('checkIns.status', 'Status')}:
                  </label>
                  <div className="mt-1">{getStatusBadge(selectedCheckIn.status)}</div>
                </div>

                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">
                    {t('checkIns.method', 'Method')}:
                  </label>
                  <div className="mt-1 flex items-center gap-1">
                    {getMethodIcon(selectedCheckIn.checkInMethod)}
                    <span>
                      {selectedCheckIn.checkInMethod === 'qr_code' ? 'QR Code' :
                       selectedCheckIn.checkInMethod === 'manual' ? 'Manual' : 'Web'}
                    </span>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="font-medium text-gray-700 dark:text-gray-300">
                    {t('checkIns.checkInTime', 'Check-in Time')}:
                  </label>
                  <p className="mt-1">{formatDateTime(selectedCheckIn.checkInTime)}</p>
                </div>

                {selectedCheckIn.processedAt && (
                  <div className="col-span-2">
                    <label className="font-medium text-gray-700 dark:text-gray-300">
                      {t('checkIns.processedAt', 'Processed At')}:
                    </label>
                    <p className="mt-1">{formatDateTime(selectedCheckIn.processedAt)}</p>
                  </div>
                )}

                {selectedCheckIn.moderatorName && (
                  <div className="col-span-2">
                    <label className="font-medium text-gray-700 dark:text-gray-300">
                      {t('checkIns.moderator', 'Moderator')}:
                    </label>
                    <p className="mt-1">{selectedCheckIn.moderatorName}</p>
                  </div>
                )}

                {selectedCheckIn.notes && (
                  <div className="col-span-2">
                    <label className="font-medium text-gray-700 dark:text-gray-300">
                      {t('checkIns.notes', 'Notes')}:
                    </label>
                    <p className="mt-1">{selectedCheckIn.notes}</p>
                  </div>
                )}

                {selectedCheckIn.moderatorNotes && (
                  <div className="col-span-2">
                    <label className="font-medium text-gray-700 dark:text-gray-300">
                      {t('checkIns.moderatorNotes', 'Moderator Notes')}:
                    </label>
                    <p className="mt-1">{selectedCheckIn.moderatorNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};