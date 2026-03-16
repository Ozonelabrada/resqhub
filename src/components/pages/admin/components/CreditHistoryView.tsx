import React from 'react';
import { Card, Badge, Spinner } from '@/components/ui';
import { AlertCircle } from 'lucide-react';

interface CreditHistoryViewProps {
  loading: boolean;
  data: any;
}

const StatCard: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <Card className="p-6">
    <p className="text-sm text-gray-600 mb-2">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-gray-500 mt-2">{label.includes('Spent') ? 'total' : 'credits'}</p>
  </Card>
);

export const CreditHistoryView: React.FC<CreditHistoryViewProps> = ({ loading, data }) => {
  if (loading) {
    return (
      <Card className="p-12 text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Loading credit history...</p>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-12 text-center">
        <AlertCircle className="mx-auto text-gray-400 mb-3" size={40} />
        <p className="text-gray-600 font-medium">No data loaded</p>
        <p className="text-gray-500 text-sm mt-1">Search for a user to view their credit history</p>
      </Card>
    );
  }

  const { statistics, purchases, allocations } = data.data;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Granted" value={statistics.totalCreditsGranted.toLocaleString()} color="text-green-600" />
        <StatCard label="Total Used" value={statistics.totalCreditsUsed.toLocaleString()} color="text-blue-600" />
        <StatCard label="Remaining" value={statistics.totalCreditsRemaining.toLocaleString()} color="text-teal-600" />
        <StatCard
          label="Amount Spent"
          value={`₱${statistics.totalSpent.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
          color="text-purple-600"
        />
      </div>

      {/* Purchase History */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">Purchase History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Purchase ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Credits</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Method</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Expires</th>
              </tr>
            </thead>
            <tbody>
              {purchases.data.map((purchase: any, idx: number) => (
                <tr key={purchase.purchaseId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{purchase.purchaseId}</td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">{purchase.creditsAcquired}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">₱{purchase.amountPaid.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm capitalize text-gray-600">{purchase.paymentMethod}</td>
                  <td className="px-6 py-4">
                    <Badge className="bg-green-100 text-green-800">{purchase.purchaseStatus}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(purchase.purchaseDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(purchase.expiresAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Allocations */}
        <div className="p-6 border-t">
          <h4 className="font-bold text-gray-900 mb-4">Active Allocations</h4>
          <div className="space-y-3">
            {allocations.data.map((allocation: any) => (
              <Card key={allocation.allocationId} className="p-4 border-l-4 border-teal-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">Allocation #{allocation.allocationId}</span>
                  <Badge
                    className={
                      allocation.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {allocation.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Allocated</p>
                    <p className="font-bold text-gray-900">{allocation.creditsAllocated}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Used</p>
                    <p className="font-bold text-orange-600">{allocation.creditsUsed}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Remaining</p>
                    <p className="font-bold text-green-600">{allocation.creditsRemaining}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Expires: {new Date(allocation.expiresAt).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
