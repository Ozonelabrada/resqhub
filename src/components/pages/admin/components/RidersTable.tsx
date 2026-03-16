import React, { useState } from 'react';
import { MoreVertical, Trash2, Plus, Clock, Eye } from 'lucide-react';
import { Card, Badge } from '@/components/ui';

interface Rider {
  id: string;
  username: string;
  name: string;
  email: string;
  serviceType: 'rider' | 'seller' | 'personal-services' | 'event';
  status: 'active' | 'inactive' | 'suspended';
  currentCredits: number;
  totalSpent: number;
  lastActivity: string;
  joinDate: string;
}

interface RidersTableProps {
  riders: Rider[];
  loading: boolean;
  onGrant: (riderId: string) => void;
  onDeduct: (riderId: string) => void;
  onViewHistory: (riderId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'suspended':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getServiceTypeColor = (type: string) => {
  switch (type) {
    case 'rider':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'seller':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'personal-services':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'event':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export const RidersTable: React.FC<RidersTableProps> = ({
  riders,
  loading,
  onGrant,
  onDeduct,
  onViewHistory,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <p className="mt-4 text-gray-600">Loading riders...</p>
      </Card>
    );
  }

  if (!riders || riders.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-600 font-medium">No riders found</p>
        <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search criteria</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">User Info</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">Service Type</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700">Credits</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700">Total Spent</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700">Activity</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {riders.map((rider, idx) => (
              <tr key={rider.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold text-gray-900">{rider.name}</p>
                    <p className="text-xs text-gray-600">@{rider.username}</p>
                    <p className="text-xs text-gray-500">{rider.email}</p>
                    <p className="text-xs text-gray-500 mt-1">ID: {rider.id}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge className={getStatusColor(rider.status)}>
                    {rider.status.charAt(0).toUpperCase() + rider.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className={`px-3 py-1 rounded-full border text-xs font-medium inline-block ${getServiceTypeColor(rider.serviceType)}`}>
                    {rider.serviceType.charAt(0).toUpperCase() + rider.serviceType.slice(1)}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-bold text-teal-600">{rider.currentCredits.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-gray-700">₱{rider.totalSpent.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <p>Active: {rider.lastActivity}</p>
                  <p className="text-gray-500 text-xs">Joined: {rider.joinDate}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === rider.id ? null : rider.id)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <MoreVertical size={18} className="text-gray-600" />
                    </button>
                    {openMenu === rider.id && (
                      <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-max">
                        <button
                          onClick={() => {
                            onGrant(rider.id);
                            setOpenMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2 border-b"
                        >
                          <Plus size={16} className="text-green-600" />
                          Grant Credits
                        </button>
                        <button
                          onClick={() => {
                            onDeduct(rider.id);
                            setOpenMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 flex items-center gap-2 border-b"
                        >
                          <Trash2 size={16} className="text-red-600" />
                          Deduct Credits
                        </button>
                        <button
                          onClick={() => {
                            onViewHistory(rider.id);
                            setOpenMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                        >
                          <Clock size={16} className="text-blue-600" />
                          View History
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
