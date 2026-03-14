import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Award, 
  Zap, 
  Settings,
  Search,
  Filter,
  Plus,
  Download,
  X,
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { 
  Card, 
  Button, 
  Badge, 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Textarea,
  Spinner,
  Alert,
  AlertDescription
} from '../../ui';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui';
import { AdminService } from '@/services';
import RiderCreditsPage from './RiderCreditsPage';
import type { Subscription, Payment } from '@/types/admin';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  subscribers: number;
  revenue: number;
  status: 'active' | 'inactive' | 'archived';
  features: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CreditPlan {
  id: string;
  name: string;
  creditValue: number;
  monthlyAmount: number;
  activeRiders: number;
  totalCreditsIssued: number;
  status: 'active' | 'inactive' | 'archived';
  description: string;
  features: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface Transaction {
  id: number;
  riderId: string;
  riderName: string;
  plan: string;
  credits: number;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
}

const SubscriptionsPage: React.FC = () => {
  // Tab State
  const [activeTab, setActiveTab] = useState<'communities' | 'riders'>('communities');
  const [activeRiderSubTab, setActiveRiderSubTab] = useState<'plans' | 'manage-credits'>('plans');
  const [activeCreditType, setActiveCreditType] = useState<'rider' | 'seller' | 'personal-services' | 'event'>('rider');
  
  // Communities Tab State
  const [communityPlans, setCommunityPlans] = useState<SubscriptionPlan[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState<string | null>(null);
  const [communitySearch, setCommunitySearch] = useState('');
  const [communityFilter, setCommunityFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all');
  const [communityPage, setCommunityPage] = useState(1);
  const [communityPageSize] = useState(5);
  
  // Riders Tab State
  const [riderPlans, setRiderPlans] = useState<CreditPlan[]>([]);
  const [riderTransactions, setRiderTransactions] = useState<Transaction[]>([]);
  const [riderLoading, setRiderLoading] = useState(false);
  const [riderError, setRiderError] = useState<string | null>(null);
  const [riderSearch, setRiderSearch] = useState('');
  const [riderFilter, setRiderFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all');
  const [riderPage, setRiderPage] = useState(1);
  const [riderPageSize] = useState(5);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionPageSize] = useState(10);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'completed' | 'pending' | 'failed' | 'refunded'>('all');
  
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | CreditPlan | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPlanTypeCreation, setIsPlanTypeCreation] = useState<'community' | 'rider'>('community');
  
  // Form State
  const [form, setForm] = useState({
    name: '',
    price: '',
    credits: '',
    description: '',
    features: '',
    status: 'active' as 'active' | 'inactive' | 'archived',
  });

  // Load Data Effects
  useEffect(() => {
    if (activeTab === 'communities') {
      loadCommunityPlans();
    } else {
      loadRiderPlans();
      loadTransactions();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'communities') {
      setCommunityPage(1);
    }
  }, [communitySearch, communityFilter]);

  useEffect(() => {
    if (activeTab === 'riders') {
      setRiderPage(1);
    }
  }, [riderSearch, riderFilter]);

  // API Methods
  const loadCommunityPlans = async () => {
    try {
      setCommunityLoading(true);
      setCommunityError(null);
      // In production, this would call: await AdminService.getCommunitySubscriptions()
      // For now, using mock data
      const mockPlans: SubscriptionPlan[] = [
        {
          id: 'basic',
          name: 'Basic Community Plan',
          price: 9.99,
          subscribers: 245,
          revenue: 2448.55,
          status: 'active',
          features: ['10 posts/month', 'Community access', 'Basic support'],
          description: 'Perfect for small communities',
          createdAt: '2025-01-15',
          updatedAt: '2026-03-01',
        },
        {
          id: 'pro',
          name: 'Professional Community Plan',
          price: 19.99,
          subscribers: 89,
          revenue: 1779.11,
          status: 'active',
          features: ['Unlimited posts', 'Priority support', 'Advanced analytics', 'Custom branding'],
          description: 'For growing communities',
          createdAt: '2025-01-15',
          updatedAt: '2026-03-01',
        },
        {
          id: 'premium',
          name: 'Premium Community Plan',
          price: 49.99,
          subscribers: 23,
          revenue: 1149.77,
          status: 'active',
          features: ['Everything in Pro', 'White-label solution', '24/7 support', 'API access'],
          description: 'Enterprise-grade features',
          createdAt: '2025-01-15',
          updatedAt: '2026-03-01',
        },
      ];
      setCommunityPlans(mockPlans);
    } catch (error) {
      console.error('Error loading community plans:', error);
      setCommunityError('Failed to load community plans. Please try again.');
    } finally {
      setCommunityLoading(false);
    }
  };

  const loadRiderPlans = async () => {
    try {
      setRiderLoading(true);
      setRiderError(null);
      // In production, this would call: await AdminService.getRiderCreditPlans()
      const mockPlans: CreditPlan[] = [
        {
          id: 'free',
          name: 'Free Tier',
          creditValue: 0,
          monthlyAmount: 0,
          activeRiders: 1240,
          totalCreditsIssued: 62000,
          status: 'active',
          description: 'Complimentary tier for new riders',
          features: ['50 free credits/month', 'Basic support', 'Limited to 5 rides/day'],
          createdAt: '2025-01-01',
          updatedAt: '2026-03-01',
        },
        {
          id: 'standard',
          name: 'Standard Pack',
          creditValue: 500,
          monthlyAmount: 199,
          activeRiders: 568,
          totalCreditsIssued: 284000,
          status: 'active',
          description: 'Popular choice for regular riders',
          features: ['500 credits bundle', '₱2.50 per credit', 'Priority support', 'Unlimited daily rides'],
          createdAt: '2025-02-01',
          updatedAt: '2026-03-01',
        },
        {
          id: 'premium',
          name: 'Premium Pack',
          creditValue: 1500,
          monthlyAmount: 499,
          activeRiders: 342,
          totalCreditsIssued: 513000,
          status: 'active',
          description: 'Best value for power users',
          features: ['1500 credits bundle', '₱2.00 per credit', '24/7 support', 'Bonus 200 credits'],
          createdAt: '2025-02-15',
          updatedAt: '2026-03-01',
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          creditValue: 5000,
          monthlyAmount: 1299,
          activeRiders: 89,
          totalCreditsIssued: 445000,
          status: 'active',
          description: 'Premium subscription for fleet managers',
          features: ['5000 credits bundle', '₱1.50 per credit', 'Dedicated account manager', 'Custom billing', 'API access'],
          createdAt: '2025-03-01',
          updatedAt: '2026-03-01',
        },
      ];
      setRiderPlans(mockPlans);
    } catch (error) {
      console.error('Error loading rider plans:', error);
      setRiderError('Failed to load rider plans. Please try again.');
    } finally {
      setRiderLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      // In production: await AdminService.getRiderCreditTransactions(page, pageSize, filters)
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          riderId: 'R-001',
          riderName: 'John Doe',
          plan: 'Premium Pack',
          credits: 1500,
          amount: 499,
          date: '2026-03-14',
          status: 'completed'
        },
        {
          id: 2,
          riderId: 'R-002',
          riderName: 'Jane Smith',
          plan: 'Standard Pack',
          credits: 500,
          amount: 199,
          date: '2026-03-13',
          status: 'completed'
        },
        {
          id: 3,
          riderId: 'R-003',
          riderName: 'Mike Johnson',
          plan: 'Standard Pack',
          credits: 500,
          amount: 199,
          date: '2026-03-12',
          status: 'pending'
        },
        {
          id: 4,
          riderId: 'R-004',
          riderName: 'Sarah Wilson',
          plan: 'Enterprise',
          credits: 5000,
          amount: 1299,
          date: '2026-03-11',
          status: 'completed'
        },
        {
          id: 5,
          riderId: 'R-005',
          riderName: 'Alex Brown',
          plan: 'Standard Pack',
          credits: 500,
          amount: 199,
          date: '2026-03-10',
          status: 'failed'
        },
      ];
      setRiderTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  // Filter and Pagination Logic
  const filteredCommunityPlans = useMemo(() => {
    let filtered = communityPlans;
    
    if (communityFilter !== 'all') {
      filtered = filtered.filter(p => p.status === communityFilter);
    }
    
    if (communitySearch) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(communitySearch.toLowerCase()) ||
        p.description?.toLowerCase().includes(communitySearch.toLowerCase())
      );
    }
    
    return filtered;
  }, [communityPlans, communitySearch, communityFilter]);

  const filteredRiderPlans = useMemo(() => {
    let filtered = riderPlans;
    
    if (riderFilter !== 'all') {
      filtered = filtered.filter(p => p.status === riderFilter);
    }
    
    if (riderSearch) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(riderSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(riderSearch.toLowerCase())
      );
    }
    
    return filtered;
  }, [riderPlans, riderSearch, riderFilter]);

  const filteredTransactions = useMemo(() => {
    let filtered = riderTransactions;
    
    if (transactionFilter !== 'all') {
      filtered = filtered.filter(t => t.status === transactionFilter);
    }
    
    return filtered;
  }, [riderTransactions, transactionFilter]);

  const paginatedCommunityPlans = filteredCommunityPlans.slice(
    (communityPage - 1) * communityPageSize,
    communityPage * communityPageSize
  );

  const paginatedRiderPlans = filteredRiderPlans.slice(
    (riderPage - 1) * riderPageSize,
    riderPage * riderPageSize
  );

  const paginatedTransactions = filteredTransactions.slice(
    (transactionPage - 1) * transactionPageSize,
    transactionPage * transactionPageSize
  );

  // Calculations
  const communityStats = {
    totalRevenue: communityPlans.reduce((sum, p) => sum + p.revenue, 0),
    totalSubscribers: communityPlans.reduce((sum, p) => sum + p.subscribers, 0),
    avgRevenuePerUser: 0,
  };
  communityStats.avgRevenuePerUser = communityStats.totalSubscribers > 0 
    ? communityStats.totalRevenue / communityStats.totalSubscribers 
    : 0;

  const riderStats = {
    totalCredits: riderPlans.reduce((sum, p) => sum + p.totalCreditsIssued, 0),
    monthlyRevenue: riderPlans.reduce((sum, p) => sum + (p.monthlyAmount * (p.activeRiders > 0 ? 1 : 0)), 0),
    activeRiders: riderPlans.reduce((sum, p) => sum + p.activeRiders, 0),
    avgCreditsPerRider: 0,
  };
  riderStats.avgCreditsPerRider = riderStats.activeRiders > 0 
    ? riderStats.totalCredits / riderStats.activeRiders 
    : 0;

  // Modal Handlers
  const openCreateModal = (type: 'community' | 'rider') => {
    setIsPlanTypeCreation(type);
    setSelectedPlan(null);
    setForm({
      name: '',
      price: '',
      credits: '',
      description: '',
      features: '',
      status: 'active',
    });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (plan: SubscriptionPlan | CreditPlan) => {
    setSelectedPlan(plan);
    const isCreditPlan = 'creditValue' in plan;
    if (isCreditPlan) {
      const cp = plan as CreditPlan;
      setForm({
        name: cp.name,
        price: cp.monthlyAmount.toString(),
        credits: cp.creditValue.toString(),
        description: cp.description,
        features: cp.features.join('\n'),
        status: cp.status,
      });
      setIsPlanTypeCreation('rider');
    } else {
      const sp = plan as SubscriptionPlan;
      setForm({
        name: sp.name,
        price: sp.price.toString(),
        credits: '',
        description: sp.description || '',
        features: sp.features.join('\n'),
        status: sp.status,
      });
      setIsPlanTypeCreation('community');
    }
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteConfirmOpen(false);
    setSelectedPlan(null);
    setFormError(null);
  };

  const handleSavePlan = async () => {
    try {
      setFormLoading(true);
      setFormError(null);

      // Validation
      if (!form.name.trim()) {
        setFormError('Plan name is required');
        setFormLoading(false);
        return;
      }
      if (!form.price || parseFloat(form.price) < 0) {
        setFormError('Valid price is required');
        setFormLoading(false);
        return;
      }
      if (!form.description.trim()) {
        setFormError('Description is required');
        setFormLoading(false);
        return;
      }
      if (!form.features.trim()) {
        setFormError('At least one feature is required');
        setFormLoading(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Update local state
      if (isEditModalOpen && selectedPlan) {
        const featuresArray = form.features.split('\n').filter(f => f.trim());
        if (isPlanTypeCreation === 'community') {
          setCommunityPlans(prev => prev.map(p => 
            p.id === selectedPlan.id 
              ? { ...p, name: form.name, description: form.description, features: featuresArray, status: form.status, price: parseFloat(form.price), updatedAt: new Date().toISOString() }
              : p
          ));
        } else {
          setRiderPlans(prev => prev.map(p => 
            p.id === selectedPlan.id 
              ? { ...p, name: form.name, description: form.description, features: featuresArray, status: form.status, monthlyAmount: parseFloat(form.price), creditValue: parseInt(form.credits), updatedAt: new Date().toISOString() }
              : p
          ));
        }
      } else {
        const featuresArray = form.features.split('\n').filter(f => f.trim());
        
        if (isPlanTypeCreation === 'community') {
          const newPlan: SubscriptionPlan = {
            id: `plan_${Date.now()}`,
            name: form.name,
            price: parseFloat(form.price),
            description: form.description,
            features: featuresArray,
            status: form.status as 'active' | 'inactive' | 'archived',
            subscribers: 0,
            revenue: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setCommunityPlans(prev => [...prev, newPlan]);
        } else {
          const newPlan: CreditPlan = {
            id: `plan_${Date.now()}`,
            name: form.name,
            monthlyAmount: parseFloat(form.price),
            creditValue: parseInt(form.credits) || 0,
            description: form.description,
            features: featuresArray,
            status: form.status as 'active' | 'inactive' | 'archived',
            activeRiders: 0,
            totalCreditsIssued: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setRiderPlans(prev => [...prev, newPlan]);
        }
      }

      closeModals();
    } catch (error) {
      setFormError('An error occurred while saving. Please try again.');
      console.error('Error saving plan:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;

    try {
      setFormLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));

      if (isPlanTypeCreation === 'community') {
        setCommunityPlans(prev => prev.filter(p => p.id !== selectedPlan.id));
      } else {
        setRiderPlans(prev => prev.filter(p => p.id !== selectedPlan.id));
      }

      closeModals();
    } catch (error) {
      setFormError('An error occurred while deleting. Please try again.');
      console.error('Error deleting plan:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Export functionality
  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csv = [headers.join(','), ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    )].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Mock data for Community Subscriptions
  const communitySubscriptionPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      subscribers: 245,
      revenue: 2448.55,
      status: 'active',
      features: ['10 posts/month', 'Community access', 'Basic support']
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      subscribers: 89,
      revenue: 1779.11,
      status: 'active', 
      features: ['Unlimited posts', 'Priority support', 'Advanced analytics', 'Custom branding']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 49.99,
      subscribers: 23,
      revenue: 1149.77,
      status: 'active',
      features: ['Everything in Pro', 'White-label solution', '24/7 support', 'API access']
    }
  ];

  // Mock data for Rider Credits Subscriptions
  const riderCreditsPlans = [
    {
      id: 'free',
      name: 'Free Tier',
      creditValue: 0,
      monthlyAmount: 50,
      activeRiders: 1240,
      totalCreditsIssued: 62000,
      status: 'active',
      description: 'Complimentary tier for new riders',
      features: ['50 free credits/month', 'Basic support', 'Limited to 5 rides/day']
    },
    {
      id: 'standard',
      name: 'Standard Pack',
      creditValue: 500,
      monthlyAmount: 199,
      activeRiders: 568,
      totalCreditsIssued: 284000,
      status: 'active',
      description: 'Popular choice for regular riders',
      features: ['500 credits bundle', '₱2.50 per credit', 'Priority support', 'Unlimited daily rides']
    },
    {
      id: 'premium',
      name: 'Premium Pack',
      creditValue: 1500,
      monthlyAmount: 499,
      activeRiders: 342,
      totalCreditsIssued: 513000,
      status: 'active',
      description: 'Best value for power users',
      features: ['1500 credits bundle', '₱2.00 per credit', '24/7 support', 'Bonus 200 credits']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      creditValue: 5000,
      monthlyAmount: 1299,
      activeRiders: 89,
      totalCreditsIssued: 445000,
      status: 'active',
      description: 'Premium subscription for fleet managers',
      features: ['5000 credits bundle', '₱1.50 per credit', 'Dedicated account manager', 'Custom billing', 'API access']
    }
  ];

  // Recent credit transactions for riders
  const recentRiderTransactions = [
    {
      id: 1,
      riderId: 'R-001',
      riderName: 'John Doe',
      plan: 'Premium Pack',
      credits: 1500,
      amount: 499,
      date: '2026-03-14',
      status: 'completed'
    },
    {
      id: 2,
      riderId: 'R-002',
      riderName: 'Jane Smith',
      plan: 'Standard Pack',
      credits: 500,
      amount: 199,
      date: '2026-03-13',
      status: 'completed'
    },
    {
      id: 3,
      riderId: 'R-003',
      riderName: 'Mike Johnson',
      plan: 'Standard Pack',
      credits: 500,
      amount: 199,
      date: '2026-03-12',
      status: 'completed'
    },
    {
      id: 4,
      riderId: 'R-004',
      riderName: 'Sarah Wilson',
      plan: 'Enterprise',
      credits: 5000,
      amount: 1299,
      date: '2026-03-11',
      status: 'completed'
    }
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="text-purple-600" size={32} />
            Subscriptions Management
          </h1>
          <p className="text-gray-600 mt-2">Manage all subscription types, plans, and billing</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => activeTab === 'communities' ? loadCommunityPlans() : (loadRiderPlans(), loadTransactions())}
          >
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button 
            size="sm" 
            className="gap-2"
            onClick={() => exportToCSV(activeTab === 'communities' ? filteredCommunityPlans : filteredRiderPlans, `${activeTab}-plans.csv`)}
          >
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="communities" className="w-full" onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 inline-grid">
          <TabsTrigger value="communities" className="flex items-center justify-center gap-2 data-[state=active]:bg-white whitespace-nowrap">
            <Users size={18} />
            <span className="hidden sm:inline">Community Plans</span>
            <span className="sm:hidden">Community</span>
          </TabsTrigger>
          <TabsTrigger value="riders" className="flex items-center justify-center gap-2 data-[state=active]:bg-white whitespace-nowrap">
            <Award size={18} />
            <span className="hidden sm:inline">Service Credits</span>
            <span className="sm:hidden">Credits</span>
          </TabsTrigger>
        </TabsList>

        {/* ===== COMMUNITIES TAB ===== */}
        <TabsContent value="communities" className="space-y-8">
          {/* Error State */}
          {communityError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {communityError}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={loadCommunityPlans}
                  className="ml-2 h-6"
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-purple-50 border-purple-100 hover:shadow-lg transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="text-purple-600" size={20} />
                    <p className="text-sm font-medium text-purple-700 uppercase tracking-wider">Total Revenue</p>
                  </div>
                  <p className="text-3xl font-black text-purple-900">${communityStats.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-purple-600 mt-2">All-time revenue</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-100 hover:shadow-lg transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="text-blue-600" size={20} />
                    <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">Active Subscribers</p>
                  </div>
                  <p className="text-3xl font-black text-blue-900">{communityStats.totalSubscribers.toLocaleString()}</p>
                  <p className="text-xs text-blue-600 mt-2">Across all plans</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-green-50 border-green-100 hover:shadow-lg transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="text-green-600" size={20} />
                    <p className="text-sm font-medium text-green-700 uppercase tracking-wider">Avg Revenue/User</p>
                  </div>
                  <p className="text-3xl font-black text-green-900">${communityStats.avgRevenuePerUser.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-green-600 mt-2">Monthly average</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and Controls */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  placeholder="Search plans..."
                  value={communitySearch}
                  onChange={(e) => setCommunitySearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select 
                value={communityFilter} 
                onChange={(e) => setCommunityFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="all">All Plans</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
              <Button 
                onClick={() => openCreateModal('community')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2"
              >
                <Plus size={16} />
                New Plan
              </Button>
            </div>
          </Card>

          {/* Loading State */}
          {communityLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Plans List */}
              {paginatedCommunityPlans.length > 0 ? (
                <div className="space-y-4">
                  {paginatedCommunityPlans.map((plan) => (
                    <Card key={plan.id} className="p-6 hover:shadow-lg transition">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        {/* Plan Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                            <Badge className={cn(
                              plan.status === 'active' ? 'bg-green-100 text-green-800' :
                              plan.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            )}>
                              {plan.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{plan.description || 'No description'}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {plan.features.map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          {plan.updatedAt && (
                            <p className="text-xs text-gray-500">Updated: {new Date(plan.updatedAt).toLocaleDateString()}</p>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 text-center w-full lg:w-auto lg:flex lg:gap-8">
                          <div>
                            <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Price</p>
                            <p className="text-2xl font-black text-purple-600">${plan.price.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Subscribers</p>
                            <p className="text-2xl font-black text-blue-600">{plan.subscribers}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Revenue</p>
                            <p className="text-2xl font-black text-green-600">${plan.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 w-full lg:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 flex-1 lg:flex-none"
                            onClick={() => openEditModal(plan)}
                          >
                            <Edit size={16} />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 flex-1 lg:flex-none text-red-600 hover:text-red-700"
                            onClick={() => {
                              setSelectedPlan(plan);
                              setIsPlanTypeCreation('community');
                              setIsDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 size={16} />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <AlertCircle className="mx-auto mb-3 text-gray-400" size={32} />
                  <p className="text-gray-600 mb-4">No community plans found</p>
                  <Button onClick={() => openCreateModal('community')} className="gap-2">
                    <Plus size={16} />
                    Create Your First Plan
                  </Button>
                </Card>
              )}

              {/* Pagination */}
              {filteredCommunityPlans.length > communityPageSize && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Showing {Math.min(communityPage * communityPageSize, filteredCommunityPlans.length)} of {filteredCommunityPlans.length}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={communityPage === 1}
                      onClick={() => setCommunityPage(prev => Math.max(1, prev - 1))}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <span className="flex items-center px-3 text-sm font-medium">
                      Page {communityPage} of {Math.ceil(filteredCommunityPlans.length / communityPageSize)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={communityPage >= Math.ceil(filteredCommunityPlans.length / communityPageSize)}
                      onClick={() => setCommunityPage(prev => prev + 1)}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ===== RIDERS TAB ===== */}
        <TabsContent value="riders" className="space-y-8">
          {/* Rider Sub-Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveRiderSubTab('plans')}
              className={cn(
                'px-4 py-3 font-medium border-b-2 transition-colors',
                activeRiderSubTab === 'plans'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              <div className="flex items-center gap-2">
                <CreditCard size={18} />
                Credit Plans & Transactions
              </div>
            </button>
            <button
              onClick={() => setActiveRiderSubTab('manage-credits')}
              className={cn(
                'px-4 py-3 font-medium border-b-2 transition-colors',
                activeRiderSubTab === 'manage-credits'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              <div className="flex items-center gap-2">
                <DollarSign size={18} />
                Manage User Credits
              </div>
            </button>
          </div>

          {/* Plans & Transactions View */}
          {activeRiderSubTab === 'plans' && (
            <div className="space-y-8">
          {riderError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {riderError}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { loadRiderPlans(); loadTransactions(); }}
                  className="ml-2 h-6"
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-amber-50 border-amber-100 hover:shadow-lg transition">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Zap className="text-amber-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-700 uppercase tracking-wider">Total Credits Issued</p>
                  <p className="text-2xl font-black text-amber-900">{(riderStats.totalCredits / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-green-50 border-green-100 hover:shadow-lg transition">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 uppercase tracking-wider">Monthly Revenue</p>
                  <p className="text-2xl font-black text-green-900">₱{riderStats.monthlyRevenue.toLocaleString('en-PH', { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-100 hover:shadow-lg transition">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">Active Riders</p>
                  <p className="text-2xl font-black text-blue-900">{riderStats.activeRiders.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-indigo-50 border-indigo-100 hover:shadow-lg transition">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-indigo-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-700 uppercase tracking-wider">Avg Credits/Rider</p>
                  <p className="text-2xl font-black text-indigo-900">{riderStats.avgCreditsPerRider.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Credit Plans Section */}
          <div>
            {/* Filters */}
            <div className="mb-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard size={24} className="text-amber-600" />
                Rider Credit Plans
              </h2>
              <div className="ml-auto flex gap-2 w-full md:w-auto">
                <Button 
                  onClick={() => openCreateModal('rider')}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2 flex-1 md:flex-none"
                >
                  <Plus size={16} />
                  New Plan
                </Button>
              </div>
            </div>

            {/* Plans List */}
            {riderLoading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : paginatedRiderPlans.length > 0 ? (
              <div className="space-y-4">
                {paginatedRiderPlans.map((plan) => (
                  <Card key={plan.id} className="p-6 hover:shadow-lg transition">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                      {/* Plan Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                          <Badge className={cn(
                            plan.status === 'active' ? 'bg-green-100 text-green-800' :
                            plan.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          )}>
                            {plan.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {plan.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        {plan.updatedAt && (
                          <p className="text-xs text-gray-500">Updated: {new Date(plan.updatedAt).toLocaleDateString()}</p>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-6 text-center w-full lg:w-auto lg:flex lg:gap-8">
                        <div>
                          <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Price</p>
                          <p className="text-2xl font-black text-amber-600">₱{plan.monthlyAmount}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Active Riders</p>
                          <p className="text-2xl font-black text-blue-600">{plan.activeRiders}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Credits Issued</p>
                          <p className="text-2xl font-black text-green-600">{(plan.totalCreditsIssued / 1000).toFixed(0)}K</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 w-full lg:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 flex-1 lg:flex-none"
                          onClick={() => openEditModal(plan)}
                        >
                          <Edit size={16} />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 flex-1 lg:flex-none text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setIsPlanTypeCreation('rider');
                            setIsDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 size={16} />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <AlertCircle className="mx-auto mb-3 text-gray-400" size={32} />
                <p className="text-gray-600 mb-4">No credit plans found</p>
              </Card>
            )}

            {/* Pagination for Plans */}
            {filteredRiderPlans.length > riderPageSize && (
              <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Showing {Math.min(riderPage * riderPageSize, filteredRiderPlans.length)} of {filteredRiderPlans.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={riderPage === 1}
                    onClick={() => setRiderPage(prev => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="flex items-center px-3 text-sm font-medium">
                    Page {riderPage} of {Math.ceil(filteredRiderPlans.length / riderPageSize)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={riderPage >= Math.ceil(filteredRiderPlans.length / riderPageSize)}
                    onClick={() => setRiderPage(prev => prev + 1)}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Transactions Section */}
          <div>
            <div className="mb-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 size={24} className="text-teal-600" />
                Recent Credit Purchases
              </h2>
              <div className="ml-auto w-full md:w-auto">
                <select 
                  value={transactionFilter} 
                  onChange={(e) => setTransactionFilter(e.target.value as any)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Transaction Table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Rider ID</TableHead>
                      <TableHead>Rider Name</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead className="text-right">Credits</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((txn, idx) => (
                      <TableRow key={txn.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                        <TableCell className="font-medium text-sm">{txn.riderId}</TableCell>
                        <TableCell className="text-sm">{txn.riderName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{txn.plan}</Badge>
                        </TableCell>
                        <TableCell className="font-bold text-amber-600 text-right">{txn.credits.toLocaleString()}</TableCell>
                        <TableCell className="font-bold text-right">₱{txn.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-gray-600">{txn.date}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            txn.status === 'completed' ? 'bg-green-100 text-green-800' :
                            txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            txn.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          )}>
                            {txn.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Transaction Pagination */}
              <div className="p-4 border-t flex items-center justify-between bg-gray-50">
                <p className="text-sm text-gray-600">
                  Showing {Math.min(transactionPage * transactionPageSize, filteredTransactions.length)} of {filteredTransactions.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={transactionPage === 1}
                    onClick={() => setTransactionPage(prev => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={transactionPage >= Math.ceil(filteredTransactions.length / transactionPageSize)}
                    onClick={() => setTransactionPage(prev => prev + 1)}
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
            </div>
          )}

          {/* Manage User Credits View */}
          {activeRiderSubTab === 'manage-credits' && (
            <div className="space-y-6">
              {/* Credit Type Sub-Tabs */}
              <div className="flex gap-2 border-b border-gray-200 flex-wrap">
                <button
                  onClick={() => setActiveCreditType('rider')}
                  className={cn(
                    'px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap',
                    activeCreditType === 'rider'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  )}
                >
                  Rider Credits
                </button>
                <button
                  onClick={() => setActiveCreditType('seller')}
                  className={cn(
                    'px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap',
                    activeCreditType === 'seller'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  )}
                >
                  Seller Credits
                </button>
                <button
                  onClick={() => setActiveCreditType('personal-services')}
                  className={cn(
                    'px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap',
                    activeCreditType === 'personal-services'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  )}
                >
                  Personal Services Credits
                </button>
                <button
                  onClick={() => setActiveCreditType('event')}
                  className={cn(
                    'px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap',
                    activeCreditType === 'event'
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  )}
                >
                  Event Credits
                </button>
              </div>
              
              {/* Render appropriate credit management component */}
              <RiderCreditsPage serviceType={activeCreditType} />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ===== CREATE/EDIT PLAN MODAL ===== */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={closeModals}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isEditModalOpen ? <Edit size={20} /> : <Plus size={20} />}
                {isEditModalOpen ? 'Edit' : 'Create New'} {isPlanTypeCreation === 'community' ? 'Community' : 'Credit'} Plan
              </DialogTitle>
              <DialogDescription>
                {isEditModalOpen ? 'Update the plan details and settings.' : 'Add a new subscription plan to the system.'}
              </DialogDescription>
            </DialogHeader>

            {formError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
                <Input
                  placeholder="e.g., Premium Community Plan"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <Textarea
                  placeholder="Describe this plan..."
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isPlanTypeCreation === 'community' ? 'Monthly Price ($) *' : 'Monthly Price (₱) *'}
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => setForm({...form, price: e.target.value})}
                    step="0.01"
                    min="0"
                  />
                </div>
                {isPlanTypeCreation === 'rider' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credit Value *</label>
                    <Input
                      type="number"
                      placeholder="500"
                      value={form.credits}
                      onChange={(e) => setForm({...form, credits: e.target.value})}
                      min="0"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line) *</label>
                <Textarea
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  value={form.features}
                  onChange={(e) => setForm({...form, features: e.target.value})}
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={form.status} 
                  onChange={(e) => setForm({...form, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={closeModals} disabled={formLoading}>
                Cancel
              </Button>
              <Button 
                onClick={handleSavePlan} 
                disabled={formLoading}
                className="gap-2"
              >
                {formLoading && <Spinner size="sm" />}
                {isEditModalOpen ? 'Update Plan' : 'Create Plan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle size={20} />
              Delete Plan
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedPlan?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={closeModals} disabled={formLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeletePlan}
              disabled={formLoading}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              {formLoading && <Spinner size="sm" />}
              Delete Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionsPage;