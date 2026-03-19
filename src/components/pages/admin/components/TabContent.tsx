import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TemplateTable, TemplateTableColumn } from './TemplateTable';
import { ServiceType, UserRecord, PaginationState, CreditRequest, CreditHistory } from '../types/subscription';

interface TabContentProps {
  activeTab: 'management' | 'requests' | 'history';
  managementError: string | null;
  managementLoading: boolean;
  data: Record<ServiceType, UserRecord[]>;
  serviceType: ServiceType;
  currentPagination: PaginationState;
  onPageChange: (page: number) => void;
  managementHeader: { title: string; description: string };
  managementColumns: TemplateTableColumn[];
  managementActions: any[];
  managementToolbar: React.ReactNode;
  requestsError: string | null;
  requestsLoading: boolean;
  requests: CreditRequest[];
  requestsPagination: PaginationState;
  onRequestsPageChange: (page: number) => void;
  requestsHeader: { title: string; description: string };
  requestsColumns: TemplateTableColumn[];
  requestsActions: any[];
  requestsToolbar: React.ReactNode;
  historyError: string | null;
  historyLoading: boolean;
  historyData: CreditHistory[];
}

export const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  managementError,
  managementLoading,
  data,
  serviceType,
  currentPagination,
  onPageChange,
  managementHeader,
  managementColumns,
  managementActions,
  managementToolbar,
  requestsError,
  requestsLoading,
  requests,
  requestsPagination,
  onRequestsPageChange,
  requestsHeader,
  requestsColumns,
  requestsActions,
  requestsToolbar,
  historyError,
  historyLoading,
  historyData,
}) => {
  if (activeTab === 'management') {
    return (
      <div className="space-y-6">
        {managementError && (
          <Card className="p-4 bg-red-50 border border-red-200">
            <p className="text-red-800">{managementError}</p>
          </Card>
        )}
        <TemplateTable
          header={managementHeader}
          columns={managementColumns}
          data={data[serviceType]}
          actions={managementActions}
          toolbar={managementToolbar}
          loading={managementLoading}
          empty={{ title: 'No records found', description: 'Try adjusting your filters or search terms' }}
          pagination={currentPagination}
          onPageChange={onPageChange}
        />
      </div>
    );
  }

  if (activeTab === 'requests') {
    return (
      <div className="space-y-6">
        {requestsError && (
          <Card className="p-4 bg-red-50 border border-red-200">
            <p className="text-red-800">{requestsError}</p>
          </Card>
        )}
        <TemplateTable
          header={requestsHeader}
          columns={requestsColumns}
          data={requests}
          actions={requestsActions}
          toolbar={requestsToolbar}
          loading={requestsLoading}
          empty={{ title: 'No requests found', description: 'No pending credit requests at this time' }}
          pagination={requestsPagination}
          onPageChange={onRequestsPageChange}
        />
      </div>
    );
  }

  if (activeTab === 'history') {
    return (
      <div className="space-y-6">
        {historyError && (
          <Card className="p-4 bg-red-50 border border-red-200">
            <p className="text-red-800">{historyError}</p>
          </Card>
        )}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Credit History</h2>
          {historyLoading ? (
            <div className="text-center py-8">Loading history...</div>
          ) : historyData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No history available</div>
          ) : (
            <div className="space-y-2">
              {historyData.map(record => (
                <div key={record.id} className="p-3 border rounded-lg hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{record.userName}</p>
                      <p className="text-sm text-gray-600">{record.actionType}: {record.amount} credits</p>
                      <p className="text-xs text-gray-500">{record.reason}</p>
                    </div>
                    <p className="text-sm text-gray-500">{new Date(record.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  return null;
};
