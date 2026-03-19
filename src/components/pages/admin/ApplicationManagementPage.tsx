import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Card,
  Button,
  Badge,
  Spinner,
  Tabs,
  TabList,
  TabTrigger,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Textarea,
  Select,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../ui';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  FileText,
  MapPin,
  TrendingUp,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApplicationManagement } from '@/hooks/admin';
import { AdminService } from '@/services';
import { TemplateTable } from './components/TemplateTable';
import type {
  Application,
  RiderApplication,
  SellerApplication,
  ServiceProviderApplication,
  ApplicationRole,
  ApplicationStatus
} from '@/types/admin';

interface ActionModalState {
  isOpen: boolean;
  type: 'approve' | 'reject' | 'suspend' | 'reactivate' | null;
  applicationId: string | null;
  applicationType: string | null;
  reason: string;
}

interface ConfirmationState {
  isOpen: boolean;
  type: 'approve' | 'reject' | 'suspend' | 'reactivate' | null;
  applicationId: string | null;
  applicationType: string | null;
  applicationName: string | null;
}

const ApplicationManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    applications,
    applicationDetail,
    statusCounts,
    isLoading,
    isDetailLoading,
    isActionLoading,
    fetchApplications,
    fetchApplicationDetail,
    approveApplication,
    rejectApplication,
    suspendApplication,
    reactivateApplication,
    clearDetail
  } = useApplicationManagement();

  const [activeTab, setActiveTab] = useState<ApplicationStatus | 'all'>('pending');
  const [roleFilter, setRoleFilter] = useState<ApplicationRole | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalApplications, setTotalApplications] = useState(0);
  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationState>({
    isOpen: false,
    type: null,
    applicationId: null,
    applicationType: null,
    applicationName: null
  });
  const [actionModal, setActionModal] = useState<ActionModalState>({
    isOpen: false,
    type: null,
    applicationId: null,
    applicationType: null,
    reason: ''
  });
  const [selectedDetail, setSelectedDetail] = useState<Application | null>(
    applicationDetail
  );
  const [riderDetail, setRiderDetail] = useState<any>(null);
  const [isRiderDetailLoading, setIsRiderDetailLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
  const [verifyingDocumentId, setVerifyingDocumentId] = useState<string | null>(null);

  // Load applications on mount and when filters change
  useEffect(() => {
    setCurrentPage(1);
    loadApplications(1);
  }, [activeTab, roleFilter, searchQuery]);

  const loadApplications = async (page: number = currentPage) => {
    await fetchApplications({
      status: activeTab === 'all' ? undefined : activeTab,
      applicationType: roleFilter === 'all' ? undefined : roleFilter,
      query: searchQuery || undefined,
      page,
      pageSize
    });
    // Set total count (you may need to update this based on your API response)
    setTotalApplications(applications.length > 0 ? (statusCounts.pending + statusCounts.approved + statusCounts.rejected + statusCounts.suspended) : 0);
  };

  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);
    await loadApplications(newPage);
  };

  const handleAction = (
    type: 'approve' | 'reject' | 'suspend' | 'reactivate',
    appId: string,
    applicationType: string
  ) => {
    // Show confirmation dialog first
    const app = applications.find(a => a.id === appId);
    setConfirmationDialog({
      isOpen: true,
      type,
      applicationId: appId,
      applicationType,
      applicationName: app?.userName || 'Unknown'
    });
  };

  const handleConfirmAction = () => {
    const { type, applicationId, applicationType } = confirmationDialog;
    if (!applicationId || !type) return;

    // For approve and reactivate, execute immediately
    if (type === 'approve' || type === 'reactivate') {
      confirmActionDirectly(type, applicationId, applicationType);
    } else {
      // For reject and suspend, open the reason modal
      setActionModal({
        isOpen: true,
        type,
        applicationId,
        applicationType: applicationType!,
        reason: ''
      });
    }
    setConfirmationDialog({
      isOpen: false,
      type: null,
      applicationId: null,
      applicationType: null,
      applicationName: null
    });
  };

  const confirmActionDirectly = async (
    type: 'approve' | 'reactivate',
    applicationId: string,
    applicationType: string | null
  ) => {
    const normalizedApplicationType: ApplicationRole | undefined =
      applicationType === 'rider' || applicationType === 'store' || applicationType === 'serviceprovider'
        ? applicationType
        : undefined;

    try {
      let success = false;
      let actionMessage = '';
      if (type === 'approve') {
        success = await approveApplication(applicationId, undefined, normalizedApplicationType);
        actionMessage = 'Application approved successfully';
      } else if (type === 'reactivate') {
        success = await approveApplication(applicationId, undefined, normalizedApplicationType);
        actionMessage = 'Application reactivated successfully';
      }

      if (success) {
        toast.success(actionMessage);
        setSelectedDetail(null);
        await loadApplications();
      }
    } catch (error) {
      console.error('Error taking action:', error);
      toast.error('Failed to process action');
    }
  };

  const confirmAction = async () => {
    const { type, applicationId, applicationType, reason } = actionModal;
    if (!applicationId || !type) return;

    const normalizedApplicationType: ApplicationRole | undefined =
      applicationType === 'rider' || applicationType === 'store' || applicationType === 'serviceprovider'
        ? applicationType
        : undefined;

    try {
      let success = false;
      let actionMessage = '';
      switch (type) {
        case 'reject':
          success = await rejectApplication(applicationId, reason, normalizedApplicationType);
          actionMessage = 'Application rejected successfully';
          break;
        case 'suspend':
          success = await suspendApplication(applicationId, reason, normalizedApplicationType);
          actionMessage = 'Application suspended successfully';
          break;
      }

      if (success) {
        toast.success(actionMessage);
        setActionModal({ isOpen: false, type: null, applicationId: null, applicationType: null, reason: '' });
        setSelectedDetail(null);
        await loadApplications();
      }
    } catch (error) {
      console.error('Error taking action:', error);
      toast.error('Failed to process action');
    }
  };

  const getNormalizedStatus = (status: ApplicationStatus | string | undefined): ApplicationStatus => {
    // backend may return "submitted" instead of "pending".
    if (status === 'submitted' || !status) return 'pending';
    return status as ApplicationStatus;
  };

  const getStatusBadge = (status: ApplicationStatus | string | undefined) => {
    const normalized = getNormalizedStatus(status);

    const config: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock, label: 'Pending' },
      approved: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle, label: 'Approved' },
      rejected: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle, label: 'Rejected' },
      suspended: { bg: 'bg-orange-50', text: 'text-orange-700', icon: AlertCircle, label: 'Suspended' }
    };

    const cfg = config[normalized] || config['pending'];
    const Icon = cfg.icon;

    return (
      <Badge className={cn('flex gap-1 w-fit', cfg.bg, cfg.text)}>
        <Icon size={14} />
        {cfg.label}
      </Badge>
    );
  };

  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      rider: 'Rider',
      store: 'Store',
      serviceprovider: 'Service Provider'
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      rider: 'bg-blue-100 text-blue-800',
      store: 'bg-purple-100 text-purple-800',
      serviceprovider: 'bg-teal-100 text-teal-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const canTakeAction = (app: Application): boolean => {
    const normalized = getNormalizedStatus(app.status);
    return normalized === 'pending' || normalized === 'approved' || normalized === 'suspended';
  };

  const hasUnverifiedDocuments = (): boolean => {
    if (!riderDetail?.documents || riderDetail.documents.length === 0) {
      return false;
    }
    return riderDetail.documents.some((doc: any) => !doc.isVerified || doc.status === 'pending');
  };

  const handleViewDetails = async (app: Application) => {
    setSelectedDetail(app);
    setRiderDetail(null);

    // If it's a rider application, fetch detailed rider information
    if (app.applicationType === 'rider') {
      setIsRiderDetailLoading(true);
      try {
        const detail = await AdminService.getRiderDetail(app.id);
        setRiderDetail(detail);
      } catch (error) {
        console.error('Error fetching rider detail:', error);
        // Continue with basic application detail
      } finally {
        setIsRiderDetailLoading(false);
      }
    }
  };

  const handleVerifyDocument = async (documentId: string) => {
    setVerifyingDocumentId(documentId);
    try {
      const verifiedDocument = await AdminService.verifyDocument(documentId);
      // Update the document status in the riderDetail with the response from backend
      if (riderDetail?.documents) {
        const updatedDocuments = riderDetail.documents.map((doc: any) =>
          doc.id === documentId ? verifiedDocument : doc
        );
        setRiderDetail({ ...riderDetail, documents: updatedDocuments });
      }
      // Show success message
      console.log('Document verified successfully');
    } catch (error) {
      console.error('Error verifying document:', error);
      // Show error message
    } finally {
      setVerifyingDocumentId(null);
    }
  };

  const getDetailContent = (app: Application) => {
    if (app.applicationType === 'rider') {
      if (riderDetail) {
        // Use the detailed rider API response
        return (
          <div className="space-y-6">
            {/* Rider Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">Completed</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{riderDetail.totalCompletedRides || 0}</p>
                <p className="text-xs text-blue-600 mt-1">Rides</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle size={16} className="text-red-600" />
                  <span className="text-xs font-medium text-red-700">Cancelled</span>
                </div>
                <p className="text-2xl font-bold text-red-900">{riderDetail.cancelledRides || 0}</p>
                <p className="text-xs text-red-600 mt-1">Rides</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-xs font-medium text-green-700">Reviews</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{riderDetail.reviews || 0}</p>
                <p className="text-xs text-green-600 mt-1">Count</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">Rating</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {riderDetail.rating ? riderDetail.rating.toFixed(1) : '0'}⭐
                </p>
                <p className="text-xs text-purple-600 mt-1">Score</p>
              </div>
            </div>

            {/* Vehicle & License Info */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={18} />
                Vehicle & License Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Vehicle Type</p>
                    <p className="text-gray-900">{riderDetail.vehicle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Plate Number</p>
                    <p className="text-gray-900">{riderDetail.plate}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Phone Number</p>
                    <p className="text-gray-900">{riderDetail.user?.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Online Status</p>
                    <Badge className={riderDetail.onlineStatus === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {riderDetail.onlineStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Credits Overview */}
            {riderDetail.credits && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} />
                  Credits & Wallet Information
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-sm text-green-700 font-medium mb-1">Total Credits</p>
                    <p className="text-2xl font-bold text-green-900">{riderDetail.credits.totalCredits || 0}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-sm text-green-700 font-medium mb-1">Total Value</p>
                    <p className="text-2xl font-bold text-green-900">₱{parseFloat(riderDetail.credits.totalValue || '0').toFixed(2)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-sm text-green-700 font-medium mb-1">Transactions</p>
                    <p className="text-2xl font-bold text-green-900">{riderDetail.credits.transactionCount || 0}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-sm text-green-700 font-medium mb-1">Booking Status</p>
                    <Badge className={riderDetail.credits.canAcceptBookings ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {riderDetail.credits.canAcceptBookings ? 'Can Accept' : 'Restricted'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction History */}
            {riderDetail.credits?.transactions && riderDetail.credits.transactions.length > 0 && (
              <div className="space-y-4">
                <button
                  onClick={() => setIsTransactionHistoryOpen(!isTransactionHistoryOpen)}
                  className="w-full flex items-center justify-between gap-3 pb-2 border-b border-gray-200 hover:bg-gray-50 p-2 -m-2 rounded transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <TrendingUp size={20} className="text-teal-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-lg text-gray-900">Transaction History</h4>
                      <p className="text-sm text-gray-600">{riderDetail.credits.transactions.length} transactions recorded</p>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 transition-transform duration-300 ${isTransactionHistoryOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={24} className="text-gray-600" />
                  </div>
                </button>
                
                {isTransactionHistoryOpen && (
                  <div className="overflow-x-auto animate-in fade-in duration-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-700">ID</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-700">Type</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-700">Credits</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-700">Used</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-700">Remaining</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-700">Value</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-700">Status</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-700">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {riderDetail.credits.transactions.map((transaction: any, index: number) => (
                          <TableRow key={transaction.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                            <TableCell className="text-xs text-gray-900 font-medium">#{transaction.id}</TableCell>
                            <TableCell className="text-xs">
                              <Badge className={`text-xs font-medium ${
                                transaction.transactionType === 'trial' ? 'bg-blue-100 text-blue-800' :
                                transaction.transactionType === 'purchase' ? 'bg-green-100 text-green-800' :
                                transaction.transactionType === 'refund' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {transaction.transactionType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs font-semibold text-gray-900">{transaction.creditCount}</TableCell>
                            <TableCell className="text-xs text-gray-600">{transaction.creditsUsed}</TableCell>
                            <TableCell className="text-xs font-medium text-gray-900">{transaction.creditsRemaining}</TableCell>
                            <TableCell className="text-xs font-semibold text-gray-900">₱{parseFloat(transaction.value || '0').toFixed(2)}</TableCell>
                            <TableCell className="text-xs">
                              <Badge className={`text-xs font-medium ${
                                transaction.status === 'active' ? 'bg-green-100 text-green-800' :
                                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {(transaction.status || 'active').charAt(0).toUpperCase() + (transaction.status || 'active').slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-gray-600">{new Date(transaction.purchaseDate).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            {/* Documents Section */}
            <div className="space-y-4">
              {(() => {
                const totalDocs = riderDetail.documents?.length || 0;
                const verifiedDocs = riderDetail.documents?.filter((doc: any) => doc.isVerified).length || 0;
                const pendingDocs = riderDetail.documents?.filter((doc: any) => doc.status === 'pending').length || 0;
                const expiredDocs = riderDetail.documents?.filter((doc: any) => doc.expirationDate && new Date(doc.expirationDate) < new Date()).length || 0;
                
                return (
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FileText size={18} />
                      Documents ({totalDocs})
                    </h4>
                    <div className="flex gap-2 text-sm">
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle size={14} />
                        {verifiedDocs} Verified
                      </span>
                      <span className="text-yellow-600 flex items-center gap-1">
                        <Clock size={14} />
                        {pendingDocs} Pending
                      </span>
                      {expiredDocs > 0 && (
                        <span className="text-red-600 flex items-center gap-1">
                          <XCircle size={14} />
                          {expiredDocs} Expired
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
              

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {riderDetail.documents && riderDetail.documents.length > 0 ? (
                  riderDetail.documents.map((doc: any, index: number) => {
                  // Debug logging for image URLs
                  console.log(`Document ${index}:`, {
                    type: doc.documentType,
                    number: doc.documentNumber,
                    imageUrl: doc.imageUrl,
                    status: doc.status
                  });

                  return (
                    <div key={doc.id || index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {/* Document Header */}
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-gray-500" />
                            <p className="font-medium text-sm text-gray-900">
                              {doc.documentNumber || doc.documentType}
                            </p>
                          </div>
                          <Badge className={cn(
                            'text-xs font-medium px-2 py-1',
                            doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            doc.isVerified ? 'bg-green-100 text-green-800 border-green-200' :
                            'bg-red-100 text-red-800 border-red-200'
                          )}>
                            {doc.status === 'pending' ? '⏳ Pending' :
                             doc.isVerified ? '✓ Verified' : '❌ Rejected'}
                          </Badge>
                        </div>
                        {doc.documentType && (
                          <p className="text-xs text-gray-500 mt-1 capitalize">
                            {doc.documentType.replace(/_/g, ' ')}
                          </p>
                        )}
                      </div>

                      {/* Document Image */}
                      <div className="relative group">
                        {doc.imageUrl ? (
                          <>
                            <img
                              src={doc.imageUrl}
                              alt={doc.documentNumber || doc.documentType}
                              className="w-full h-48 bg-white object-contain cursor-pointer transition-transform duration-200 group-hover:scale-[1.02]"
                              onClick={() => setSelectedDocument(doc)}
                              onLoad={(e) => {
                                // Image loaded successfully, hide the fallback
                                const nextSibling = e.currentTarget.nextElementSibling as HTMLElement | null;
                                if (nextSibling) {
                                  nextSibling.style.display = 'none';
                                }
                              }}
                              onError={(e) => {
                                console.log('Image failed to load:', doc.imageUrl);
                                e.currentTarget.style.display = 'none';
                                const nextSibling = e.currentTarget.nextElementSibling as HTMLElement | null;
                                if (nextSibling) {
                                  nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                              <div className="text-center text-gray-500">
                                <FileText size={24} className="mx-auto mb-2" />
                                <p className="text-xs">Loading image...</p>
                                <p className="text-xs text-gray-400 mt-1 break-all px-2">
                                  {doc.documentType}
                                </p>
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center pointer-events-none">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Eye size={24} className="text-white" />
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedDocument(doc)}
                              className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200"
                              title="View full size"
                            >
                              <Eye size={14} className="text-gray-700" />
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <FileText size={24} className="mx-auto mb-2" />
                              <p className="text-xs">No image available</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {doc.documentType}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Document Details */}
                      <div className="px-4 py-3 space-y-2">
                        {doc.expirationDate && (
                          <div className="flex items-center gap-2 text-xs">
                            <Clock size={12} className="text-gray-400" />
                            <span className="text-gray-600">
                              Expires: {new Date(doc.expirationDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {doc.rejectionReason && (
                          <div className="bg-red-50 border border-red-200 rounded p-2">
                            <p className="text-xs text-red-700 font-medium">Rejection Reason:</p>
                            <p className="text-xs text-red-600 mt-1">{doc.rejectionReason}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Uploaded: {new Date(doc.dateCreated).toLocaleDateString()}</span>
                          {doc.verifiedByUserId && (
                            <span>Verified by: {doc.verifiedByUserId}</span>
                          )}
                        </div>

                        {/* Verify Button */}
                        {!doc.isVerified && doc.status === 'pending' && (
                          <div className="pt-3 border-t border-gray-100">
                            <Button
                              size="sm"
                              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs"
                              onClick={() => handleVerifyDocument(doc.id)}
                              disabled={verifyingDocumentId === doc.id}
                            >
                              {verifyingDocumentId === doc.id ? (
                                <>
                                  <Spinner size="sm" className="mr-2" />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={14} className="mr-2" />
                                  Verify Document
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
                ) : (
                  <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText size={32} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium">No documents uploaded yet</p>
                    <p className="text-sm text-gray-500 mt-1">Documents will appear here once submitted</p>
                  </div>
                )}
              </div>

              {/* Summary Stats */}
              {(() => {
                const totalDocs = riderDetail.documents?.length || 0;
                const verifiedDocs = riderDetail.documents?.filter((doc: any) => doc.isVerified).length || 0;
                const pendingDocs = riderDetail.documents?.filter((doc: any) => doc.status === 'pending').length || 0;
                const expiredDocs = riderDetail.documents?.filter((doc: any) => doc.expirationDate && new Date(doc.expirationDate) < new Date()).length || 0;
                
                return (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{totalDocs}</p>
                        <p className="text-xs text-gray-600">Total Documents</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{verifiedDocs}</p>
                        <p className="text-xs text-gray-600">Verified</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">{pendingDocs}</p>
                        <p className="text-xs text-gray-600">Pending Review</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">{expiredDocs}</p>
                        <p className="text-xs text-gray-600">Expired</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
            </div>
          </div>
        );
      } else if (isRiderDetailLoading) {
        return (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        );
      } else {
        // Enhanced fallback view for rider applications
        const rider = app as RiderApplication;
        return (
          <div className="space-y-6">
            {/* Basic Rider Info */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={18} />
                Rider Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Vehicle Type</p>
                    <p className="text-gray-900">{rider.documents?.vehicleType || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Plate Number</p>
                    <p className="text-gray-900">{rider.documents?.plateNumber || 'Not specified'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">License Number</p>
                    <p className="text-gray-900">{rider.documents?.licenseNumber || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">License Expiry</p>
                    <p className="text-gray-900">
                      {rider.documents?.licenseExpiry ? new Date(rider.documents.licenseExpiry).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Experience Section */}
            {rider.experience && (
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} />
                  Experience & Background
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Years of Experience</p>
                    <p className="text-blue-900 text-lg font-semibold">{rider.experience.years} years</p>
                  </div>
                  {rider.experience.previousCompanies && (
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Previous Companies</p>
                      <p className="text-blue-900">{rider.experience.previousCompanies}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }
    } else if (app.applicationType === 'store') {
      const seller = app as SellerApplication;
      return (
        <div className="space-y-6">
          {/* Business Overview */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={18} />
              Business Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Business Name</p>
                  <p className="text-gray-900 font-semibold">{seller.businessInfo?.businessName || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Business Type</p>
                  <p className="text-gray-900">{seller.businessInfo?.businessType || 'Not specified'}</p>
                </div>
              </div>
              <div className="space-y-3">
                {seller.businessInfo?.registrationNumber && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Registration Number</p>
                    <p className="text-gray-900">{seller.businessInfo.registrationNumber}</p>
                  </div>
                )}
                {seller.estimatedMonthlyRevenue && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Est. Monthly Revenue</p>
                    <p className="text-gray-900 font-semibold text-green-600">
                      ₱{seller.estimatedMonthlyRevenue.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Business Description */}
          {seller.businessInfo?.description && (
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <FileText size={18} />
                Business Description
              </h4>
              <p className="text-blue-800 leading-relaxed">{seller.businessInfo.description}</p>
            </div>
          )}

          {/* Store Stats Placeholder */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
              <TrendingUp size={18} />
              Store Performance (Coming Soon)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-3 rounded border">
                <p className="text-2xl font-bold text-green-600">--</p>
                <p className="text-xs text-green-700">Total Orders</p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-2xl font-bold text-green-600">--</p>
                <p className="text-xs text-green-700">Rating</p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-2xl font-bold text-green-600">--</p>
                <p className="text-xs text-green-700">Products</p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-2xl font-bold text-green-600">--</p>
                <p className="text-xs text-green-700">Revenue</p>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (app.applicationType === 'serviceprovider') {
      const provider = app as ServiceProviderApplication;
      return (
        <div className="space-y-6">
          {/* Service Overview */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={18} />
              Service Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Service Name</p>
                  <p className="text-gray-900 font-semibold">{provider.serviceInfo?.serviceName || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Category</p>
                  <p className="text-gray-900">{provider.serviceInfo?.category || 'Not specified'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Experience</p>
                  <p className="text-gray-900 font-semibold">{provider.serviceInfo?.experience || 0} years</p>
                </div>
                {provider.rating && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Rating</p>
                    <p className="text-gray-900 font-semibold text-yellow-600">
                      ⭐ {provider.rating.toFixed(1)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Service Description */}
          {provider.serviceInfo?.description && (
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <FileText size={18} />
                Service Description
              </h4>
              <p className="text-purple-800 leading-relaxed">{provider.serviceInfo.description}</p>
            </div>
          )}

          {/* Service Provider Stats */}
          <div className="bg-teal-50 p-6 rounded-lg border border-teal-200">
            <h4 className="font-semibold text-teal-900 mb-4 flex items-center gap-2">
              <TrendingUp size={18} />
              Service Performance
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-3 rounded border">
                <p className="text-2xl font-bold text-teal-600">--</p>
                <p className="text-xs text-teal-700">Completed Jobs</p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-2xl font-bold text-teal-600">
                  {provider.rating ? provider.rating.toFixed(1) : '--'}
                </p>
                <p className="text-xs text-teal-700">Rating</p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-2xl font-bold text-teal-600">--</p>
                <p className="text-xs text-teal-700">Active Jobs</p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-2xl font-bold text-teal-600">--</p>
                <p className="text-xs text-teal-700">Earnings</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (isLoading && !applications.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Build table columns
  const tableColumns = [
    {
      key: 'applicant',
      label: 'Applicant',
      render: (row: Application) => (
        <div className="flex items-center gap-3">
          <Avatar
            src=""
            alt={row.userName || 'Unknown'}
            className="h-10 w-10 border-2 border-gray-200"
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm text-gray-900 truncate">
              {row.userName || 'Unknown User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              ID: {row.userId || row.id}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'applicationType',
      label: 'Role',
      render: (row: Application) => (
        <Badge className={cn('w-fit font-medium', getRoleColor(row.applicationType))}>
          {getRoleLabel(row.applicationType)}
        </Badge>
      )
    },
    {
      key: 'userAddress',
      label: 'Location',
      render: (row: Application) => (
        <div className="flex items-start gap-2 text-sm">
          <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 truncate max-w-[200px]" title={row.userAddress}>
            {row.userAddress || 'No address provided'}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Application) => getStatusBadge(row.status)
    },
    {
      key: 'submittedAt',
      label: 'Applied Date',
      render: (row: Application) => (
        <div className="text-sm">
          <p className="text-gray-900 font-medium">
            {new Date(row.submittedAt).toLocaleDateString()}
          </p>
          <p className="text-gray-500 text-xs">
            {new Date(row.submittedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: Application) => (
        <div className="flex gap-1 justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetails(row)}
            className="h-8 w-8 p-0"
            title="View Details"
          >
            <Eye size={14} />
          </Button>
          {canTakeAction(row) && (
            <>
              {getNormalizedStatus(row.status) === 'pending' && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                    onClick={() => handleAction('approve', row.id, row.applicationType)}
                    disabled={isActionLoading}
                    title="Approve Application"
                  >
                    <CheckCircle size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleAction('reject', row.id, row.applicationType)}
                    disabled={isActionLoading}
                    title="Reject Application"
                  >
                    <XCircle size={14} />
                  </Button>
                </>
              )}
              {getNormalizedStatus(row.status) === 'approved' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                  onClick={() => handleAction('suspend', row.id, row.applicationType)}
                  disabled={isActionLoading}
                  title="Suspend Application"
                >
                  <AlertCircle size={14} />
                </Button>
              )}
              {getNormalizedStatus(row.status) === 'suspended' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                  onClick={() => handleAction('reactivate', row.id, row.applicationType)}
                  disabled={isActionLoading}
                  title="Reactivate Application"
                >
                  <CheckCircle size={14} />
                </Button>
              )}
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Application Management</h1>
        <p className="text-gray-600 mt-2">
          Review and manage applications from users wanting to become riders, sellers, or service providers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-yellow-500" onClick={() => setActiveTab('pending')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{statusCounts.pending}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <Clock className="text-yellow-500" size={24} />
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500" onClick={() => setActiveTab('approved')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Approved</p>
              <p className="text-3xl font-bold text-green-600">{statusCounts.approved}</p>
              <p className="text-xs text-gray-500 mt-1">Active applications</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-red-500" onClick={() => setActiveTab('rejected')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{statusCounts.rejected}</p>
              <p className="text-xs text-gray-500 mt-1">Not approved</p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <XCircle className="text-red-500" size={24} />
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-orange-500" onClick={() => setActiveTab('suspended')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Suspended</p>
              <p className="text-3xl font-bold text-orange-600">{statusCounts.suspended}</p>
              <p className="text-xs text-gray-500 mt-1">Temporarily inactive</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <AlertCircle className="text-orange-500" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search by name, email, or community..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <div className="flex gap-3 items-center">
            <Select
              value={roleFilter}
              options={[
                { label: 'All Roles', value: 'all' },
                { label: 'Riders', value: 'rider' },
                { label: 'Stores', value: 'store' },
                { label: 'Service Providers', value: 'serviceprovider' }
              ]}
              onChange={(val) => setRoleFilter(val as ApplicationRole | 'all')}
              placeholder="All Roles"
              className="w-[180px]"
            />
            {(searchQuery || roleFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                }}
                className="h-11 px-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        {(searchQuery || roleFilter !== 'all') && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter size={16} />
            <span>
              Showing {roleFilter !== 'all' ? `${getRoleLabel(roleFilter)} applications` : 'all applications'}
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
          </div>
        )}
      </Card>

      {/* Applications List with Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <div className="flex border-b border-gray-200 bg-white">
            <TabList className="flex gap-0 w-full bg-gray-50/30 p-1 rounded-t-lg">
              <TabTrigger
                value="pending"
                className="flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600 data-[state=active]:border-b-2 data-[state=active]:border-teal-500"
              >
                Pending ({statusCounts.pending})
              </TabTrigger>
              <TabTrigger
                value="approved"
                className="flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600 data-[state=active]:border-b-2 data-[state=active]:border-teal-500"
              >
                Approved ({statusCounts.approved})
              </TabTrigger>
              <TabTrigger
                value="rejected"
                className="flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600 data-[state=active]:border-b-2 data-[state=active]:border-teal-500"
              >
                Rejected ({statusCounts.rejected})
              </TabTrigger>
              <TabTrigger
                value="suspended"
                className="flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600 data-[state=active]:border-b-2 data-[state=active]:border-teal-500"
              >
                Suspended ({statusCounts.suspended})
              </TabTrigger>
            </TabList>
          </div>

          <div className="p-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Spinner size="lg" className="mb-4" />
                <p className="text-gray-500">Loading applications...</p>
              </div>
            ) : (
              <TemplateTable
                columns={tableColumns}
                data={applications}
                loading={isLoading}
                empty={{
                  title: 'No applications found',
                  description: activeTab === 'all'
                    ? 'There are no applications to review at this time.'
                    : `No ${activeTab} applications found. Try adjusting your filters.`
                }}
                pagination={{
                  currentPage,
                  pageSize,
                  total: totalApplications
                }}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </Tabs>
      </Card>

      {/* Detail Drawer/Modal */}
      <Dialog open={!!selectedDetail} onOpenChange={(open) => {
        if (!open) {
          setSelectedDetail(null);
          setRiderDetail(null);
          setIsRiderDetailLoading(false);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {isDetailLoading || isRiderDetailLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : selectedDetail ? (
            <>
              <DialogHeader>
                <DialogTitle>Application Details</DialogTitle>
                <DialogDescription>
                  View and manage application details
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Enhanced Applicant Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <Avatar
                        src={riderDetail?.user?.profilePictureUrl || ""}
                        alt={riderDetail?.user?.userName || selectedDetail.userName || 'Unknown'}
                        className="h-16 w-16 border-4 border-white shadow-md"
                      />
                      <div className="space-y-2">
                        <h3 className="font-bold text-xl text-gray-900">
                          {riderDetail?.user?.userName || selectedDetail.userName || 'Unknown User'}
                        </h3>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Mail size={14} className="text-gray-400" />
                            {riderDetail?.user?.email || selectedDetail.userId || 'No email provided'}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <MapPin size={14} className="text-gray-400" />
                            {selectedDetail.userAddress || 'No address provided'}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            {riderDetail?.user?.phoneNumber || 'No phone provided'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={cn('font-medium', getRoleColor(selectedDetail.applicationType))}>
                            {getRoleLabel(selectedDetail.applicationType)}
                          </Badge>
                          {riderDetail && (
                            <Badge className={riderDetail.onlineStatus === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {riderDetail.onlineStatus === 'online' ? '🟢 Online' : '⚪ Offline'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="mb-2">{getStatusBadge(selectedDetail.status)}</div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Applied: {new Date(selectedDetail.submittedAt).toLocaleDateString()}</p>
                        <p>Application ID: {String(selectedDetail.id).slice(-8)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">Application Information</h4>
                      <p className="text-sm text-gray-600">Detailed review of the application submission</p>
                    </div>
                  </div>
                  {getDetailContent(selectedDetail)}
                </div>

                {/* Review Info */}
                {selectedDetail.reviewedByUserId && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1 bg-amber-100 rounded">
                        <CheckCircle size={16} className="text-amber-600" />
                      </div>
                      <h4 className="font-semibold text-amber-900">Review Information</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-amber-800">
                        <span className="font-medium">Reviewed by:</span> {selectedDetail.reviewedByUserId}
                      </p>
                      {selectedDetail.reviewedAt && (
                        <p className="text-amber-800">
                          <span className="font-medium">Reviewed on:</span> {new Date(selectedDetail.reviewedAt).toLocaleDateString()}{' '}
                          {new Date(selectedDetail.reviewedAt).toLocaleTimeString()}
                        </p>
                      )}
                      {selectedDetail.remarks && (
                        <div className="mt-3">
                          <p className="font-medium text-amber-800 mb-1">Remarks:</p>
                          <p className="text-amber-700 bg-amber-100 p-2 rounded text-sm leading-relaxed">
                            {selectedDetail.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {hasUnverifiedDocuments() && getNormalizedStatus(selectedDetail.status) === 'pending' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-1">Documents Not Verified</h4>
                      <p className="text-sm text-orange-800">
                        All documents must be verified before approving this application. Please review and verify all pending documents first.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-3 border-t pt-6">
                <Button variant="outline" onClick={() => setSelectedDetail(null)}>
                  Close
                </Button>
                {canTakeAction(selectedDetail) && (
                  <>
                    {getNormalizedStatus(selectedDetail.status) === 'pending' && (
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                          onClick={() => handleAction('reject', selectedDetail.id, selectedDetail.applicationType)}
                          disabled={isActionLoading}
                        >
                          {isActionLoading ? <Spinner size="sm" /> : <XCircle size={16} className="mr-2" />}
                          Deny Application
                        </Button>
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleAction('approve', selectedDetail.id, selectedDetail.applicationType)}
                          disabled={isActionLoading || hasUnverifiedDocuments()}
                          title={hasUnverifiedDocuments() ? 'Cannot approve: All documents must be verified first' : 'Approve Application'}
                        >
                          {isActionLoading ? <Spinner size="sm" /> : <CheckCircle size={16} className="mr-2" />}
                          Approve Application
                        </Button>
                      </div>
                    )}
                    {getNormalizedStatus(selectedDetail.status) === 'approved' && (
                      <Button
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => handleAction('suspend', selectedDetail.id, selectedDetail.applicationType)}
                        disabled={isActionLoading}
                      >
                        {isActionLoading ? <Spinner size="sm" /> : <AlertCircle size={16} className="mr-2" />}
                        Suspend Application
                      </Button>
                    )}
                    {getNormalizedStatus(selectedDetail.status) === 'suspended' && (
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAction('reactivate', selectedDetail.id, selectedDetail.applicationType)}
                        disabled={isActionLoading}
                      >
                        {isActionLoading ? <Spinner size="sm" /> : <CheckCircle size={16} className="mr-2" />}
                        Reactivate Application
                      </Button>
                    )}
                  </>
                )}
                {!canTakeAction(selectedDetail) && (
                  <p className="text-sm text-gray-500">No actions available for this application status.</p>
                )}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmationDialog.isOpen} onOpenChange={(open) => !open && setConfirmationDialog({ isOpen: false, type: null, applicationId: null, applicationType: null, applicationName: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirm {confirmationDialog.type === 'approve' || confirmationDialog.type === 'reactivate' ? 'Approval' : confirmationDialog.type === 'reject' ? 'Rejection' : 'Suspension'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to{' '}
              <span className="font-bold">
                {confirmationDialog.type === 'approve' ? 'approve' : confirmationDialog.type === 'reject' ? 'reject' : confirmationDialog.type === 'reactivate' ? 'reactivate' : 'suspend'}
              </span>
              {' '}the application for <span className="font-semibold text-gray-900">{confirmationDialog.applicationName}</span>?
            </p>
            {confirmationDialog.type === 'reject' || confirmationDialog.type === 'suspend' ? (
              <p className="text-sm text-gray-500">You will be asked to provide a reason for this action.</p>
            ) : null}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmationDialog({ isOpen: false, type: null, applicationId: null, applicationType: null, applicationName: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              className={cn(
                'text-white',
                confirmationDialog.type === 'approve' || confirmationDialog.type === 'reactivate' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              )}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Modal (for reason input on reject/suspend) */}
      <Dialog open={actionModal.isOpen} onOpenChange={(open) => !open && setActionModal({ isOpen: false, type: null, applicationId: null, applicationType: null, reason: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionModal.type === 'reject' && 'Reject Application'}
              {actionModal.type === 'suspend' && 'Suspend Application'}
            </DialogTitle>
            <DialogDescription>
              {actionModal.type === 'reject' && 'Please provide a reason for rejecting this application.'}
              {actionModal.type === 'suspend' && 'Suspend this application and notify the applicant.'}
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Enter reason..."
            value={actionModal.reason}
            onChange={(e) =>
              setActionModal({ ...actionModal, reason: e.target.value })
            }
            className="h-20"
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setActionModal({
                  isOpen: false,
                  type: null,
                  applicationId: null,
                  applicationType: null,
                  reason: ''
                })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={
                isActionLoading || !actionModal.reason.trim()
              }
              className={
                actionModal.type === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }
            >
              {isActionLoading ? <Spinner size="sm" /> : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Modal */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText size={20} />
                {selectedDocument.documentType}
                {selectedDocument.documentNumber && (
                  <span className="text-sm text-gray-500">({selectedDocument.documentNumber})</span>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="relative bg-gray-50 rounded-lg overflow-hidden min-h-[200px]">
                {selectedDocument.imageUrl ? (
                  <>
                    <img
                      src={selectedDocument.imageUrl}
                      alt={selectedDocument.documentNumber || selectedDocument.documentType}
                      className="w-full max-h-[60vh] object-contain"
                      onLoad={(e) => {
                        // Image loaded successfully, hide the fallback
                        const nextSibling = e.currentTarget.nextElementSibling as HTMLElement | null;
                        if (nextSibling) {
                          nextSibling.style.display = 'none';
                        }
                      }}
                      onError={(e) => {
                        console.log('Modal image failed to load:', selectedDocument.imageUrl);
                        e.currentTarget.style.display = 'none';
                        const nextSibling = e.currentTarget.nextElementSibling as HTMLElement | null;
                        if (nextSibling) {
                          nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <FileText size={48} className="mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">Loading image...</p>
                        <p className="text-sm text-gray-400 mb-2">
                          {selectedDocument.documentType}
                        </p>
                        <p className="text-xs text-gray-400 break-all px-4">
                          URL: {selectedDocument.imageUrl}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <FileText size={48} className="mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">No image available</p>
                      <p className="text-sm text-gray-400">
                        {selectedDocument.documentType}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Document Type:</span>
                  <p className="text-gray-600">{selectedDocument.documentType}</p>
                </div>
                {selectedDocument.documentNumber && (
                  <div>
                    <span className="font-medium text-gray-700">Document Number:</span>
                    <p className="text-gray-600">{selectedDocument.documentNumber}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <p className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    selectedDocument.verificationStatus === 'verified'
                      ? 'bg-green-100 text-green-800'
                      : selectedDocument.verificationStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedDocument.verificationStatus === 'verified' && <CheckCircle size={12} />}
                    {selectedDocument.verificationStatus === 'pending' && <Clock size={12} />}
                    {selectedDocument.verificationStatus === 'expired' && <XCircle size={12} />}
                    {selectedDocument.verificationStatus}
                  </p>
                </div>
                {selectedDocument.expiryDate && (
                  <div>
                    <span className="font-medium text-gray-700">Expiry Date:</span>
                    <p className="text-gray-600">{new Date(selectedDocument.expiryDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedDocument.imageUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  Open in New Tab
                </Button>
                <Button onClick={() => setSelectedDocument(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ApplicationManagementPage;
