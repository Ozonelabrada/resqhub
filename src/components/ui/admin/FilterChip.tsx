import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '../Button/Button';
import { Badge } from '../badge';
import { cn } from '@/lib/utils';

interface FilterChipProps {
  label: string;
  value: string;
  isActive?: boolean;
  onToggle?: (value: string) => void;
  onRemove?: (value: string) => void;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  value,
  isActive = false,
  onToggle,
  onRemove,
  variant = 'default'
}) => {
  const getVariantStyles = () => {
    if (isActive) {
      switch (variant) {
        case 'primary':
          return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
        case 'success':
          return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
        case 'warning':
          return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200';
        case 'danger':
          return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
        default:
          return 'bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200';
      }
    } else {
      return 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100';
    }
  };

  const handleClick = () => {
    onToggle?.(value);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.(value);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-colors',
        getVariantStyles(),
        onToggle && 'hover:scale-105 transition-all'
      )}
    >
      <Filter size={12} />
      <span>{label}</span>
      {isActive && onRemove && (
        <button
          onClick={handleRemove}
          className="p-0.5 hover:bg-black/10 rounded-full transition-colors"
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
};

interface FilterBarProps {
  filters: Array<{
    label: string;
    value: string;
    variant?: FilterChipProps['variant'];
  }>;
  activeFilters: string[];
  onFilterToggle: (value: string) => void;
  onFilterRemove?: (value: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  activeFilters,
  onFilterToggle,
  onFilterRemove,
  onClearAll,
  className
}) => {
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <FilterChip
            key={filter.value}
            label={filter.label}
            value={filter.value}
            variant={filter.variant}
            isActive={activeFilters.includes(filter.value)}
            onToggle={onFilterToggle}
            onRemove={onFilterRemove}
          />
        ))}
      </div>
      
      {hasActiveFilters && onClearAll && (
        <Button
          onClick={onClearAll}
          variant="ghost"
          size="sm"
          className="text-slate-500 hover:text-slate-700 font-medium gap-1"
        >
          <X size={14} />
          Clear all
        </Button>
      )}
    </div>
  );
};

export default FilterChip;