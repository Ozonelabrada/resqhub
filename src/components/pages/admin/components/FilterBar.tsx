import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Card, Button } from '@/components/ui';

interface FilterBarProps {
  onSearch: (query: string) => void;
  onServiceTypeChange: (type: string) => void;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
  onFilterClear: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  onSearch,
  onServiceTypeChange,
  onMonthChange,
  onYearChange,
  onFilterClear,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleServiceTypeChange = (value: string) => {
    setServiceType(value);
    onServiceTypeChange(value);
  };

  const handleMonthChange = (value: string) => {
    setMonth(value);
    onMonthChange(value);
  };

  const handleYearChange = (value: string) => {
    setYear(value);
    onYearChange(value);
  };

  const handleClear = () => {
    setSearchQuery('');
    setServiceType('');
    setMonth('');
    setYear('');
    onFilterClear();
  };

  const activeFilters = [searchQuery, serviceType, month, year].filter(Boolean).length;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg text-gray-900">Search & Filter</h3>
        {activeFilters > 0 && (
          <Button
            onClick={handleClear}
            variant="outline"
            className="text-xs gap-2"
          >
            <X size={16} />
            Clear ({activeFilters})
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by ID, username, or name..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
      >
        <Filter size={18} />
        {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        <ChevronDown size={16} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
      </button>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
            <select
              value={serviceType}
              onChange={(e) => handleServiceTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Service Types</option>
              <option value="rider">Rider</option>
              <option value="seller">Seller</option>
              <option value="personal-services">Personal Services</option>
              <option value="event">Event</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select
              value={month}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date(2024, i);
                return (
                  <option key={i} value={String(i + 1).padStart(2, '0')}>
                    {date.toLocaleString('default', { month: 'long' })}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={year}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Years</option>
              {Array.from({ length: 5 }, (_, i) => {
                const y = new Date().getFullYear() - i;
                return (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}
    </Card>
  );
};
