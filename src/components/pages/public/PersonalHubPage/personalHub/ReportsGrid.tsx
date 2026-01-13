import React from 'react';
import { ItemCard } from '../../../ui';
import { NewsFeedItem } from '../../../../types/api';

interface ReportsGridProps {
  reports?: NewsFeedItem[];
}

export const ReportsGrid: React.FC<ReportsGridProps> = ({ reports }) => {
  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50 rounded-4xl border-2 border-dashed border-slate-200">
         <h3 className="text-lg font-black text-slate-400">No reports found</h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reports.map((report) => (
        <ItemCard
          key={report.id}
          item={report}
          variant="grid"
          className="rounded-4xl shadow-sm hover:shadow-xl transition-all border border-slate-50"
        />
      ))}
    </div>
  );
};
