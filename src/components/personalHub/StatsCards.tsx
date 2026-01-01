// components/personalHub/StatsCards.tsx
import React from 'react';
import { Card } from 'primereact/card';
import type { UserStats } from '../../types/personalHub';

interface StatsCardsProps {
  stats: UserStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid mb-4">
      <div className="col-6 md:col-3">
        <Card className="text-center" style={{ backgroundColor: '#e3f2fd' }}>
          <div className="p-3">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {stats.totalReports}
            </div>
            <div className="text-gray-700 font-medium">Total Reports</div>
          </div>
        </Card>
      </div>
      <div className="col-6 md:col-3">
        <Card className="text-center" style={{ backgroundColor: '#e8f5e8' }}>
          <div className="p-3">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {stats.activeReports}
            </div>
            <div className="text-gray-700 font-medium">Active Reports</div>
          </div>
        </Card>
      </div>
      <div className="col-6 md:col-3">
        <Card className="text-center" style={{ backgroundColor: '#fef3c7' }}>
          <div className="p-3">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {stats.resolvedReports}
            </div>
            <div className="text-gray-700 font-medium">Resolved</div>
          </div>
        </Card>
      </div>
      <div className="col-6 md:col-3">
        <Card className="text-center" style={{ backgroundColor: '#fce7f3' }}>
          <div className="p-3">
            <div className="text-2xl font-bold text-pink-600 mb-2">
              {stats.totalViews}
            </div>
            <div className="text-gray-700 font-medium">Total Views</div>
          </div>
        </Card>
      </div>
    </div>
  );
};