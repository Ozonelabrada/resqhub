import React from 'react';
import { Card } from 'primereact/card';

interface StatsSectionProps {
  stats: any;
  isBelowDesktop: boolean;
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats, isBelowDesktop }) => {
  if (!stats) return null;

  return (
    <div className={`${isBelowDesktop ? 'px-4' : 'px-8'} py-6`} style={{ backgroundColor: '#f1f5f9' }}>
      <div className="grid">
        <div className="col-6 md:col-3">
          <Card className="text-center h-full border-0 shadow-2"
                style={{ backgroundColor: '#dbeafe', borderLeft: '4px solid #3b82f6' }}>
            <div className="p-3">
              <div className="text-2xl font-bold text-blue-700 mb-2">
                {stats.totalItems.toLocaleString()}
              </div>
              <div className="text-gray-700 font-medium">Total Items</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.lostItemsCount} lost, {stats.foundItemsCount} found
              </div>
            </div>
          </Card>
        </div>
        <div className="col-6 md:col-3">
          <Card className="text-center h-full border-0 shadow-2"
                style={{ backgroundColor: '#dcfce7', borderLeft: '4px solid #16a34a' }}>
            <div className="p-3">
              <div className="text-2xl font-bold text-green-700 mb-2">
                {stats.successfulMatches.toLocaleString()}
              </div>
              <div className="text-gray-700 font-medium">Successful Matches</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.successRate.toFixed(1)}% success rate
              </div>
            </div>
          </Card>
        </div>
        <div className="col-6 md:col-3">
          <Card className="text-center h-full border-0 shadow-2"
                style={{ backgroundColor: '#fed7aa', borderLeft: '4px solid #ea580c' }}>
            <div className="p-3">
              <div className="text-2xl font-bold text-orange-700 mb-2">
                {stats.activeReports.toLocaleString()}
              </div>
              <div className="text-gray-700 font-medium">Active Reports</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.pendingReports} pending verification
              </div>
            </div>
          </Card>
        </div>
        <div className="col-6 md:col-3">
          <Card className="text-center h-full border-0 shadow-2"
                style={{ backgroundColor: '#e9d5ff', borderLeft: '4px solid #9333ea' }}>
            <div className="p-3">
              <div className="text-2xl font-bold text-purple-700 mb-2">
                {stats.citiesCovered || 0}
              </div>
              <div className="text-gray-700 font-medium">Cities Covered</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.mostActiveCity ? `Most active: ${stats.mostActiveCity}` : 'Growing daily'}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid mt-4">
        <div className="col-12 md:col-4">
          <Card className="text-center h-full border-0 shadow-1"
                style={{ backgroundColor: '#f0f9ff', borderLeft: '3px solid #0ea5e9' }}>
            <div className="p-3">
              <div className="text-lg font-bold text-sky-700 mb-1">
                {stats.totalUsers.toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm">Total Users</div>
            </div>
          </Card>
        </div>
        <div className="col-12 md:col-4">
          <Card className="text-center h-full border-0 shadow-1"
                style={{ backgroundColor: '#f0f9ff', borderLeft: '3px solid #0ea5e9' }}>
            <div className="p-3">
              <div className="text-lg font-bold text-sky-700 mb-1">
                {stats.averageMatchTimeFormatted}
              </div>
              <div className="text-gray-600 text-sm">Avg. Match Time</div>
            </div>
          </Card>
        </div>
        <div className="col-12 md:col-4">
          <Card className="text-center h-full border-0 shadow-1"
                style={{ backgroundColor: '#f0f9ff', borderLeft: '3px solid #0ea5e9' }}>
            <div className="p-3">
              <div className="text-lg font-bold text-sky-700 mb-1">
                {stats.totalRewardFormatted}
              </div>
              <div className="text-gray-600 text-sm">Total Rewards</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Last Updated Info */}
      <div className="text-center mt-3">
        <div className="text-xs text-gray-500">
          Statistics last updated: {new Date(stats.calculatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;