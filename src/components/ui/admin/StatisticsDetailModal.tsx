import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../dialog';
import { DataTable, ColumnConfig } from './DataTable';
import { Badge } from '../badge';
import { Avatar } from '../Avatar/Avatar';
import { Button } from '../button';
import { cn } from '@/lib/utils';
import { X, Filter, RefreshCw, ChevronDown, Star, TrendingUp, Users, Zap } from 'lucide-react';

export interface RiderDetailItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  rating?: number;
  status: 'active' | 'inactive' | 'on_ride' | 'suspended';
  completedRides?: number;
  earnings?: number;
  acceptanceRate?: number;
  location?: string;
  vehicle?: string;
  lastActive?: string;
}

export type StatisticsDetailType = 'active_today' | 'on_booking' | 'top_performers' | 'total_earnings' | 'custom';

interface StatisticsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: StatisticsDetailType;
  title: string;
  data?: RiderDetailItem[];
  loading?: boolean;
  totalCount?: number;
}

// Mock data generator
const generateMockRiders = (count: number, status: string): RiderDetailItem[] => {
  const names = [
    'John Doe', 'Jane Smith', 'Carlos Santos', 'Maria Garcia',
    'Ahmad Khan', 'Lisa Wong', 'Rajesh Kumar', 'Ana Rodriguez',
    'Miguel Torres', 'Sophie Laurent'
  ];
  
  const locations = ['Manila', 'Makati', 'Quezon City', 'Pasig', 'Caloocan', 'Taguig'];
  const vehicles = ['Motorcycle', 'Car', 'Tricycle', 'Bicycle', 'Van'];

  return Array.from({ length: count }, (_, i) => ({
    id: `rider-${i + 1}`,
    name: names[i % names.length],
    email: `rider${i + 1}@example.com`,
    phone: `+63${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    rating: 3.5 + Math.random() * 1.5,
    status: status as any,
    completedRides: Math.floor(Math.random() * 500) + 50,
    earnings: Math.floor(Math.random() * 50000) + 5000,
    acceptanceRate: Math.floor(Math.random() * 30) + 70,
    location: locations[Math.floor(Math.random() * locations.length)],
    vehicle: vehicles[Math.floor(Math.random() * vehicles.length)],
    lastActive: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  }));
};

const StatisticsDetailModal: React.FC<StatisticsDetailModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  data: externalData,
  loading = false,
  totalCount: externalTotalCount,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [maxRating, setMaxRating] = useState<number>(5);
  const [minAcceptanceRate, setMinAcceptanceRate] = useState<number>(0);
  const [maxAcceptanceRate, setMaxAcceptanceRate] = useState<number>(100);
  const pageSize = 10;

  // Generate mock data if not provided
  const mockData = useMemo(() => {
    const statusMap = {
      'active_today': 'active',
      'on_booking': 'on_ride',
      'top_performers': 'active',
      'total_earnings': 'active',
      'custom': 'active',
    };
    return generateMockRiders(50, statusMap[type] || 'active');
  }, [type]);

  const data = externalData || mockData;

  // Filter data based on active filters
  const filteredData = useMemo(() => {
    return data.filter(rider => {
      // Vehicle type filter
      if (vehicleTypeFilter && rider.vehicle !== vehicleTypeFilter) {
        return false;
      }
      
      // Rating filter
      if (typeof rider.rating === 'number') {
        if (rider.rating < minRating || rider.rating > maxRating) {
          return false;
        }
      }
      
      // Acceptance rate filter
      if (typeof rider.acceptanceRate === 'number') {
        if (rider.acceptanceRate < minAcceptanceRate || rider.acceptanceRate > maxAcceptanceRate) {
          return false;
        }
      }
      
      return true;
    });
  }, [data, vehicleTypeFilter, minRating, maxRating, minAcceptanceRate, maxAcceptanceRate]);

  // Get unique vehicle types from data for filter dropdown
  const uniqueVehicles = useMemo(() => {
    const vehicles = new Set(data.map(r => r.vehicle).filter(Boolean));
    return Array.from(vehicles).sort();
  }, [data]);

  const totalCount = filteredData.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset filters to default values
  const resetFilters = () => {
    setVehicleTypeFilter('');
    setMinRating(0);
    setMaxRating(5);
    setMinAcceptanceRate(0);
    setMaxAcceptanceRate(100);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700';
      case 'on_ride':
        return 'bg-blue-50 text-blue-700';
      case 'inactive':
        return 'bg-gray-50 text-gray-700';
      case 'suspended':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const columns: ColumnConfig<RiderDetailItem>[] = [
    {
      key: 'name',
      label: 'Rider',
      width: '200px',
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <Avatar src={item.avatar} alt={item.name} className="h-8 w-8" />
          <div>
            <p className="font-bold text-sm">{item.name}</p>
            <p className="text-xs text-gray-500">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <Badge className={cn('w-fit capitalize', getStatusColor(status))}>
          {status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (location) => <span className="text-sm">{location}</span>,
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (vehicle) => <span className="text-sm">{vehicle}</span>,
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (rating) => (
        <span className="font-bold">{typeof rating === 'number' ? rating.toFixed(1) : 'N/A'}★</span>
      ),
    },
    {
      key: 'completedRides',
      label: 'Completed Rides',
      render: (rides) => <span className="font-bold">{rides?.toLocaleString() || 0}</span>,
    },
    {
      key: 'earnings',
      label: 'Earnings',
      render: (earnings) => (
        <span className="font-bold">₱{earnings?.toLocaleString() || 0}</span>
      ),
    },
    {
      key: 'acceptanceRate',
      label: 'Acceptance Rate',
      render: (rate) => <span className="font-bold">{rate || 0}%</span>,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[85vh] flex flex-col p-0 gap-0">
        {/* Fixed Header */}
        <DialogHeader className="shrink-0 px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="w-full">
            <DialogTitle className="text-2xl font-bold text-gray-900">{title}</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              {totalCount} rider{totalCount !== 1 ? 's' : ''} found
              {(vehicleTypeFilter || minRating > 0 || maxRating < 5 || minAcceptanceRate > 0 || maxAcceptanceRate < 100) && (
                <span className="text-teal-600 font-medium"> • Filtered</span>
              )}
            </p>
          </div>
        </DialogHeader>

        {/* Filter Toggle & Stats Bar */}
        <div className="shrink-0 px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium',
                showFilters
                  ? 'bg-teal-50 border-teal-200 text-teal-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              )}
            >
              <Filter size={16} className={cn('transition-transform', showFilters && 'rotate-180')} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              <ChevronDown size={14} className="ml-1" />
            </button>

            {/* Active Filters Badge */}
            {(vehicleTypeFilter || minRating > 0 || maxRating < 5 || minAcceptanceRate > 0 || maxAcceptanceRate < 100) && (
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200">
                  <Zap size={12} className="mr-1" />
                  {[
                    vehicleTypeFilter ? 1 : 0,
                    minRating > 0 || maxRating < 5 ? 1 : 0,
                    minAcceptanceRate > 0 || maxAcceptanceRate < 100 ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)} Active
                </Badge>
                <button
                  onClick={resetFilters}
                  className="text-xs text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
                  title="Reset all filters"
                >
                  <RefreshCw size={14} />
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Stats Summary */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Users size={14} className="text-teal-600" />
              <span>Total: <span className="font-bold text-gray-900">{data.length}</span></span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={14} className="text-blue-600" />
              <span>Match: <span className="font-bold text-gray-900">{totalCount}</span></span>
            </div>
          </div>
        </div>

        {/* Filters Section - Collapsible */}
        {showFilters && (
          <div className="shrink-0 px-6 py-5 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100 space-y-4 overflow-y-auto max-h-48">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {/* Vehicle Type Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                  Vehicle Type
                </label>
                <select
                  value={vehicleTypeFilter}
                  onChange={(e) => {
                    setVehicleTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white hover:border-gray-400 transition-colors"
                >
                  <option value="">All Vehicles</option>
                  {uniqueVehicles.map(vehicle => (
                    <option key={vehicle} value={vehicle}>
                      {vehicle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                  Rating Range
                </label>
                <div className="space-y-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded font-semibold">
                      {minRating.toFixed(1)} ★
                    </span>
                    <span className="text-xs text-gray-500">-</span>
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded font-semibold">
                      {maxRating.toFixed(1)} ★
                    </span>
                  </div>
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.1"
                      value={minRating}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val <= maxRating) setMinRating(val);
                        setCurrentPage(1);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                  </div>
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.1"
                      value={maxRating}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val >= minRating) setMaxRating(val);
                        setCurrentPage(1);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Acceptance Rate Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                  Acceptance Rate
                </label>
                <div className="space-y-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                      {minAcceptanceRate}%
                    </span>
                    <span className="text-xs text-gray-500">-</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                      {maxAcceptanceRate}%
                    </span>
                  </div>
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={minAcceptanceRate}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val <= maxAcceptanceRate) setMinAcceptanceRate(val);
                        setCurrentPage(1);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={maxAcceptanceRate}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val >= minAcceptanceRate) setMaxAcceptanceRate(val);
                        setCurrentPage(1);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="w-full border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 gap-2"
                >
                  <RefreshCw size={14} />
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Data Table Section */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          <div className="overflow-y-auto flex-1">
            <DataTable
              data={paginatedData}
              columns={columns}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setCurrentPage}
              emptyMessage={`No ${title.toLowerCase()} found matching the selected filters`}
            />
          </div>
        </div>

        {/* Fixed Footer - Legal & Information */}
        <div className="shrink-0 border-t border-gray-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Information Section */}
            <div>
              <h4 className="font-semibold text-slate-100 mb-2">About This Report</h4>
              <p className="text-slate-400 leading-relaxed">
                This report displays real-time rider statistics and performance metrics. Data is updated every 5 minutes and reflects the current operational status.
              </p>
            </div>

            {/* Data Accuracy Section */}
            <div>
              <h4 className="font-semibold text-slate-100 mb-2">Data Accuracy</h4>
              <p className="text-slate-400 leading-relaxed">
                All metrics are calculated based on verified transaction data and rider activity logs. For support or discrepancies, contact the Operations team. Last updated: <span className="text-slate-300 font-medium">{new Date().toLocaleTimeString()}</span>
              </p>
            </div>

            {/* Legal & Privacy Section */}
            <div>
              <h4 className="font-semibold text-slate-100 mb-2">Legal Notice</h4>
              <p className="text-slate-400 leading-relaxed">
                This data is confidential and for authorized users only. Unauthorized access, copying, or distribution is prohibited. See our <a href="/privacy-policy" className="text-teal-400 hover:text-teal-300 underline">Privacy Policy</a> and <a href="/terms-of-service" className="text-teal-400 hover:text-teal-300 underline">Terms of Service</a> for details.
              </p>
            </div>
          </div>

          {/* Footer Bottom Bar */}
          <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
            <div className="text-slate-500 text-xs">
              ResQHub admin dashboard • © {new Date().getFullYear()} All rights reserved
            </div>
            <div className="flex gap-4 text-xs">
              <a href="/support" className="text-teal-400 hover:text-teal-300 transition-colors">Support</a>
              <a href="/admin/help" className="text-teal-400 hover:text-teal-300 transition-colors">Help</a>
              <span className="text-slate-600">v1.0</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatisticsDetailModal;
