import React, { useState, useEffect } from 'react';
import { AdminUser, UserListParams } from '@/types/admin';
import AdminService from '@/services/adminService';
import { useWebSocketEmitter } from '@/hooks/useWebSocket';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Shield,
  ShieldOff,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';

interface UserManagementPageProps {
  className?: string;
}

export const UserManagementPage: React.FC<UserManagementPageProps> = ({ className = '' }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    moderators: 0,
    users: 0
  });

  // Filters
  const [filters, setFilters] = useState<UserListParams>({
    page: 1,
    pageSize: 10,
    role: 'all',
    status: 'all',
    query: '',
    sort: 'createdAt',
    order: 'desc'
  });

  // Action dialogs
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    type: 'role' | 'status' | 'delete' | null;
    open: boolean;
  }>({ type: null, open: false });
  const [actionReason, setActionReason] = useState('');
  const [newRole, setNewRole] = useState<AdminUser['role']>('User');

  const { sendAdminBroadcast } = useWebSocketEmitter();

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminService.getUsers(filters);

      if (response.succeeded) {
        setUsers(response.data.items);
        setPagination({
          page: response.data.page,
          pageSize: response.data.pageSize,
          total: response.data.total,
          totalPages: response.data.totalPages
        });
        setSummary({
          total: response.data.summary.total || 0,
          active: response.data.summary.active || 0,
          inactive: response.data.summary.inactive || 0,
          admins: response.data.summary.admins || 0,
          moderators: response.data.summary.moderators || 0,
          users: response.data.summary.users || 0
        });
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;

    try {
      const response = await AdminService.updateUserRole({
        userId: selectedUser.id,
        newRole,
        reason: actionReason
      });

      if (response.succeeded) {
        toast.success(`User role updated to ${newRole}`);
        fetchUsers();

        // Notify via WebSocket if promoting to admin
        if (newRole === 'Admin') {
          sendAdminBroadcast(
            'New Admin Added',
            `${selectedUser.fullName} has been granted admin privileges`
          );
        }
      } else {
        toast.error(response.message || 'Failed to update user role');
      }
    } catch (err) {
      toast.error('Failed to update user role');
    } finally {
      setActionDialog({ type: null, open: false });
      setSelectedUser(null);
      setActionReason('');
    }
  };

  const handleStatusUpdate = async (status: 'Active' | 'Inactive') => {
    if (!selectedUser) return;

    try {
      const response = await AdminService.updateUserStatus({
        userId: selectedUser.id,
        status,
        reason: actionReason
      });

      if (response.succeeded) {
        toast.success(`User ${status === 'Active' ? 'activated' : 'deactivated'}`);
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to update user status');
      }
    } catch (err) {
      toast.error('Failed to update user status');
    } finally {
      setActionDialog({ type: null, open: false });
      setSelectedUser(null);
      setActionReason('');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await AdminService.deleteUser(selectedUser.id, actionReason);

      if (response.succeeded) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to delete user');
      }
    } catch (err) {
      toast.error('Failed to delete user');
    } finally {
      setActionDialog({ type: null, open: false });
      setSelectedUser(null);
      setActionReason('');
    }
  };

  const getRoleBadgeVariant = (role: AdminUser['role']) => {
    switch (role) {
      case 'Admin': return 'destructive';
      case 'Moderator': return 'secondary';
      case 'User': return 'default';
      default: return 'default';
    }
  };

  const getRoleIcon = (role: AdminUser['role']) => {
    switch (role) {
      case 'Admin': return <Shield className="w-3 h-3" />;
      case 'Moderator': return <ShieldOff className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">{summary.total} total users</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{summary.active}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{summary.inactive}</p>
              </div>
              <UserX className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-purple-600">{summary.admins}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Moderators</p>
                <p className="text-2xl font-bold text-blue-600">{summary.moderators}</p>
              </div>
              <ShieldOff className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Regular Users</p>
                <p className="text-2xl font-bold text-gray-600">{summary.users}</p>
              </div>
              <Users className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Name, email, or username..."
                  value={filters.query || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value, page: 1 }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={filters.role || 'all'}
                onValueChange={(value) => setFilters(prev => ({
                  ...prev,
                  role: value as UserListParams['role'],
                  page: 1
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Moderator">Moderator</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters(prev => ({
                  ...prev,
                  status: value as UserListParams['status'],
                  page: 1
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort">Sort By</Label>
              <Select
                value={`${filters.sort || 'createdAt'}_${filters.order || 'desc'}`}
                onValueChange={(value) => {
                  const [sort, order] = value.split('_');
                  setFilters(prev => ({
                    ...prev,
                    sort: sort as UserListParams['sort'],
                    order: order as UserListParams['order'],
                    page: 1
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt_desc">Newest First</SelectItem>
                  <SelectItem value="createdAt_asc">Oldest First</SelectItem>
                  <SelectItem value="name_asc">Name A-Z</SelectItem>
                  <SelectItem value="name_desc">Name Z-A</SelectItem>
                  <SelectItem value="lastLoginAt_desc">Recently Active</SelectItem>
                  <SelectItem value="role_asc">Role</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchUsers} className="mt-2">
                Try Again
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                          alt={user.fullName}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                        {getRoleIcon(user.role)}
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.reportsCount || 0} reports</div>
                        <div className="text-gray-600">{user.bookingsCount || 0} bookings</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setActionDialog({ type: 'role', open: true });
                              setNewRole(user.role);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setActionDialog({ type: 'status', open: true });
                            }}
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setActionDialog({ type: 'delete', open: true });
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} users
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Action Dialogs */}
      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ type: null, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'role' && 'Change User Role'}
              {actionDialog.type === 'status' && `${selectedUser?.isActive ? 'Deactivate' : 'Activate'} User`}
              {actionDialog.type === 'delete' && 'Delete User'}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedUser.fullName}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <p className="text-sm text-gray-600">Current role: {selectedUser.role}</p>
              </div>

              {actionDialog.type === 'role' && (
                <div>
                  <Label htmlFor="newRole">New Role</Label>
                  <Select value={newRole} onValueChange={(value) => setNewRole(value as AdminUser['role'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="User">User</SelectItem>
                      <SelectItem value="Moderator">Moderator</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Provide a reason for this action..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setActionDialog({ type: null, open: false })}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (actionDialog.type === 'role') handleRoleUpdate();
                    else if (actionDialog.type === 'status') handleStatusUpdate(selectedUser?.isActive ? 'Inactive' : 'Active');
                    else if (actionDialog.type === 'delete') handleDeleteUser();
                  }}
                  variant={actionDialog.type === 'delete' ? 'destructive' : 'default'}
                >
                  {actionDialog.type === 'role' && 'Update Role'}
                  {actionDialog.type === 'status' && (selectedUser?.isActive ? 'Deactivate' : 'Activate')}
                  {actionDialog.type === 'delete' && 'Delete User'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;