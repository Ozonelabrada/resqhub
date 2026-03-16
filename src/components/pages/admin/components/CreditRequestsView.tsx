import React, { useState } from 'react';
import { Card, Badge } from '@/components/ui';
import { CheckCircle, XCircle, Clock, AlertCircle, User, DollarSign, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrencyPHP } from '@/utils/formatter';

export interface CreditRequest {
  id: string;
  userId: string;
  user:{
    firstName: string;
    lastName: string;
    email: string;
    };
  requestType: 'grant' | 'deduct';
  serviceType: 'rider' | 'seller' | 'personal-services' | 'event';
  amount: number;
  creditValue: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  requestedDate: string;
  approvalDate?: string;
  approvedBy?: string;
  userCurrentCredits: number;
  paymentReference?: string;
  bankVerified?: boolean;
}

interface CreditRequestsViewProps {
  requests: CreditRequest[];
  loading: boolean;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onApproving?: string | null;
  onVerifyBank?: (requestId: string) => void;
}

const getRequestTypeColor = (type: 'grant' | 'deduct') => {
  return type === 'grant'
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
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

export const CreditRequestsView: React.FC<CreditRequestsViewProps> = ({
  requests,
  loading,
  onApprove,
  onReject,
  onApproving,
  onVerifyBank,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const copyToClipboard = (text: string, refId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(refId);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Clock className="mx-auto mb-3 text-gray-400 animate-spin" size={32} />
        <p className="text-gray-600">Loading credit requests...</p>
      </Card>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const resolvedRequests = requests.filter((r) => r.status !== 'pending');

  if (requests.length === 0) {
    return (
      <Card className="p-8 text-center border-2 border-dashed">
        <CheckCircle className="mx-auto mb-3 text-gray-400" size={32} />
        <p className="text-gray-600 font-medium">No credit requests</p>
        <p className="text-sm text-gray-500">All pending requests have been processed</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Pending Approval</h3>
            <Badge className="bg-yellow-600">{pendingRequests.length} requests</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingRequests.map((request) => (
              <Card
                key={request.id}
                className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50 hover:shadow-md transition-shadow flex flex-col"
              >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <User className="text-gray-600 mt-1 flex-shrink-0" size={20} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-bold text-gray-900 text-sm">{request.user.firstName} {request.user.lastName}</h4>
                      <Badge className={cn(getServiceTypeColor(request.serviceType), 'border')} variant="outline">
                        {request.serviceType}
                      </Badge>
                      <Badge className={getRequestTypeColor(request.requestType)}>
                        {request.requestType === 'grant' ? '+ Grant' : '- Deduct'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{request.user.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 mb-3 border border-yellow-200">
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Credits</p>
                    <p className="text-lg font-bold text-gray-900">{request.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Value</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrencyPHP(request.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Balance</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrencyPHP(request.userCurrentCredits)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Requested</p>
                    <p className="text-xs text-gray-700">{new Date(request.requestedDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-700 line-clamp-2">
                  <span className="font-medium">Reason:</span> {request.reason}
                </p>
              </div>

              {request.paymentReference && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold text-gray-900 text-xs">Bank Reference</h5>
                    <Badge className={request.bankVerified ? 'bg-green-600 text-xs' : 'bg-orange-600 text-xs'}>
                      {request.bankVerified ? '✓ Verified' : '⚠ Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-blue-100 rounded-lg p-2">
                    <code className="flex-1 font-mono text-xs text-gray-700 break-all truncate">
                      {request.paymentReference}
                    </code>
                    <button
                      onClick={() => copyToClipboard(request.paymentReference!, request.id)}
                      className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                      title="Copy reference"
                    >
                      {copiedRef === request.id ? (
                        <Check size={14} className="text-green-600" />
                      ) : (
                        <Copy size={14} className="text-gray-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Verify with bank before approving.
                  </p>
                </div>
              )}

              <div className="flex gap-2 justify-end mt-auto">
                <button
                  onClick={() => onReject(request.id)}
                  disabled={onApproving === request.id}
                  className={cn(
                    'px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 transition-all cursor-pointer text-sm',
                    onApproving === request.id
                      ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  )}
                >
                  <XCircle size={14} />
                  Reject
                </button>
                <button
                  onClick={() => onApprove(request.id)}
                  disabled={onApproving === request.id}
                  className={cn(
                    'px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 transition-all cursor-pointer text-sm',
                    onApproving === request.id
                      ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  )}
                >
                  <CheckCircle size={14} />
                  {onApproving === request.id ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </Card>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Requests Section */}
      {resolvedRequests.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Decisions</h3>
            <Badge variant="outline">{resolvedRequests.length} resolved</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {resolvedRequests.map((request) => (
              <Card
                key={request.id}
                className={cn(
                  'p-4 border-l-4 transition-shadow cursor-pointer hover:shadow-md',
                  request.status === 'approved'
                    ? 'border-l-green-500 bg-green-50'
                    : 'border-l-red-500 bg-red-50'
                )}
                onClick={() =>
                  setExpandedId(expandedId === request.id ? null : request.id)
                }
              >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {request.status === 'approved' ? (
                    <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
                  ) : (
                    <XCircle className="text-red-600 mt-1 flex-shrink-0" size={20} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-bold text-gray-900">{request.user.firstName} {request.user.lastName} </h4>
                      <Badge className={cn(getServiceTypeColor(request.serviceType), 'border')} variant="outline">
                        {request.serviceType}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status === 'approved' ? '✓ Approved' : '✕ Rejected'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <DollarSign className="inline mr-1" size={14} />
                      {request.amount} credits ({request.requestType}) -{' '}
                      {new Date(request.requestedDate).toLocaleDateString()}
                    </div>
                    {expandedId === request.id && (
                      <p className="text-xs text-gray-600 mt-2 bg-white bg-opacity-50 p-2 rounded">
                        {request.approvalDate && (
                          <>
                            <strong>Reviewed:</strong>{' '}
                            {new Date(request.approvalDate).toLocaleString()} by {request.approvedBy}
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
