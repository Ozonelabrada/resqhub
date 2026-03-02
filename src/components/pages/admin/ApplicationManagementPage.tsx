import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApplicationManagement } from '@/hooks/admin';
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
  reason: string;
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
  const [actionModal, setActionModal] = useState<ActionModalState>({
    isOpen: false,
    type: null,
    applicationId: null,
    reason: ''
  });
  const [selectedDetail, setSelectedDetail] = useState<Application | null>(
    applicationDetail
  );

  // Load applications on mount and when filters change
  useEffect(() => {
    loadApplications();
  }, [activeTab, roleFilter, searchQuery]);

  const loadApplications = async () => {
    await fetchApplications({
      status: activeTab === 'all' ? undefined : activeTab,
      role: roleFilter === 'all' ? undefined : roleFilter,
      query: searchQuery || undefined,
      pageSize: 50
    });
  };

  const handleAction = async (
    type: 'approve' | 'reject' | 'suspend' | 'reactivate',
    appId: string
  ) => {
    setActionModal({
      isOpen: true,
      type,
      applicationId: appId,
      reason: ''
    });
  };

  const confirmAction = async () => {
    const { type, applicationId, reason } = actionModal;
    if (!applicationId || !type) return;

    try {
      let success = false;
      switch (type) {
        case 'approve':
          success = await approveApplication(applicationId);
          break;
        case 'reject':
          success = await rejectApplication(applicationId, reason);
          break;
        case 'suspend':
          success = await suspendApplication(applicationId, reason);
          break;
        case 'reactivate':
          success = await reactivateApplication(applicationId, reason);
          break;
      }

      if (success) {
        setActionModal({ isOpen: false, type: null, applicationId: null, reason: '' });
        await loadApplications();
        if (selectedDetail?.id === applicationId) {
          await fetchApplicationDetail(applicationId);
        }
      }
    } catch (error) {
      console.error('Error taking action:', error);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const config = {
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock, label: 'Pending' },
      approved: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle, label: 'Approved' },
      rejected: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle, label: 'Rejected' },
      suspended: { bg: 'bg-orange-50', text: 'text-orange-700', icon: AlertCircle, label: 'Suspended' }
    };

    const cfg = config[status];
    const Icon = cfg.icon;

    return (
      <Badge className={cn('flex gap-1 w-fit', cfg.bg, cfg.text)}>
        <Icon size={14} />
        {cfg.label}
      </Badge>
    );
  };

  const getRoleLabel = (role: ApplicationRole): string => {
    const labels = {
      rider: 'Rider',
      seller: 'Seller',
      service_provider: 'Service Provider'
    };
    return labels[role];
  };

  const getRoleColor = (role: ApplicationRole) => {
    const colors = {
      rider: 'bg-blue-100 text-blue-800',
      seller: 'bg-purple-100 text-purple-800',
      service_provider: 'bg-teal-100 text-teal-800'
    };
    return colors[role];
  };

  const canTakeAction = (app: Application): boolean => {
    return app.status !== 'approved';
  };

  const getDetailContent = (app: Application) => {
    if (app.role === 'rider') {
      const rider = app as RiderApplication;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">License Number</p>
              <p className="font-medium">{rider.documents.licenseNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">License Expiry</p>
              <p className="font-medium">{new Date(rider.documents.licenseExpiry).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vehicle Type</p>
              <p className="font-medium">{rider.documents.vehicleType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Plate Number</p>
              <p className="font-medium">{rider.documents.plateNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Years of Experience</p>
              <p className="font-medium">{rider.experience.years} years</p>
            </div>
            {rider.experience.previousCompanies && (
              <div>
                <p className="text-sm text-gray-600">Previous Companies</p>
                <p className="font-medium">{rider.experience.previousCompanies}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (app.role === 'seller') {
      const seller = app as SellerApplication;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Business Name</p>
              <p className="font-medium">{seller.businessInfo.businessName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Business Type</p>
              <p className="font-medium">{seller.businessInfo.businessType}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Description</p>
              <p className="font-medium">{seller.businessInfo.description}</p>
            </div>
            {seller.businessInfo.registrationNumber && (
              <div>
                <p className="text-sm text-gray-600">Registration Number</p>
                <p className="font-medium">{seller.businessInfo.registrationNumber}</p>
              </div>
            )}
            {seller.estimatedMonthlyRevenue && (
              <div>
                <p className="text-sm text-gray-600">Est. Monthly Revenue</p>
                <p className="font-medium">₱{seller.estimatedMonthlyRevenue.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (app.role === 'service_provider') {
      const provider = app as ServiceProviderApplication;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Service Name</p>
              <p className="font-medium">{provider.serviceInfo.serviceName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="font-medium">{provider.serviceInfo.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Experience</p>
              <p className="font-medium">{provider.serviceInfo.experience} years</p>
            </div>
            {provider.rating && (
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="font-medium">⭐ {provider.rating.toFixed(1)}</p>
              </div>
            )}
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Description</p>
              <p className="font-medium">{provider.serviceInfo.description}</p>
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
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{statusCounts.pending}</p>
            </div>
            <Clock className="text-yellow-500" size={32} />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600">{statusCounts.approved}</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{statusCounts.rejected}</p>
            </div>
            <XCircle className="text-red-500" size={32} />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Suspended</p>
              <p className="text-3xl font-bold text-orange-600">{statusCounts.suspended}</p>
            </div>
            <AlertCircle className="text-orange-500" size={32} />
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search by name, email, or community..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select 
            value={roleFilter} 
            options={[
              { label: 'All Roles', value: 'all' },
              { label: 'Riders', value: 'rider' },
              { label: 'Sellers', value: 'seller' },
              { label: 'Service Providers', value: 'service_provider' }
            ]}
            onChange={(val) => setRoleFilter(val as ApplicationRole | 'all')}
            placeholder="All Roles"
          />
        </div>
      </Card>

      {/* Applications List with Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <div className="flex border-b">
            <TabList className="flex gap-0 w-full bg-gray-50">
              <TabTrigger
                value="pending"
                className="rounded-none flex-1 border-b-2 py-3 data-[state=active]:border-teal-500"
              >
                Pending ({statusCounts.pending})
              </TabTrigger>
              <TabTrigger
                value="approved"
                className="rounded-none flex-1 border-b-2 py-3 data-[state=active]:border-teal-500"
              >
                Approved ({statusCounts.approved})
              </TabTrigger>
              <TabTrigger
                value="rejected"
                className="rounded-none flex-1 border-b-2 py-3 data-[state=active]:border-teal-500"
              >
                Rejected ({statusCounts.rejected})
              </TabTrigger>
              <TabTrigger
                value="suspended"
                className="rounded-none flex-1 border-b-2 py-3 data-[state=active]:border-teal-500"
              >
                Suspended ({statusCounts.suspended})
              </TabTrigger>
            </TabList>
          </div>

          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No applications found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Community</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar 
                              src={app.applicant.profileImage} 
                              alt={app.applicant.name}
                              className="h-8 w-8"
                            />
                            <div>
                              <p className="font-medium text-sm">{app.applicant.name}</p>
                              <p className="text-xs text-gray-500">{app.applicant.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('w-fit', getRoleColor(app.role))}>
                            {getRoleLabel(app.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin size={14} />
                            {app.applicant.communityName}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedDetail(app)}
                            >
                              <Eye size={16} />
                            </Button>
                            {canTakeAction(app) && (
                              <>
                                {app.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-green-600 hover:bg-green-50"
                                      onClick={() => handleAction('approve', app.id)}
                                      disabled={isActionLoading}
                                    >
                                      <CheckCircle size={16} />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600 hover:bg-red-50"
                                      onClick={() => handleAction('reject', app.id)}
                                      disabled={isActionLoading}
                                    >
                                      <XCircle size={16} />
                                    </Button>
                                  </>
                                )}
                                {app.status === 'suspended' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-green-600 hover:bg-green-50"
                                    onClick={() => handleAction('reactivate', app.id)}
                                    disabled={isActionLoading}
                                  >
                                    <CheckCircle size={16} />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </Tabs>
      </Card>

      {/* Detail Drawer/Modal */}
      <Dialog open={!!selectedDetail} onOpenChange={(open) => !open && setSelectedDetail(null)}>
        <DialogContent className="max-w-2xl">
          {isDetailLoading ? (
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
                {/* Applicant Info */}
                <div className="space-y-4 border-b pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <Avatar 
                        src={selectedDetail.applicant.profileImage} 
                        alt={selectedDetail.applicant.name}
                        className="h-12 w-12"
                      />
                      <div>
                        <h3 className="font-bold text-lg">{selectedDetail.applicant.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Mail size={14} />
                          {selectedDetail.applicant.email}
                        </p>
                        {selectedDetail.applicant.phone && (
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Phone size={14} />
                            {selectedDetail.applicant.phone}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                          <MapPin size={14} />
                          {selectedDetail.applicant.communityName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={cn('mb-2', getRoleColor(selectedDetail.role))}>
                        {getRoleLabel(selectedDetail.role)}
                      </Badge>
                      <div>{getStatusBadge(selectedDetail.status)}</div>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText size={18} />
                    Application Information
                  </h4>
                  {getDetailContent(selectedDetail)}
                </div>

                {/* Review Info */}
                {selectedDetail.reviewedBy && (
                  <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
                    <p className="font-medium">Review Information</p>
                    <p>Reviewed by: {selectedDetail.reviewedBy.name}</p>
                    {selectedDetail.reviewedAt && (
                      <p>
                        Reviewed on: {new Date(selectedDetail.reviewedAt).toLocaleDateString()}{' '}
                        {new Date(selectedDetail.reviewedAt).toLocaleTimeString()}
                      </p>
                    )}
                    {selectedDetail.rejectionReason && (
                      <p className="text-red-600">
                        Rejection Reason: {selectedDetail.rejectionReason}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSelectedDetail(null)}>
                  Close
                </Button>
                {canTakeAction(selectedDetail) && (
                  <>
                    {selectedDetail.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => {
                            handleAction('reject', selectedDetail.id);
                            setSelectedDetail(null);
                          }}
                          disabled={isActionLoading}
                        >
                          Reject
                        </Button>
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            approveApplication(selectedDetail.id);
                            setSelectedDetail(null);
                          }}
                          disabled={isActionLoading}
                        >
                          Approve
                        </Button>
                      </>
                    )}
                    {selectedDetail.status === 'suspended' && (
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          reactivateApplication(selectedDetail.id);
                          setSelectedDetail(null);
                        }}
                        disabled={isActionLoading}
                      >
                        Reactivate
                      </Button>
                    )}
                  </>
                )}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Action Modal */}
      <Dialog open={actionModal.isOpen} onOpenChange={(open) => !open && setActionModal({ isOpen: false, type: null, applicationId: null, reason: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionModal.type === 'approve' && 'Approve Application'}
              {actionModal.type === 'reject' && 'Reject Application'}
              {actionModal.type === 'suspend' && 'Suspend Application'}
              {actionModal.type === 'reactivate' && 'Reactivate Application'}
            </DialogTitle>
            <DialogDescription>
              {actionModal.type === 'approve' && 'This applicant will be approved and can start immediately.'}
              {actionModal.type === 'reject' && 'Please provide a reason for rejecting this application.'}
              {actionModal.type === 'suspend' && 'Suspend this application and notify the applicant.'}
              {actionModal.type === 'reactivate' && 'Reactivate this suspended application.'}
            </DialogDescription>
          </DialogHeader>

          {(actionModal.type === 'reject' || actionModal.type === 'suspend') && (
            <Textarea
              placeholder="Enter reason..."
              value={actionModal.reason}
              onChange={(e) =>
                setActionModal({ ...actionModal, reason: e.target.value })
              }
              className="h-20"
            />
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setActionModal({
                  isOpen: false,
                  type: null,
                  applicationId: null,
                  reason: ''
                })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={isActionLoading}
              className={
                actionModal.type === 'approve' || actionModal.type === 'reactivate'
                  ? 'bg-green-600 hover:bg-green-700'
                  : actionModal.type === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }
            >
              {isActionLoading ? <Spinner size="sm" /> : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationManagementPage;
