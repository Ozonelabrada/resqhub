import React from 'react';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { Badge } from 'primereact/badge';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Chart } from 'primereact/chart';

interface TrendingItem {
  categoryId: string;
  title: string;
  category: string;
  trend: string;
  weeklyData: number[];
  labels: string[];
  reports?: number;
}

interface TrendingSectionProps {
  trendingReports: TrendingItem[];
  trendingLoading: boolean;
  isBelowDesktop: boolean;
}

const TrendingSection: React.FC<TrendingSectionProps> = ({
  trendingReports,
  trendingLoading,
  isBelowDesktop
}) => {
  // Generate chart options for trending items
  const getChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false
        }
      },
      y: {
        display: false,
        grid: {
          display: false
        }
      }
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 0
      },
      line: {
        tension: 0.3,
        borderWidth: 2
      }
    },
    interaction: {
      intersect: false
    }
  });

  const getChartData = (item: TrendingItem) => {
    const isPositiveTrend = item.trend.startsWith('+');
    return {
      labels: item.labels,
      datasets: [
        {
          data: item.weeklyData,
          borderColor: isPositiveTrend ? '#16a34a' : '#dc2626',
          backgroundColor: isPositiveTrend ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
          fill: true,
          tension: 0.3
        }
      ]
    };
  };

  return (
    <div className={`${isBelowDesktop ? 'px-4' : 'px-8'} py-6`} style={{ backgroundColor: '#f8fafc', color: '#4b5563' }}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Trending Lost Items 📈</h3>
        <p className="text-gray-600">Most reported items this week with real-time trend analysis</p>
      </div>

      <div className="flex justify-content-center">
        <div className="grid max-w-6xl w-full">
          {Array.isArray(trendingReports) && trendingReports.length > 0 ? (
            trendingReports.map((item) => (
              <div key={`${item.categoryId}-${item.title}`} className="col-12 md:col-6 lg:col-3">
                <Card className="h-full border-0 shadow-2" style={{ backgroundColor: 'white' }}>
                  <div className="p-3">
                    {/* Header with title and trend */}
                    <div className="flex align-items-center justify-content-between mb-3">
                      <div>
                        <div className="font-semibold text-gray-800">{item.title}</div>
                        <div className="text-sm text-gray-600">{item.category}</div>
                      </div>
                      <Chip
                        label={item.trend}
                        style={{
                          backgroundColor: item.trend.startsWith('+') ? '#dcfce7' : '#fee2e2',
                          color: item.trend.startsWith('+') ? '#15803d' : '#dc2626'
                        }}
                      />
                    </div>

                    {/* Line Chart */}
                    {Array.isArray(item.weeklyData) && item.weeklyData.length > 0 && (
                      <div className="mb-3" style={{ height: '80px' }}>
                        <Chart
                          type="line"
                          data={getChartData(item)}
                          options={getChartOptions()}
                          style={{ height: '100%' }}
                        />
                      </div>
                    )}

                    {/* Weekly Summary */}
                    <div className="text-center mb-2">
                      <div className="text-xs text-gray-500 mb-1">This Week's Progress</div>
                      <div className="flex align-items-center justify-content-center gap-2">
                        <Badge
                          value={item.reports || 0}
                          style={{ backgroundColor: '#3b82f6', color: 'white' }}
                        />
                        <span className="text-sm text-gray-600">total reports</span>
                      </div>
                    </div>

                    {/* Week Range */}
                    {Array.isArray(item.labels) && item.labels.length > 0 && (
                      <div className="text-center">
                        <div className="text-xs text-gray-400">
                          {item.labels[0]} - {item.labels[item.labels.length - 1]}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ))
          ) : (
            <div className="col-12">
              <Card className="text-center p-6" style={{ backgroundColor: 'white' }}>
                <div className="text-gray-500">
                  {trendingLoading ? (
                    <>
                      <ProgressSpinner style={{ width: '30px', height: '30px' }} />
                      <p className="mt-2">Loading trending reports...</p>
                    </>
                  ) : (
                    <p>No trending reports available at the moment.</p>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Legend/Info */}
      <div className="text-center mt-4">
        <div className="text-xs text-gray-500">
          <i className="pi pi-info-circle mr-1"></i>
          Charts show daily report counts for the past 7 days • Auto-updated every 5 minutes
        </div>
      </div>
    </div>
  );
};

export default TrendingSection;