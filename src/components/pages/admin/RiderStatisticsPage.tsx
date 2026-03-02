import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Spinner,
  Badge,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Progress
} from '../../ui';
import {
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  Star,
  Activity,
  Calendar,
  Target,
  AlertCircle,
  Download
} from 'lucide-react';
import { AdminStatCard } from '../../ui/admin';
import { cn } from '@/lib/utils';
import { AdminService } from '@/services';
import type { RiderStatisticsOverview, RiderPerformance } from '@/types/admin';

const RiderStatisticsPage: React.FC = () => {
  const [statistics, setStatistics] = useState<RiderStatisticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getRiderStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Error loading rider statistics:', error);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto mb-3 text-gray-400" size={32} />
        <p className="text-gray-600">Failed to load rider statistics</p>
      </div>
    );
  }

  const { metrics, topPerformers, recentActivity, trendData } = statistics;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700';
      case 'inactive':
        return 'bg-gray-50 text-gray-700';
      case 'suspended':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'active') return <CheckCircle size={14} />;
    if (status === 'suspended') return <AlertCircle size={14} />;
    return <Clock size={14} />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rider Statistics</h1>
          <p className="text-gray-600 mt-1">Real-time metrics and performance analytics</p>
        </div>

        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard
          title="Active Today"
          value={metrics.activeToday}
          icon={<Users className="text-blue-600" size={24} />}
          className="bg-blue-50 border-blue-100"
          changeLabel="Riders online now"
          changeType="neutral"
        />
        <AdminStatCard
          title="On Booking"
          value={metrics.onBooking}
          icon={<MapPin className="text-green-600" size={24} />}
          className="bg-green-50 border-green-100"
          changeLabel="Active pickups/deliveries"
          changeType="neutral"
        />
        <AdminStatCard
          title="Avg Rating"
          value={`${metrics.averageRating}★`}
          icon={<Star className="text-yellow-600" size={24} />}
          className="bg-yellow-50 border-yellow-100"
          change={5}
          changeLabel="from last period"
          changeType="increase"
        />
        <AdminStatCard
          title="Total Earnings"
          value={`₱${(metrics.totalEarnings / 1000).toFixed(0)}K`}
          icon={<DollarSign className="text-purple-600" size={24} />}
          className="bg-purple-50 border-purple-100"
          changeLabel="All-time total"
          changeType="neutral"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Completed Rides</h3>
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-4">
            {metrics.deliveredSuccess.toLocaleString()}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-bold text-green-600">{metrics.rideCompletionRate}%</span>
            </div>
            <Progress value={metrics.rideCompletionRate} className="h-2" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Acceptance Rate</h3>
            <Target className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-4">
            {metrics.acceptanceRate}%
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Performance</span>
              <span className="font-bold">{metrics.acceptanceRate}%</span>
            </div>
            <Progress value={metrics.acceptanceRate} className="h-2" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Total Reviews</h3>
            <Star className="text-yellow-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-4">
            {metrics.totalReviews.toLocaleString()}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cancellation Rate</span>
              <span className="font-bold text-red-600">{metrics.cancellationRate}%</span>
            </div>
            <Progress
              value={100 - metrics.cancellationRate}
              className="h-2"
            />
          </div>
        </Card>
      </div>

      {/* Trend Chart Placeholder */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="text-teal-600" size={24} />
            Trend Over Time
          </h2>
          <span className="text-sm text-gray-600">Last {timeRange}</span>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-700">Active Riders</span>
              <span className="text-sm text-gray-600">
                {trendData[trendData.length - 1]?.activeRiders || 0} today
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-700">Completed Rides</span>
              <span className="text-sm text-gray-600">
                {trendData[trendData.length - 1]?.completedRides || 0} today
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '90%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-700">Daily Revenue</span>
              <span className="text-sm text-gray-600">
                ₱{trendData[trendData.length - 1]?.revenue.toLocaleString() || 0} today
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '92%' }} />
            </div>
          </div>
        </div>

        {/* Simple trend visualization */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-end h-32 gap-2">
            {trendData.map((day, idx) => (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center"
                title={`${day.date}: ${day.completedRides} rides, ₱${day.revenue}`}
              >
                <div
                  className="w-full bg-gradient-to-t from-teal-500 to-teal-300 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                  style={{ height: `${(day.completedRides / 900) * 100}%` }}
                />
                <span className="text-xs text-gray-600 mt-2">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Completed rides by day</p>
        </div>
      </Card>

      {/* Top Performers */}
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-teal-600" size={24} />
            Top Performers
          </h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rider</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Completed Rides</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>Total Earnings</TableHead>
                <TableHead>Acceptance Rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPerformers.map((performer, idx) => (
                <TableRow key={performer.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar 
                        src={performer.profileImage} 
                        alt={performer.name}
                        className="h-8 w-8"
                      />
                      <div>
                        <p className="font-bold text-sm">{performer.name}</p>
                        <p className="text-xs text-gray-500">{performer.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-500" />
                      <span className="font-bold">{performer.rating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold">{performer.completedRides.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{performer.reviewsCount}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold">₱{performer.totalEarnings.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{performer.acceptanceRate}%</span>
                      </div>
                      <Progress value={performer.acceptanceRate} className="h-1 w-16" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('w-fit flex gap-1', getStatusColor(performer.status))}>
                      {getStatusIcon(performer.status)}
                      <span className="capitalize">{performer.status}</span>
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="text-teal-600" size={24} />
            Recent Activity
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900">
                        {activity.riderName}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.activity}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {new Date(activity.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default RiderStatisticsPage;
