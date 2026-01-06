import React from 'react';
import { TrendingUp, TrendingDown, Activity, Package } from 'lucide-react';
import { Card, Grid, Container, Spinner } from '../../../../ui';

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

const Sparkline: React.FC<{ data: number[], color: string }> = ({ data, color }) => {
  if (!data || data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 40;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const TrendingSection: React.FC<TrendingSectionProps> = ({
  trendingReports,
  trendingLoading,
  isBelowDesktop
}) => {
  return (
    <div className="bg-slate-50 py-24">
      <Container>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold mb-6">
            <Activity size={16} />
            Live Market Trends
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Trending Lost Items</h2>
          <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
            Real-time analysis of the most frequently reported items in your community this week.
          </p>
        </div>

        {trendingLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <Grid cols={4} gap={6}>
            {trendingReports.map((item) => {
              const isPositiveTrend = item.trend.startsWith('+');
              const trendColor = isPositiveTrend ? '#10b981' : '#ef4444';
              
              return (
                <Card key={`${item.categoryId}-${item.title}`} className="p-6 border-none shadow-xl rounded-3xl bg-white hover:scale-105 transition-all group">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Package size={24} />
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${
                      isPositiveTrend ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {isPositiveTrend ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {item.trend}
                    </div>
                  </div>

                  <h4 className="text-lg font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">{item.category}</p>

                  <div className="mb-6">
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">7D Activity</span>
                      <span className="text-sm font-black text-slate-900">{item.reports || 0} Reports</span>
                    </div>
                    <div className="h-10 w-full">
                      <Sparkline data={item.weeklyData} color={trendColor} />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {item.labels.slice(0, 2).map((label, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2 py-1 bg-slate-50 text-slate-500 rounded-md">
                        {label}
                      </span>
                    ))}
                  </div>
                </Card>
              );
            })}
          </Grid>
        )}
      </Container>
    </div>
  );
};

export default TrendingSection;