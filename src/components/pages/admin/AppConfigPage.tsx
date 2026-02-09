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
} from 'lucide-react';
import { appConfigService, type Feature, type CommunityType } from '../../../services/appConfigService';

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

  // Fetch features on mount
  useEffect(() => {
    const loadFeatures = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await appConfigService.getFeatures();
        setFeatures(data);
      } catch (err) {
        setError('Failed to load features. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFeatures();
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
          <p className="text-slate-600 mt-1">Manage system features and settings</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportToCSV} disabled={loading}>
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
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

      {/* Features Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            Features
            {!loading && <Badge variant="secondary">{features.length}</Badge>}
          </CardTitle>
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
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeatures.map(feature => (
                        <TableRow key={feature.id}>
                          <TableCell className="font-medium">{feature.name}</TableCell>
                          <TableCell className="font-mono text-sm text-slate-500">{feature.code}</TableCell>
                          <TableCell className="text-sm text-slate-600">{feature.description}</TableCell>
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
    enabled: true,
    priced: false,
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
      enabled: formData.enabled || true,
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
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this feature..."
              required
            />
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

export default AppConfigPage;