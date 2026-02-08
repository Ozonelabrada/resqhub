import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../ui';
import {
  AlertTriangle,
  TrendingDown,
  Eye,
  Flag,
  MessageSquare,
  Calendar,
  User
} from 'lucide-react';
import { ReportMatchService } from '@/services/reportMatchService';

interface RejectionRecord {
  matchId: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  reason: string;
  reasonDetails?: string;
  rejectedAt: string;
  matchedWith: {
    title: string;
    userId: string;
    userName: string;
  };
}

interface UserStats {
  userId: string;
  userName: string;
  userAvatar?: string;
  totalRejections: number;
  rejectionReasons: Record<string, number>;
  lastRejectionAt?: string;
  isFlagged: boolean;
  flaggedAt?: string;
  flagReason?: string;
}

interface MatchRejectionAnalyticsProps {
  timeframe?: 'week' | 'month' | 'quarter' | 'all';
  onClose?: () => void;
}

const REJECTION_REASON_LABELS: Record<string, string> = {
  'not_my_item': "Not my item",
  'wrong_condition': "Wrong condition",
  'already_found': "Already found elsewhere",
  'wrong_location': "Wrong location",
  'incorrect_details': "Incorrect details",
  'item_damaged': "Item damaged",
  'suspicious_behavior': "Suspicious behavior",
  'other': "Other"
};

export const MatchRejectionAnalytics: React.FC<MatchRejectionAnalyticsProps> = ({
  timeframe = 'month',
  onClose
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [rejectionRecords, setRejectionRecords] = useState<RejectionRecord[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'flagged'>('all');

  useEffect(() => {
    fetchRejectionAnalytics();
  }, [timeframe]);

  const fetchRejectionAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range based on timeframe
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'all':
          startDate.setFullYear(2000); // Very old date
          break;
        case 'month':
        default:
          startDate.setMonth(endDate.getMonth() - 1);
          break;
      }

      const response = await ReportMatchService.getRejectionAnalytics({
        startDate,
        endDate
      });

      if (response.success && response.data) {
        // Aggregate rejection data by user
        const statsMap = new Map<string, UserStats>();
        const records: RejectionRecord[] = [];

        if (Array.isArray(response.data)) {
          response.data.forEach((record: any) => {
            const userId = record.rejectedBy || record.userId;
            const userName = record.userName || 'Unknown User';

            // Add to records list
            records.push({
              matchId: record.matchId,
              userId,
              userName,
              userAvatar: record.userAvatar,
              reason: record.reason,
              reasonDetails: record.reasonDetails,
              rejectedAt: record.rejectedAt,
              matchedWith: {
                title: record.targetReport?.title || 'Unknown Item',
                userId: record.targetReport?.userId || '',
                userName: record.targetReport?.user?.fullName || 'Unknown'
              }
            });

            // Update stats
            if (!statsMap.has(userId)) {
              statsMap.set(userId, {
                userId,
                userName,
                userAvatar: record.userAvatar,
                totalRejections: 0,
                rejectionReasons: {},
                isFlagged: record.isFlagged || false,
                flaggedAt: record.flaggedAt,
                flagReason: record.flagReason
              });
            }

            const stats = statsMap.get(userId)!;
            stats.totalRejections++;
            stats.rejectionReasons[record.reason] = (stats.rejectionReasons[record.reason] || 0) + 1;
            stats.lastRejectionAt = record.rejectedAt;

            // Auto-flag if 3+ rejections
            if (stats.totalRejections >= 3 && !stats.isFlagged) {
              stats.isFlagged = true;
              stats.flaggedAt = new Date().toISOString();
              stats.flagReason = 'High rejection rate (3+ rejections)';
            }
          });
        }

        setUserStats(Array.from(statsMap.values()).sort((a, b) => b.totalRejections - a.totalRejections));
        setRejectionRecords(records);
      }
    } catch (error) {
      console.error('Error fetching rejection analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFlagUser = async (user: UserStats) => {
    try {
      const result = await ReportMatchService.flagUserForSuspiciousBehavior(
        user.userId,
        'High rejection rate and suspicious behavior pattern'
      );

      if (result.success) {
        (window as any).showToast?.(
          'success',
          'User Flagged',
          `${user.userName} has been flagged for suspicious behavior`
        );
        // Refresh analytics
        fetchRejectionAnalytics();
      }
    } catch (error) {
      console.error('Error flagging user:', error);
    }
  };

  const filteredUsers = filter === 'flagged' ? userStats.filter(u => u.isFlagged) : userStats;
  const totalRejections = userStats.reduce((sum, u) => sum + u.totalRejections, 0);
  const flaggedUsers = userStats.filter(u => u.isFlagged).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Total Rejections
              </p>
              <p className="text-4xl font-black text-slate-900">{totalRejections}</p>
              <p className="text-xs text-slate-500 font-medium mt-2">
                in the last {timeframe === 'all' ? 'all time' : timeframe}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Unique Users
              </p>
              <p className="text-4xl font-black text-slate-900">{userStats.length}</p>
              <p className="text-xs text-slate-500 font-medium mt-2">
                with rejection activity
              </p>
            </div>
            <User className="w-8 h-8 text-teal-500" />
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Flagged Users
              </p>
              <p className="text-4xl font-black text-red-600">{flaggedUsers}</p>
              <p className="text-xs text-slate-500 font-medium mt-2">
                for suspicious behavior
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2">
        <Button
          className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${
            filter === 'all'
              ? 'bg-teal-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          onClick={() => setFilter('all')}
        >
          All Users ({userStats.length})
        </Button>
        <Button
          className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${
            filter === 'flagged'
              ? 'bg-red-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          onClick={() => setFilter('flagged')}
        >
          Flagged ({flaggedUsers})
        </Button>
      </div>

      {/* User List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10">
            <p className="text-slate-500 font-medium">Loading analytics...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 font-medium">
              {filter === 'flagged' ? 'No flagged users found' : 'No rejection activity'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <Card
              key={user.userId}
              className={`p-4 rounded-2xl border-2 transition-all ${
                user.isFlagged
                  ? 'bg-red-50 border-red-200'
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                    <div>
                      <p className="font-black text-slate-900">{user.userName}</p>
                      <p className="text-xs text-slate-500">{user.userId}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 font-bold">Total Rejections:</span>
                      <Badge className={`px-3 py-1 rounded-lg font-black ${
                        user.totalRejections >= 3
                          ? 'bg-red-100 text-red-700'
                          : user.totalRejections >= 2
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {user.totalRejections}
                      </Badge>
                    </div>

                    {user.lastRejectionAt && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar size={12} />
                        Last rejection: {new Date(user.lastRejectionAt).toLocaleDateString()}
                      </div>
                    )}

                    {user.isFlagged && (
                      <div className="flex items-center gap-2 p-2 bg-red-100 rounded-lg">
                        <Flag size={14} className="text-red-600" />
                        <span className="text-xs font-bold text-red-700">
                          {user.flagReason}
                        </span>
                      </div>
                    )}

                    {/* Top Rejection Reasons */}
                    <div className="flex gap-1 flex-wrap">
                      {Object.entries(user.rejectionReasons)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3)
                        .map(([reason, count]) => (
                          <Badge
                            key={reason}
                            className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded-lg"
                          >
                            {REJECTION_REASON_LABELS[reason]}: {count}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    <Eye size={16} />
                  </Button>
                  {user.totalRejections >= 3 && !user.isFlagged && (
                    <Button
                      className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black text-sm"
                      onClick={() => handleFlagUser(user)}
                    >
                      <Flag size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
            <div className="p-8">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-black text-slate-900">
                  {selectedUser.userName} - Rejection Details
                </DialogTitle>
                <DialogDescription className="text-slate-500 font-medium">
                  {selectedUser.totalRejections} total rejections
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {rejectionRecords
                  .filter(r => r.userId === selectedUser.userId)
                  .map((record) => (
                    <div
                      key={record.matchId}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-slate-900">{record.matchedWith.title}</p>
                          <p className="text-xs text-slate-500">
                            Matched with: {record.matchedWith.userName}
                          </p>
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1">
                          {REJECTION_REASON_LABELS[record.reason] || record.reason}
                        </Badge>
                      </div>

                      {record.reasonDetails && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-xs text-slate-600 font-medium mb-1">Details:</p>
                          <p className="text-xs text-slate-600">{record.reasonDetails}</p>
                        </div>
                      )}

                      <div className="mt-3 text-xs text-slate-500">
                        {new Date(record.rejectedAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Close
                </Button>
                {selectedUser.totalRejections >= 3 && !selectedUser.isFlagged && (
                  <Button
                    className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black"
                    onClick={() => {
                      handleFlagUser(selectedUser);
                      setIsDetailModalOpen(false);
                    }}
                  >
                    <Flag size={16} className="mr-2" />
                    Flag User
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MatchRejectionAnalytics;
