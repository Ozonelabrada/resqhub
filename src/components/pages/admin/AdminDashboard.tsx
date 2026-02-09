import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  FileText,
  AlertCircle,
  TrendingUp,
  Calendar,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Plus,
  AlertTriangle
} from 'lucide-react';
import {
  Card,
  Button,
  Spinner,
  Badge
} from '../../ui';
import { AdminStatCard } from '../../ui/admin';
import { cn } from '@/lib/utils';
import { AdminService } from '@/services';
import type { AdminOverview, AdminStatistics } from '@/types';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewData, statsData] = await Promise.all([
        AdminService.getOverview(),
        AdminService.getStatistics(timeRange)
      ]);
      setOverview(overviewData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading admin dashboard data:', error);
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

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  return (
    <div className="space-y-8">
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-slate-600">
            Overview of platform performance and active metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-slate-200 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button
            onClick={() => loadData()}
            className="rounded-xl flex items-center gap-2"
          >
            <Clock size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatCard
            title="Avg Response Time"
            value={`${statistics.kpis.avgResponseTimeMinutes}m`}
            icon={<Clock className="text-blue-600" size={24} />}
            className="bg-blue-50 border-blue-100"
            changeLabel="System average"
            changeType="neutral"
          />
          
          <AdminStatCard
            title="Resolution Rate"
            value={`${statistics.kpis.resolutionRatePercentage}%`}
            icon={<CheckCircle className="text-green-600" size={24} />}
            className="bg-green-50 border-green-100"
            changeLabel="Incidents resolved"
            changeType="neutral"
          />
          
          <AdminStatCard
            title="Latest User Growth"
            value={statistics.trends.userGrowth.slice(-1)[0]?.count || 0}
            icon={<Users className="text-purple-600" size={24} />}
            className="bg-purple-50 border-purple-100"
            changeLabel="New registrations"
            changeType="neutral"
          />
          
          <AdminStatCard
            title="Incident Volume"
            value={statistics.trends.incidentVolume.reduce((acc, curr) => acc + curr.count, 0)}
            icon={<AlertTriangle className="text-amber-600" size={24} />}
            className="bg-amber-50 border-amber-100"
            changeLabel={`Last ${statistics.timeRange}`}
            changeType="neutral"
          />
        </div>
      )}

      {/* Analytics Distributions */}
      {statistics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* alert categories */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="text-teal-600" size={20} />
              <h3 className="text-lg font-black text-slate-900">Alert Categories</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(statistics.distributions.alertCategories).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="capitalize text-slate-600">{key}</span>
                    <span className="text-slate-900">{value}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-teal-500 rounded-full" 
                      style={{ width: `${Math.min((value / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* community status */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-teal-600" size={20} />
              <h3 className="text-lg font-black text-slate-900">Community Status</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(statistics.distributions.communityStatus).map(([status, count]) => (
                <div key={status} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{status}</p>
                  <p className="text-2xl font-black text-slate-800">{count}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Pending Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Communities */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <AlertCircle className="text-orange-500" size={24} />
                Pending Approvals
                <Badge className="bg-orange-100 text-orange-600 font-bold">
                  {overview?.pendingCommunities || 0}
                </Badge>
              </h2>
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/communities?status=pending')}
                className="text-teal-600 hover:text-teal-700 font-bold gap-2"
              >
                View All <ArrowRight size={16} />
              </Button>
            </div>

            <div className="space-y-4">
              {overview?.pendingCommunities && overview.pendingCommunities > 0 ? (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <p className="text-orange-800 font-medium">
                    {overview.pendingCommunities} communities are waiting for approval
                  </p>
                  <Button
                    onClick={() => navigate('/admin/communities?status=pending')}
                    className="mt-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-sm"
                  >
                    Review Pending Communities
                  </Button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                  <CheckCircle className="text-green-600 mx-auto mb-2" size={32} />
                  <p className="text-green-800 font-medium">
                    No pending approvals
                  </p>
                  <p className="text-green-600 text-sm">
                    All communities are up to date
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <BarChart3 className="text-teal-600" size={24} />
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => navigate('/admin/communities')}
                variant="outline"
                className="p-4 h-auto text-left justify-start border-slate-200 hover:border-teal-300 hover:bg-teal-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Manage Communities</p>
                    <p className="text-sm text-slate-600">Review, approve, and moderate</p>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => navigate('/admin/reports')}
                variant="outline"
                className="p-4 h-auto text-left justify-start border-slate-200 hover:border-teal-300 hover:bg-teal-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FileText className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Review Reports</p>
                    <p className="text-sm text-slate-600">Handle user reports and issues</p>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => navigate('/admin/subscriptions')}
                variant="outline"
                className="p-4 h-auto text-left justify-start border-slate-200 hover:border-teal-300 hover:bg-teal-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Subscriptions</p>
                    <p className="text-sm text-slate-600">View plans and payments</p>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => window.open('/admin/analytics', '_blank')}
                variant="outline"
                className="p-4 h-auto text-left justify-start border-slate-200 hover:border-teal-300 hover:bg-teal-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Analytics</p>
                    <p className="text-sm text-slate-600">Platform insights and metrics</p>
                  </div>
                </div>
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Clock className="text-slate-600" size={24} />
              Recent Activity
            </h2>

            <div className="space-y-4">
              {overview?.recentActivity?.map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    activity.type === 'community_created' && "bg-blue-100 text-blue-600",
                    activity.type === 'community_approved' && "bg-green-100 text-green-600",
                    activity.type === 'community_rejected' && "bg-red-100 text-red-600",
                    activity.type === 'report_created' && "bg-orange-100 text-orange-600",
                    activity.type === 'user_registered' && "bg-purple-100 text-purple-600"
                  )}>
                    {activity.type === 'community_created' && <Plus size={16} />}
                    {activity.type === 'community_approved' && <CheckCircle size={16} />}
                    {activity.type === 'community_rejected' && <AlertCircle size={16} />}
                    {activity.type === 'report_created' && <FileText size={16} />}
                    {activity.type === 'user_registered' && <Users size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()} • by {activity.actor?.name || 'System'}
                    </p>
                  </div>
                </div>
              ))}

              {(!overview?.recentActivity || overview.recentActivity.length === 0) && (
                <div className="text-center py-8">
                  <Clock className="text-slate-300 mx-auto mb-3" size={32} />
                  <p className="text-slate-600">No recent activity</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;