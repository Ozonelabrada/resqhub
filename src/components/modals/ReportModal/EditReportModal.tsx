import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  Input, 
  Button, 
  Textarea,
  Select,
  Alert,
  Spinner
} from '../../ui';
import { 
  FileText, 
  MapPin, 
  Tag, 
  Info, 
  DollarSign, 
  Phone,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Modal } from '../../ui/Modal/Modal';
import { ReportsService, type LostFoundItem } from '../../../services/reportsService';
import { CategoryService } from '../../../services/categoryService';
import { useTranslation } from 'react-i18next';
import { searchLocations, type LocationSuggestion } from '../../../utils/geolocation';
import { cn } from '../../../lib/utils';

interface EditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  report: LostFoundItem;
}

export const EditReportModal: React.FC<EditReportModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  report
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<{ label: string, value: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: report.title || '',
    description: report.description || '',
    categoryId: report.categoryId || 0,
    location: report.location || '',
    contactInfo: report.contactInfo || '',
    rewardDetails: report.rewardDetails || '',
    reportType: report.reportType || 'Lost'
  });

  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      setFormData({
        title: report.title || '',
        description: report.description || '',
        categoryId: report.categoryId || 0,
        location: report.location || '',
        contactInfo: report.contactInfo || '',
        rewardDetails: report.rewardDetails || '',
        reportType: report.reportType || 'Lost'
      });
    }
  }, [isOpen, report]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.location.length >= 3 && isSearchingLocation) {
        const results = await searchLocations(formData.location);
        setLocationSuggestions(results);
        setShowSuggestions(true);
        setIsSearchingLocation(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.location, isSearchingLocation]);

  const loadCategories = async () => {
    try {
      const data = await CategoryService.getCategories();
      setCategories(data.map((cat: any) => ({
        label: cat.name,
        value: cat.id
      })));
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Send as JSON since user said "except the images" and simplified info
      const result = await ReportsService.updateReport(report.id, {
        ...formData,
        categoryId: Number(formData.categoryId)
      });

      if (result.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(result.message || 'Failed to update report');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-2xl w-full bg-white rounded-[2rem] shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Report</h2>
            <p className="text-slate-500 text-sm font-medium">Update the details of your report</p>
          </div>
        </div>

        {error && (
          <Alert variant="error" className="mb-6 rounded-2xl border-rose-100 bg-rose-50/50">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Report Title</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors">
                <FileText size={18} />
              </div>
              <Input
                placeholder="e.g., Lost Golden Retriever near Central Park"
                className="pl-12 h-14 rounded-2xl border-slate-200 focus:border-teal-500 focus:ring-teal-500/10 font-medium"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Report Type</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors z-10">
                  <Tag size={18} />
                </div>
                <select
                  className="w-full pl-12 h-14 rounded-2xl border-slate-200 focus:border-teal-500 focus:ring-teal-500/10 font-medium bg-white appearance-none cursor-pointer"
                  value={formData.reportType}
                  onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                  required
                >
                  <option value="Lost">Lost Item</option>
                  <option value="Found">Found Item</option>
                  <option value="News">News</option>
                  <option value="Discussion">Discussion</option>
                  <option value="Announcement">Announcement</option>
                </select>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors z-10">
                  <Info size={18} />
                </div>
                <select
                  className="w-full pl-12 h-14 rounded-2xl border-slate-200 focus:border-teal-500 focus:ring-teal-500/10 font-medium bg-white appearance-none cursor-pointer"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                  required
                >
                  <option value={0}>Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Detailed Description</label>
            <Textarea
              placeholder="Provide as much detail as possible to help others identify the item or understand the report..."
              className="min-h-[120px] rounded-2xl border-slate-200 focus:border-teal-500 focus:ring-teal-500/10 font-medium p-4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Seen Location / Area</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors">
                <MapPin size={18} />
              </div>
              <Input
                placeholder="Search for a location..."
                className="pl-12 h-14 rounded-2xl border-slate-200 focus:border-teal-500 focus:ring-teal-500/10 font-medium"
                value={formData.location}
                onChange={(e) => {
                  setFormData({ ...formData, location: e.target.value });
                  setIsSearchingLocation(true);
                  if (e.target.value === '') setShowSuggestions(false);
                }}
                required
              />
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-[100] w-full mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {locationSuggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.lat}-${suggestion.lon}`}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 border-b border-slate-50 last:border-none"
                      onClick={() => {
                        setFormData({ ...formData, location: suggestion.display_name });
                        setShowSuggestions(false);
                      }}
                    >
                      <MapPin size={14} className="text-teal-500 flex-shrink-0" />
                      <span className="text-sm text-slate-600 truncate">{suggestion.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Contact Info</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors">
                  <Phone size={18} />
                </div>
                <Input
                  placeholder="e.g., 0912-345-6789"
                  className="pl-12 h-14 rounded-2xl border-slate-200 focus:border-teal-500 focus:ring-teal-500/10 font-medium"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Reward */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reward Details (Optional)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors">
                  <DollarSign size={18} />
                </div>
                <Input
                  placeholder="e.g., PHP 5,000 or 'Token of appreciation'"
                  className="pl-12 h-14 rounded-2xl border-slate-200 focus:border-teal-500 focus:ring-teal-500/10 font-medium"
                  value={formData.rewardDetails}
                  onChange={(e) => setFormData({ ...formData, rewardDetails: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50 flex gap-4">
            <Button
              type="submit"
              className="flex-1 h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>Updating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save size={18} />
                  <span>Update Report</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditReportModal;
