import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  value?: number;
  showValue?: boolean;
  className?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  showValue = true,
  className = '',
  color = 'bg-blue-600',
  size = "md",
  label = "Progress"
}) => {
  const percentage = Math.min(100, Math.max(0, value));
  
  const heightClasses = {
    sm: "h-1.5",
    md: "h-3",
    lg: "h-5"
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      {showValue && (
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
          <span className="text-sm font-black text-slate-900">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn("w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50", heightClasses[size])}>
        <div 
          className={cn("h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;