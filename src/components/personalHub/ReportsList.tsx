// components/personalHub/ReportsList.tsx
import React, { useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { ProgressSpinner } from 'primereact/progressspinner';
import type { UserReport } from '../../types/personalHub';

interface ReportsListProps {
  reports: UserReport[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onReportClick: (report: UserReport) => void;
}

export const ReportsList: React.FC<ReportsListProps> = ({
  reports,
  loading,
  hasMore,
  onLoadMore,
  onReportClick
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200;

      if (isNearBottom && hasMore && !loading) {
        onLoadMore();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, onLoadMore]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { severity: 'info', label: 'Active' },
      matched: { severity: 'warning', label: 'Matched' },
      resolved: { severity: 'success', label: 'Resolved' },
      expired: { severity: 'danger', label: 'Expired' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge value={config.label} severity={config.severity as any} />;
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge
        value={type.toUpperCase()}
        severity={type === 'lost' ? 'danger' : 'success'}
        className="text-xs"
      />
    );
  };

  return (
    <Card className="h-full">
      <div className="flex align-items-center justify-content-between mb-3">
        <h3 className="text-lg font-semibold m-0">My Reports</h3>
        <Button
          label="Create Report"
          icon="pi pi-plus"
          className="p-button-sm"
          style={{ backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
        />
      </div>

      <div
        ref={scrollRef}
        style={{ maxHeight: '600px', overflowY: 'auto' }}
        className="space-y-3"
      >
        {reports.map((report) => (
          <Card
            key={report.id}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => onReportClick(report)}
          >
            <div className="flex align-items-start justify-content-between">
              <div className="flex-1">
                <div className="flex align-items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-800 m-0">{report.title}</h4>
                  {getTypeBadge(report.type)}
                </div>

                <div className="flex align-items-center gap-3 text-sm text-gray-600 mb-2">
                  <span><i className="pi pi-map-marker"></i> {report.location}</span>
                  <span><i className="pi pi-calendar"></i> {new Date(report.date).toLocaleDateString()}</span>
                  <span><i className="pi pi-eye"></i> {report.views} views</span>
                </div>

                <div className="flex align-items-center gap-2">
                  {getStatusBadge(report.status)}
                  <span className="text-xs text-gray-500">
                    {report.potentialMatches} potential matches
                  </span>
                </div>
              </div>

              {report.images.length > 0 && (
                <img
                  src={report.images[0]}
                  alt={report.title}
                  className="w-4rem h-4rem border-round"
                  style={{ objectFit: 'cover' }}
                />
              )}
            </div>
          </Card>
        ))}

        {loading && (
          <div className="flex justify-content-center py-3">
            <ProgressSpinner style={{ width: '30px', height: '30px' }} />
          </div>
        )}

        {!hasMore && reports.length > 0 && (
          <div className="text-center py-3 text-gray-500">
            No more reports to load
          </div>
        )}

        {reports.length === 0 && !loading && (
          <div className="text-center py-4 text-gray-500">
            <i className="pi pi-inbox text-3xl mb-3 block"></i>
            <p>No reports found</p>
            <Button
              label="Create Your First Report"
              icon="pi pi-plus"
              className="p-button-sm"
            />
          </div>
        )}
      </div>
    </Card>
  );
};