import React, { useEffect, useRef } from 'react';
import { Card, Button, StatusBadge, Badge, Spinner } from '../../../ui';
import { Plus, MapPin, Calendar, Eye, ChevronRight, Filter } from 'lucide-react';
import type { UserReport } from '../../../../../types/personalHub';

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

  return (
    <Card className="h-full border-none shadow-xl rounded-3xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div>
          <h3 className="text-xl font-black text-slate-900">My Reports</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Manage your submissions</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="rounded-xl shadow-md shadow-blue-100 flex items-center gap-2"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Create New</span>
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
        style={{ maxHeight: '600px' }}
      >
        {reports.length === 0 && !loading ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold">No reports found</p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="group relative bg-white border border-slate-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => onReportClick(report)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {report.title}
                    </h4>
                    <StatusBadge status={report.type as any} className="text-[10px] px-2 py-0.5" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <MapPin size={12} className="text-blue-500" />
                      <span className="truncate">{report.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Calendar size={12} className="text-blue-500" />
                      {new Date(report.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Eye size={12} className="text-blue-500" />
                      {report.views} views
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <div className={`w-2 h-2 rounded-full ${
                        report.status === 'active' ? 'bg-emerald-500' : 
                        report.status === 'matched' ? 'bg-amber-500' : 'bg-slate-300'
                      }`} />
                      <span className="capitalize">{report.status}</span>
                    </div>
                  </div>
                </div>
                <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={20} className="text-blue-600" />
                </div>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-center py-6">
            <Spinner size="sm" />
          </div>
        )}

        {hasMore && !loading && (
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadMore}
              className="text-blue-600 font-bold hover:bg-blue-50"
            >
              Load More Reports
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

                <div className="flex items-center gap-2">
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
          <div className="flex justify-center py-3">
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
