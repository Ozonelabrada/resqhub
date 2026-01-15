import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral' | 'custom';
  changeLabel?: string;
  icon?: React.ReactElement<LucideIcon>;
  className?: string;
  onClick?: () => void;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  changeLabel,
  icon,
  className,
  onClick
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      case 'custom':
        return 'text-blue-600';
      default:
        return 'text-slate-600';
    }
  };

  const formatChange = () => {
    if (change === undefined) return null;
    
    const prefix = changeType === 'increase' ? '+' : changeType === 'decrease' ? '-' : '';
    const suffix = changeType === 'custom' ? '' : '%';
    
    return `${prefix}${Math.abs(change)}${suffix}`;
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl p-6 border border-slate-100 shadow-sm transition-all',
        onClick && 'cursor-pointer hover:shadow-md hover:scale-105',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      {(change !== undefined || changeLabel) && (
        <div className="flex items-center gap-2">
          {change !== undefined && (
            <span className={cn('text-sm font-bold', getChangeColor())}>
              {formatChange()}
            </span>
          )}
          <span className="text-sm text-slate-600">
            {changeLabel || (changeType === 'increase' ? 'from last period' : 
                          changeType === 'decrease' ? 'from last period' : 
                          'from last period')}
          </span>
        </div>
      )}
    </div>
  );
};

export default AdminStatCard;