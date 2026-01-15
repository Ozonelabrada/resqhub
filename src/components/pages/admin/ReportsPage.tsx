import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  ChevronDown,
  ExternalLink,
  Eye,
  MessageSquare,
  Shield
} from 'lucide-react';
import {
  Card,
  Button,
  Spinner,
  Badge,
  Avatar,
  Input
} from '../../ui';
import { FilterBar, AdminConfirmModal } from '../../ui/admin';
import { cn } from '@/lib/utils';
import { useAdminReports } from '@/hooks';
import type { AdminReport } from '@/types';

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const {
    reports,
    summary,
    loading,
    pagination,
    resolveReport,
    escalateReport,
    dismissReport,
    searchReports,
    filterByType,
    filterByStatus,
    filterByPriority,
    changePage
  } = useAdminReports();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const typeFilters = [
    { label: 'Lost Items', value: 'lost', variant: 'primary' as const },
    { label: 'Found Items', value: 'found', variant: 'success' as const },
    { label: 'Abuse Reports', value: 'abuse', variant: 'danger' as const },
    { label: 'Spam', value: 'spam', variant: 'warning' as const },
    { label: 'Other', value: 'other', variant: 'default' as const }
  ];

  const statusFilters = [
    { label: 'Pending', value: 'pending', variant: 'warning' as const },
    { label: 'Investigating', value: 'investigating', variant: 'primary' as const },
    { label: 'Resolved', value: 'resolved', variant: 'success' as const },
    { label: 'Dismissed', value: 'dismissed', variant: 'default' as const }
  ];

  const priorityFilters = [
    { label: 'Low Priority', value: 'low', variant: 'default' as const },
    { label: 'Medium Priority', value: 'medium', variant: 'warning' as const },
    { label: 'High Priority', value: 'high', variant: 'danger' as const },
    { label: 'Urgent', value: 'urgent', variant: 'danger' as const }
  ];

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    searchReports(value);
  };

  const handleFilterToggle = (value: string) => {
    const newActiveFilters = activeFilters.includes(value)
      ? activeFilters.filter(f => f !== value)
      : [...activeFilters, value];
    
    setActiveFilters(newActiveFilters);

    // Apply filters based on type
    if (typeFilters.some(f => f.value === value)) {
      filterByType(value as any);
    } else if (statusFilters.some(f => f.value === value)) {
      filterByStatus(value as any);
    } else if (priorityFilters.some(f => f.value === value)) {
      filterByPriority(value as any);
    }
  };

  const handleResolve = async () => {
    if (!selectedReport) return;
    
    try {
      setActionLoading(true);
      const success = await resolveReport(String(selectedReport.id), 'Issue has been resolved');
      if (success) {
        setShowResolveModal(false);
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Error resolving report:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (!selectedReport) return;
    
    try {
      setActionLoading(true);
      const success = await dismissReport(String(selectedReport.id), 'Report dismissed as invalid');
      if (success) {
        setShowDismissModal(false);
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Error dismissing report:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      case 'investigating':
        return <Badge className="bg-blue-100 text-blue-800">Investigating</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'dismissed':
        return <Badge className="bg-gray-100 text-gray-800">Dismissed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-600 text-white font-bold">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-slate-100 text-slate-800">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lost':
      case 'found':
        return <FileText size={16} className="text-blue-600" />;
      case 'abuse':
        return <AlertTriangle size={16} className="text-red-600" />;
      case 'spam':
        return <Shield size={16} className="text-orange-600" />;
      default:
        return <MessageSquare size={16} className="text-slate-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Summary for Search */}
      <div className="flex flex-col lg:flex-row justify-end items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <Input
              type="text"
              placeholder="Search reports by description or reporter..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-80 rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-blue-50 border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">Total Reports</p>
                <p className="text-2xl font-black text-blue-800">{summary.totalReports}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-orange-50 border-orange-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700 uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-black text-orange-800">{summary.pendingReports}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-green-50 border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 uppercase tracking-wider">Resolved</p>
                <p className="text-2xl font-black text-green-800">{summary.resolvedReports}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-purple-50 border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700 uppercase tracking-wider">Avg Resolution</p>
                <p className="text-2xl font-black text-purple-800">{summary.averageResolutionTime}h</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Filter size={16} />
            Filters
          </h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Report Type</p>
              <FilterBar
                filters={typeFilters}
                activeFilters={activeFilters}
                onFilterToggle={handleFilterToggle}
              />
            </div>
            
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Status</p>
              <FilterBar
                filters={statusFilters}
                activeFilters={activeFilters}
                onFilterToggle={handleFilterToggle}
              />
            </div>
            
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Priority</p>
              <FilterBar
                filters={priorityFilters}
                activeFilters={activeFilters}
                onFilterToggle={handleFilterToggle}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Reports List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900">
            Reports ({pagination.total})
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="text-slate-300 mx-auto mb-3" size={48} />
            <p className="text-slate-600">No reports found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    {getTypeIcon(report.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-slate-900 truncate">{report.title}</h4>
                          {getStatusBadge(report.status)}
                          {getPriorityBadge(report.priority)}
                        </div>
                        <p className="text-slate-600 text-sm line-clamp-2">{report.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6 bg-blue-100">
                            {report.reporter?.name?.charAt(0) || '?'}
                          </Avatar>
                          <span>{report.reporter?.name || 'Unknown Reporter'}</span>
                        </div>
                        
                        {report.communityName && (
                          <div className="flex items-center gap-1">
                            <span>in</span>
                            <Badge variant="outline" className="text-xs">
                              {report.communityName}
                            </Badge>
                          </div>
                        )}
                        
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        
                        {report.assignedTo && (
                          <div className="flex items-center gap-1">
                            <span>assigned to</span>
                            <span className="font-medium">{report.assignedTo.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 gap-1"
                        >
                          <Eye size={14} />
                          View
                        </Button>
                        
                        {report.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => {
                                setSelectedReport(report);
                                setShowDismissModal(true);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 gap-1"
                            >
                              Dismiss
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedReport(report);
                                setShowResolveModal(true);
                              }}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white gap-1"
                            >
                              <CheckCircle size={14} />
                              Resolve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="px-3 py-1 text-sm font-medium">
                {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Confirmation Modals */}
      <AdminConfirmModal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        onConfirm={handleResolve}
        title="Resolve Report"
        message={`Mark this report as resolved? This action will close the report.`}
        confirmText="Resolve"
        variant="success"
        loading={actionLoading}
      />

      <AdminConfirmModal
        isOpen={showDismissModal}
        onClose={() => setShowDismissModal(false)}
        onConfirm={handleDismiss}
        title="Dismiss Report"
        message={`Dismiss this report? This action cannot be undone.`}
        confirmText="Dismiss"
        variant="warning"
        loading={actionLoading}
      />
    </div>
  );
};

export default ReportsPage;