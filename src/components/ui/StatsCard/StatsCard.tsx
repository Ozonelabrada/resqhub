import React from 'react';
import { Card, CardContent } from '../card';
import { cn } from '@/lib/utils';

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  className = '',
  iconClassName = 'bg-blue-50 text-blue-600'
}) => {
  return (
    <Card className={cn("overflow-hidden border-none shadow-xl rounded-3xl", className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {icon && (
            <div className={cn("p-3 rounded-2xl", iconClassName)}>
              {icon}
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{value}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;