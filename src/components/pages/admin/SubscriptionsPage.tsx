'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Calendar,
  Users,
  DollarSign,
  Eye,
  Trash2,
  Filter,
  Search,
  AlertCircle,
} from 'lucide-react';
import { Card, Button, Badge, Input, Spinner } from '../../ui';
import { SubscriptionService, type Subscription } from '../../../services/subscriptionService';
import { cn } from '@/lib/utils';

// Helper function to convert feature codes to readable names
const featureCodeMap: Record<string, string> = {
  'official_community_page': 'Official Community Page',
  'announcements_news_events': 'Announcements, News & Events',
  'member_registration_management': 'Member Registration & Management',
  'lost_found_reporting': 'Lost & Found Reporting',
  'advanced_analytics_dashboard': 'Advanced Analytics Dashboard',
  'basic_analytics_dashboard': 'Basic Analytics Dashboard',
  'local_marketplace': 'Local Marketplace',
  'local_services_directory': 'Local Services Directory',
  'community_verification_badge': 'Community Verification Badge',
  'dedicated_support': 'Dedicated Support',
  'priority_support': 'Priority Support',
  'multi_barangay_management': 'Multi-Barangay Management',
  'emergency_alert_broadcasting': 'Emergency Alert Broadcasting',
  'custom_branding': 'Custom Branding',
};

const convertFeatureCode = (code: string): string => {
  return featureCodeMap[code.toLowerCase()] || code;
};

const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'expired' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  // Fetch subscriptions on mount
  useEffect(() => {
    const loadSubscriptions = async () => {
      setLoading(true);
      try {
        const data = await SubscriptionService.getAllSubscriptions(50, 1);
        setSubscriptions(data);
      } catch (error) {
        console.error('Failed to load subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, []);

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      (sub.communityName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.planName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.planCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.communityId.toString().includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleDeleteSubscription = (id: number) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      setSubscriptions(prev => prev.filter(s => s.id !== id));
    }
  };

  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const pendingSubscriptions = subscriptions.filter(s => s.status === 'pending').length;
  const monthlyRevenue = subscriptions
    .filter(s => s.status === 'active' || s.status === 'pending')
    .reduce((sum, s) => {
      // Use monthlyPrice if available, otherwise calculate from annualPrice
      const price = s.monthlyPrice || (s.annualPrice / 12);
      return sum + price;
    }, 0);

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-purple-50 border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CreditCard className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-700 uppercase tracking-wider">Total Subscriptions</p>
              <p className="text-2xl font-black text-purple-800">{totalSubscriptions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-yellow-50 border-yellow-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-700 uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-black text-yellow-800">{pendingSubscriptions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-green-50 border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-green-700 uppercase tracking-wider">Active</p>
              <p className="text-2xl font-black text-green-800">{activeSubscriptions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-blue-50 border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">Monthly Revenue</p>
              <p className="text-2xl font-black text-blue-800">₱{monthlyRevenue.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Subscriptions List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 text-lg mb-4">Community Subscriptions</h3>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by community name, plan, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <AlertCircle size={24} className="mx-auto mb-2 text-slate-400" />
              <p>No subscriptions found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredSubscriptions.map((subscription) => (
                <div key={subscription.id} className="p-6 hover:bg-slate-50 transition-colors border-b border-slate-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">Community #{subscription.communityId}</h4>
                          <p className="text-xs text-slate-500 mt-1">User: {subscription.userId}</p>
                        </div>
                        <Badge className={cn(
                          subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                          subscription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          subscription.status === 'expired' ? 'bg-red-100 text-red-800' :
                          subscription.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        )}>
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">Plan: <span className="font-semibold text-teal-600">{subscription.planName}</span> ({subscription.planCode})</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSubscription(subscription)}
                        className="rounded-lg"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSubscription(subscription.id)}
                        className="rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1">Plan Price</p>
                      <p className="font-semibold text-teal-600">₱{subscription.monthlyPrice.toLocaleString()}/mo</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1">Annual Price</p>
                      <p className="font-semibold text-slate-900">₱{subscription.annualPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1">Applied On</p>
                      <p className="font-semibold text-slate-900">
                        {subscription.dateCreated ? new Date(subscription.dateCreated).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1">Start Date</p>
                      <p className="font-semibold text-slate-900">
                        {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : 'Not Started'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1">End Date</p>
                      <p className="font-semibold text-slate-900">
                        {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {subscription.features.length > 0 && (
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Plan Features ({subscription.features.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {subscription.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs bg-slate-50">
                            {convertFeatureCode(feature)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {subscription.addOns && subscription.addOns.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 mt-4">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Add-ons ({subscription.addOns.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {subscription.addOns.map((addon) => (
                          <Badge key={addon} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            {addon}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Subscription Details Modal */}
      {selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-bold text-slate-900 text-lg">Subscription Details</h3>
              <button
                onClick={() => setSelectedSubscription(null)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Subscription & Community Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Subscription ID</label>
                  <p className="text-slate-900 font-medium text-lg">{selectedSubscription.id}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Community ID</label>
                  <p className="text-slate-900 font-medium text-lg">{selectedSubscription.communityId}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">User ID</label>
                <p className="text-slate-900 font-medium text-sm break-all">{selectedSubscription.userId}</p>
              </div>

              {/* Plan Information */}
              <div className="border-t border-slate-200 pt-6">
                <h4 className="font-bold text-slate-900 mb-4">Plan Information</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Plan Name</label>
                    <p className="text-slate-900 font-medium">{selectedSubscription.planName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Plan Code</label>
                    <p className="text-slate-900 font-medium uppercase">{selectedSubscription.planCode}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status</label>
                    <Badge className={cn(
                      'mt-1',
                      selectedSubscription.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedSubscription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedSubscription.status === 'expired' ? 'bg-red-100 text-red-800' :
                      selectedSubscription.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    )}>
                      {selectedSubscription.status.charAt(0).toUpperCase() + selectedSubscription.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="border-t border-slate-200 pt-6">
                <h4 className="font-bold text-slate-900 mb-4">Pricing</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Monthly Price</label>
                    <p className="text-slate-900 font-semibold text-xl text-teal-600">₱{selectedSubscription.monthlyPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Annual Price</label>
                    <p className="text-slate-900 font-semibold text-xl text-teal-600">₱{selectedSubscription.annualPrice.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="border-t border-slate-200 pt-6">
                <h4 className="font-bold text-slate-900 mb-4">Subscription Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Applied On:</span>
                    <span className="text-slate-900 font-medium">{new Date(selectedSubscription.dateCreated).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Start Date:</span>
                    <span className="text-slate-900 font-medium">{selectedSubscription.startDate ? new Date(selectedSubscription.startDate).toLocaleDateString() : 'Not Started'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">End Date:</span>
                    <span className="text-slate-900 font-medium">{selectedSubscription.endDate ? new Date(selectedSubscription.endDate).toLocaleDateString() : 'Ongoing'}</span>
                  </div>
                  {selectedSubscription.stripeSubscriptionId && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Stripe ID:</span>
                      <span className="text-slate-900 font-medium text-xs break-all">{selectedSubscription.stripeSubscriptionId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Plan Features */}
              {selectedSubscription.features.length > 0 && (
                <div className="border-t border-slate-200 pt-6">
                  <h4 className="font-bold text-slate-900 mb-4">Included Features</h4>
                  <div className="space-y-2">
                    {selectedSubscription.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">{convertFeatureCode(feature)}</span>
                        <span className="text-xs text-slate-500">({feature})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {selectedSubscription.addOns && selectedSubscription.addOns.length > 0 && (
                <div className="border-t border-slate-200 pt-6">
                  <h4 className="font-bold text-slate-900 mb-4">Add-ons</h4>
                  <div className="space-y-2">
                    {selectedSubscription.addOns.map((addon) => (
                      <div key={addon} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <span className="text-sm font-medium text-blue-700">{addon}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Modified */}
              <div className="border-t border-slate-200 pt-6 text-xs text-slate-500">
                <p>Last Modified: {new Date(selectedSubscription.lastModifiedDate).toLocaleString()}</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedSubscription(null)}
                className="rounded-lg"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;