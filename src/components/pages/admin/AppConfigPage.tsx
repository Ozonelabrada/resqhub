import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Switch,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  Select,
  Textarea,
  ScrollArea,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../ui';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Settings,
  DollarSign,
  AlertCircle,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';
import { appConfigService, type Feature, type CommunityType, type BackendPlan } from '../../../services/appConfigService';

// ===== Type Definitions =====
interface PlanFeature {
  code: string;
  name: string;
  description: string;
  available: boolean;
}

interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[]; // Array of feature codes
  recommended?: boolean;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

interface AddOnModule {
  code: string;
  name: string;
  description: string;
  monthlyPrice: number;
  oneTimePrice?: number;
  isSelected?: boolean;
}

// Mock community types for future pricing integration
const mockCommunityTypes: CommunityType[] = [
  { id: '1', name: 'Barangay', currency: 'PHP', enabled: true },
  { id: '2', name: 'City', currency: 'PHP', enabled: true },
  { id: '3', name: 'School', currency: 'PHP', enabled: true },
  { id: '4', name: 'Organization', currency: 'PHP', enabled: true },
  { id: '5', name: 'Event', currency: 'PHP', enabled: true },
];

const AppConfigPage: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [communityTypes] = useState<CommunityType[]>(mockCommunityTypes);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  
  // Subscription Plan States
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  const [addOns, setAddOns] = useState<Feature[]>([]);

  const [activeTab, setActiveTab] = useState('features');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editingAddOn, setEditingAddOn] = useState<Feature | null>(null);

  // Fetch features, add-ons, and plans on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [featuresData, addOnsData, plansData] = await Promise.all([
          appConfigService.getFeatures(),
          appConfigService.getAddOns(),
          appConfigService.getPlans(true, 1, 50),
        ]);
        setFeatures(featuresData);
        setAddOns(addOnsData);
        setPlans(plansData);
      } catch (err) {
        setError('Failed to load configuration. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleToggleEnabled = async (featureId: string | number, enabled: boolean) => {
    // TODO: Implement API call to update feature
    setFeatures(prev => prev.map(f => 
      f.id === featureId ? { ...f, enabled, updatedAt: new Date() } : f
    ));
  };

  const handleDeleteFeature = async (featureId: string | number) => {
    // TODO: Implement API call to delete feature
    setFeatures(prev => prev.filter(f => f.id !== featureId));
  };

  // Plan handlers
  const handleAddPlan = () => {
    setEditingPlan(null);
    setShowPlanModal(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setShowPlanModal(true);
  };

  const handleSavePlan = async (plan: SubscriptionPlan) => {
    try {
      const planPayload = {
        name: plan.name,
        code: plan.code,
        description: plan.description,
        monthlyPrice: plan.monthlyPrice,
        annualPrice: plan.annualPrice,
        notes: plan.notes || '',
        features: plan.features,
      };

      if (editingPlan) {
        await appConfigService.updatePlan(editingPlan.id, planPayload);
        setPlans(plans.map(p => p.id === editingPlan.id ? plan : p));
      } else {
        await appConfigService.createPlan(planPayload);
        setPlans([...plans, { ...plan, id: Date.now().toString() }]);
      }
      setShowPlanModal(false);
      setEditingPlan(null);
    } catch (error) {
      console.error('Failed to save plan:', error);
      alert('Failed to save plan. Please try again.');
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await appConfigService.deletePlan(id);
      setPlans(plans.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete plan:', error);
      alert('Failed to delete plan. Please try again.');
    }
  };

  // Add-on handlers
  const handleAddAddOn = () => {
    setEditingAddOn(null);
    setShowAddOnModal(true);
  };

  const handleEditAddOn = (addOn: Feature) => {
    setEditingAddOn(addOn);
    setShowAddOnModal(true);
  };

  const handleSaveAddOn = (addOn: Feature) => {
    if (editingAddOn) {
      setAddOns(addOns.map(a => a.id === editingAddOn.id ? addOn : a));
    } else {
      setAddOns([...addOns, addOn]);
    }
    setShowAddOnModal(false);
    setEditingAddOn(null);
  };

  const handleDeleteAddOn = (id: string | number) => {
    setAddOns(addOns.filter(a => a.id !== id));
  };

  const handleSeedData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Seed both plans and features in parallel
      await Promise.all([
        appConfigService.seedPlans(),
        appConfigService.seedFeatures(),
      ]);

      // Reload data after seeding
      const [featuresData, addOnsData, plansData] = await Promise.all([
        appConfigService.getFeatures(),
        appConfigService.getAddOns(),
        appConfigService.getPlans(true, 1, 50),
      ]);
      
      setFeatures(featuresData);
      setAddOns(addOnsData);
      setPlans(plansData);
      
      alert('Data seeded successfully!');
    } catch (error) {
      console.error('Failed to seed data:', error);
      setError('Failed to seed data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    // Implement CSV export
    const csv = [
      ['Feature Name', 'Code', 'Description', 'Status', 'Created Date'],
      ...filteredFeatures.map(f => [
        f.name,
        f.code,
        f.description,
        f.enabled ? 'Active' : 'Inactive',
        new Date(f.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `features-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">App Configuration</h1>
          <p className="text-slate-600 mt-1">Manage system features, subscription plans, and add-on modules</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSeedData} disabled={loading}>
            <RefreshCw size={16} className="mr-2" />
            Seed Data
          </Button>
          <Button variant="outline" onClick={exportToCSV} disabled={loading}>
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="text-red-600" size={20} />
            <div>
              <p className="font-bold text-red-900">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="addons">Add-on Modules</TabsTrigger>
        </TabsList>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings size={20} />
                  Features
                  {!loading && <Badge variant="secondary">{features.length}</Badge>}
                </CardTitle>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={loading}>
                      <Plus size={16} className="mr-2" />
                      Add Feature
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create New Feature</DialogTitle>
                    </DialogHeader>
                    <FeatureForm 
                      feature={null}
                      communityTypes={communityTypes}
                      onSave={(feature) => {
                        setFeatures(prev => [...prev, feature]);
                        setIsCreateModalOpen(false);
                      }}
                      onCancel={() => setIsCreateModalOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search features by name, code, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {filteredFeatures.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 font-medium">No features found</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                      <TableHead>Feature Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeatures.map(feature => (
                        <TableRow key={feature.id}>
                          <TableCell className="font-medium">{feature.name}</TableCell>
                          <TableCell className="font-mono text-sm text-slate-500">{feature.code}</TableCell>
                          <TableCell>
                            <Switch
                              checked={feature.enabled}
                              onCheckedChange={(checked) => handleToggleEnabled(feature.id, checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingFeature(feature)}
                              >
                                <Edit size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete "${feature.name}"? This action cannot be undone.`)) {
                                    handleDeleteFeature(feature.id);
                                  }
                                }}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Feature Modal */}
      {editingFeature && (
        <Dialog open={!!editingFeature} onOpenChange={() => setEditingFeature(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Feature</DialogTitle>
            </DialogHeader>
            <FeatureForm 
              feature={editingFeature}
              communityTypes={communityTypes}
              onSave={(updatedFeature) => {
                setFeatures(prev => prev.map(f => 
                  f.id === updatedFeature.id ? updatedFeature : f
                ));
                setEditingFeature(null);
              }}
              onCancel={() => setEditingFeature(null)}
            />
          </DialogContent>
        </Dialog>
      )}
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign size={20} />
                  Subscription Plans
                  <Badge variant="secondary">{plans.length}</Badge>
                </CardTitle>
                <Button onClick={handleAddPlan}>
                  <Plus size={16} className="mr-2" />
                  Add Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plans.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No subscription plans created yet</p>
                ) : (
                  plans.map(plan => (
                    <div key={plan.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-900">{plan.name}</h4>
                            {plan.recommended && <Badge className="bg-amber-100 text-amber-800">Recommended</Badge>}
                          </div>
                          <p className="text-sm text-slate-600">{plan.description}</p>
                          <div className="flex gap-4 mt-2">
                            <span className="text-lg font-black text-teal-600">₱{plan.monthlyPrice.toLocaleString()}/mo</span>
                            <span className="text-sm text-slate-500">₱{plan.annualPrice.toLocaleString()}/yr</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditPlan(plan)}>
                            <Edit size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeletePlan(plan.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-bold text-slate-600 uppercase mb-2">Included Features ({plan.features.length})</p>
                        <div className="grid grid-cols-2 gap-2">
                          {plan.features.length === 0 ? (
                            <p className="text-xs text-slate-500 col-span-2">No features selected</p>
                          ) : (
                            plan.features.map((featureCode) => {
                              const feature = features.find(f => f.code === featureCode);
                              return (
                                <div key={featureCode} className="text-xs p-2 rounded bg-green-50 text-green-700 flex items-start gap-1">
                                  {feature ? (
                                    <>
                                      <Check size={12} className="flex-shrink-0 mt-0.5" />
                                      <div>
                                        <div className="font-medium">{feature.name}</div>
                                        <div className="text-xs text-green-600">{featureCode}</div>
                                      </div>
                                    </>
                                  ) : (
                                    <span>{featureCode}</span>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Plan Modal */}
          {showPlanModal && (
            <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
                </DialogHeader>
                <PlanForm 
                  plan={editingPlan}
                  availableFeatures={features}
                  onSave={handleSavePlan}
                  onCancel={() => {
                    setShowPlanModal(false);
                    setEditingPlan(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        {/* Add-ons Tab */}
        <TabsContent value="addons" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings size={20} />
                  Add-on Modules
                  <Badge variant="secondary">{addOns.length}</Badge>
                </CardTitle>
                <Button onClick={handleAddAddOn} disabled={loading}>
                  <Plus size={16} className="mr-2" />
                  Add Module
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : (
                <div className="space-y-4">
                  {addOns.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No add-on modules available</p>
                  ) : (
                    addOns.map(addOn => (
                      <div key={addOn.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-slate-900">{addOn.name}</h4>
                              <Badge variant={addOn.enabled ? 'default' : 'secondary'}>
                                {addOn.enabled ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{addOn.description}</p>
                            <p className="text-xs text-slate-500 font-mono mb-2">Code: {addOn.code}</p>
                            <div className="flex gap-4">
                              {addOn.monthlyPrice !== null && (
                                <span className="text-sm font-bold text-teal-600">₱{(addOn.monthlyPrice || 0).toLocaleString()}/month</span>
                              )}
                              {addOn.oneTimePrice !== null && (
                                <span className="text-xs text-slate-500">+ ₱{(addOn.oneTimePrice || 0).toLocaleString()} one-time</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditAddOn(addOn)}>
                              <Edit size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAddOn(addOn.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add-on Modal */}
          {showAddOnModal && (
            <Dialog open={showAddOnModal} onOpenChange={setShowAddOnModal}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingAddOn ? 'Edit Add-on' : 'Create Add-on'}</DialogTitle>
                </DialogHeader>
                <AddOnForm 
                  addOn={editingAddOn}
                  onSave={handleSaveAddOn}
                  onCancel={() => {
                    setShowAddOnModal(false);
                    setEditingAddOn(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface FeatureFormProps {
  feature: Feature | null;
  communityTypes: CommunityType[];
  onSave: (feature: Feature) => void;
  onCancel: () => void;
}

const FeatureForm: React.FC<FeatureFormProps> = ({ feature, communityTypes, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Feature>>(feature || {
    name: '',
    key: '',
    code: '',
    description: '',
    type: 'feature',
    enabled: true,
    priced: false,
    monthlyPrice: null,
    oneTimePrice: null,
    prices: [],
    currency: 'PHP',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.description) return;

    const newFeature: Feature = {
      id: feature?.id || Date.now(),
      name: formData.name!,
      key: formData.key || formData.code!,
      code: formData.code!,
      description: formData.description!,
      type: formData.type || 'feature',
      enabled: formData.enabled || true,
      monthlyPrice: formData.monthlyPrice,
      oneTimePrice: formData.oneTimePrice,
      createdAt: feature?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(newFeature);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ScrollArea className="max-h-[60vh] pr-4">
        <div className="space-y-4 pr-4">
          <div>
            <label className="text-sm font-medium">Feature Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Live Chat"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Code</label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              placeholder="e.g., hasLiveChat"
              required
              disabled={!!feature}
              className="font-mono"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Type</label>
            <Select
              options={[
                { value: 'feature', label: 'Feature' },
                { value: 'addon', label: 'Add-on' },
                { value: 'module', label: 'Module' },
              ]}
              value={formData.type || 'feature'}
              onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              placeholder="Select feature type"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this feature..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <DollarSign size={14} />
                Monthly Price
              </label>
              <Input
                type="number"
                value={formData.monthlyPrice ?? ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  monthlyPrice: e.target.value ? parseFloat(e.target.value) : null 
                }))}
                placeholder="e.g., 1500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <DollarSign size={14} />
                One-time Price
              </label>
              <Input
                type="number"
                value={formData.oneTimePrice ?? ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  oneTimePrice: e.target.value ? parseFloat(e.target.value) : null 
                }))}
                placeholder="e.g., 5000"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Switch
              checked={formData.enabled || true}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
            />
            <label className="text-sm font-medium">Active</label>
          </div>
        </div>
      </ScrollArea>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {feature ? 'Save Changes' : 'Create Feature'}
        </Button>
      </div>
    </form>
  );
};

// Plan Form Component
interface PlanFormProps {
  plan: SubscriptionPlan | null;
  availableFeatures: Feature[];
  onSave: (plan: SubscriptionPlan) => void;
  onCancel: () => void;
}

const PlanForm: React.FC<PlanFormProps> = ({ plan, availableFeatures, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>(plan || {
    code: '',
    name: '',
    monthlyPrice: 0,
    annualPrice: 0,
    description: '',
    features: [],
    recommended: false,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    const newPlan: SubscriptionPlan = {
      id: plan?.id || Date.now().toString(),
      code: formData.code!,
      name: formData.name!,
      monthlyPrice: formData.monthlyPrice || 0,
      annualPrice: formData.annualPrice || 0,
      description: formData.description || '',
      features: formData.features || [],
      recommended: formData.recommended || false,
      startDate: formData.startDate,
      endDate: formData.endDate,
      notes: formData.notes,
    };

    onSave(newPlan);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ScrollArea className="h-[60vh] pr-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Plan Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Pro Community Plan"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Plan Code</label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              placeholder="e.g., pro"
              required
              disabled={!!plan}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Plan description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Monthly Price</label>
              <Input
                type="number"
                value={formData.monthlyPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, monthlyPrice: Number(e.target.value) }))}
                placeholder="999"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Annual Price</label>
              <Input
                type="number"
                value={formData.annualPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, annualPrice: Number(e.target.value) }))}
                placeholder="10000"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.recommended || false}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, recommended: checked }))}
            />
            <label className="text-sm font-medium">Mark as Recommended</label>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Included Features</label>
            <div className="space-y-2 border rounded-lg p-3 bg-slate-50">
              {availableFeatures.length === 0 ? (
                <p className="text-sm text-slate-500">No features available</p>
              ) : (
                availableFeatures.map(feature => (
                  <div key={feature.id} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={`feature-${feature.id}`}
                      checked={formData.features?.includes(feature.code) || false}
                      onChange={(e) => {
                        const updatedFeatures = e.target.checked
                          ? [...(formData.features || []), feature.code]
                          : (formData.features || []).filter(f => f !== feature.code);
                        setFormData(prev => ({ ...prev, features: updatedFeatures }));
                      }}
                      className="mt-1"
                    />
                    <label htmlFor={`feature-${feature.id}`} className="text-sm cursor-pointer flex-1">
                      <div className="font-medium text-slate-900">{feature.name}</div>
                    </label>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Selected: {formData.features?.length || 0} feature{(formData.features?.length || 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </ScrollArea>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {plan ? 'Save Changes' : 'Create Plan'}
        </Button>
      </div>
    </form>
  );
};

// Add-on Form Component
interface AddOnFormProps {
  addOn: Feature | null;
  onSave: (addOn: Feature) => void;
  onCancel: () => void;
}

const AddOnForm: React.FC<AddOnFormProps> = ({ addOn, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Feature>>(addOn || {
    name: '',
    code: '',
    key: '',
    description: '',
    type: 'addon',
    enabled: true,
    monthlyPrice: null,
    oneTimePrice: null,
    createdAt: new Date(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    const newAddOn: Feature = {
      id: addOn?.id || Date.now(),
      name: formData.name!,
      key: formData.code!,
      code: formData.code!,
      description: formData.description || '',
      type: 'addon',
      enabled: formData.enabled || true,
      monthlyPrice: formData.monthlyPrice,
      oneTimePrice: formData.oneTimePrice,
      createdAt: addOn?.createdAt || new Date(),
      updatedAt: new Date(),
      category: 'Add-on',
      currency: 'PHP',
    };

    onSave(newAddOn);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Module Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., SMS Alert System"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Module Code</label>
        <Input
          value={formData.code}
          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
          placeholder="e.g., sms_alerts"
          required
          disabled={!!addOn}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Module description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium flex items-center gap-2">
            <DollarSign size={14} />
            Monthly Price
          </label>
          <Input
            type="number"
            value={formData.monthlyPrice ?? ''}
            onChange={(e) => setFormData(prev => ({ ...prev, monthlyPrice: e.target.value ? parseFloat(e.target.value) : null }))}
            placeholder="1500"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="text-sm font-medium flex items-center gap-2">
            <DollarSign size={14} />
            One-time Price (optional)
          </label>
          <Input
            type="number"
            value={formData.oneTimePrice ?? ''}
            onChange={(e) => setFormData(prev => ({ ...prev, oneTimePrice: e.target.value ? parseFloat(e.target.value) : null }))}
            placeholder="5000"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={formData.enabled || true}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
        />
        <label className="text-sm font-medium">Active</label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {addOn ? 'Save Changes' : 'Create Module'}
        </Button>
      </div>
    </form>
  );
};

export default AppConfigPage;