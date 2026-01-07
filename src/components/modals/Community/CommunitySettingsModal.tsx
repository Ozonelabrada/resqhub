import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  Button,
  Spinner
} from '../../ui';
import { Settings, Upload, Save, X, Plus, Trash2 } from 'lucide-react';
import type { Community } from '@/types/community';
import { CommunityService } from '@/services';

interface CommunitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: Community;
  onSuccess?: () => void;
}

const CommunitySettingsModal: React.FC<CommunitySettingsModalProps> = ({ isOpen, onClose, community, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: community.name || '',
    tagline: community.tagline || '',
    description: community.description || '',
    location: community.location || '',
    rules: Array.isArray(community.rules) ? [...community.rules] : [] as string[]
  });

  const [newRule, setNewRule] = useState('');

  useEffect(() => {
    if (community) {
      setFormData({
        name: community.name || '',
        tagline: community.tagline || '',
        description: community.description || '',
        location: community.location || '',
        rules: Array.isArray(community.rules) ? [...community.rules] : []
      });
    }
  }, [community]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await CommunityService.updateCommunity(community.id, formData);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to update community:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRule = () => {
    if (newRule.trim()) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()]
      }));
      setNewRule('');
    }
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-none shadow-2xl rounded-[2.5rem] p-8 bg-white">
        <DialogHeader>
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
            <Settings className="text-teal-600" size={24} />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900">Community Settings</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Manage your community's identity, rules, and visibility.
          </DialogDescription>
        </DialogHeader>

        <div className="py-8 space-y-8">
          {/* Visual Identity */}
          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Identity</label>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3">
                      <Upload className="text-slate-400" size={24} />
                   </div>
                   <p className="text-sm font-bold text-slate-600">Change Logo</p>
                   <p className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3">
                      <Upload className="text-slate-400" size={24} />
                   </div>
                   <p className="text-sm font-bold text-slate-600">Change Banner</p>
                   <p className="text-[10px] text-slate-400 mt-1">Recommended: 1600x400</p>
                </div>
             </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Community Name</label>
                <input 
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-700" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tagline</label>
                <input 
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-700" 
                  placeholder="A short punchy line for your community"
                  value={formData.tagline}
                  onChange={e => setFormData({...formData, tagline: e.target.value})}
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                <input 
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-700" 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                <textarea 
                  className="w-full p-4 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-700 resize-none" 
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
             </div>
          </div>

          {/* Rules Management */}
          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Community Rules</label>
             <div className="space-y-3">
                {formData.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl group">
                     <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">{idx + 1}</div>
                     <span className="flex-1 text-sm font-medium text-slate-700">{rule}</span>
                     <button onClick={() => removeRule(idx)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 transition-all">
                        <Trash2 size={16} />
                     </button>
                  </div>
                ))}
             </div>
             <div className="flex gap-2">
                <input 
                  className="flex-1 h-12 px-4 rounded-xl bg-white border border-slate-100 focus:ring-2 focus:ring-teal-500 font-medium text-slate-700" 
                  placeholder="Add a new rule..."
                  value={newRule}
                  onChange={e => setNewRule(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addRule()}
                />
                <Button onClick={addRule} variant="ghost" className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-100">
                   <Plus size={20} />
                </Button>
             </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
           <Button variant="ghost" onClick={onClose} className="font-bold text-slate-400 rounded-xl h-12 px-6">
              Discard Changes
           </Button>
           <Button 
             onClick={handleSave} 
             disabled={loading}
             className="bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl h-12 px-10 shadow-xl shadow-teal-100 transition-all active:scale-95"
           >
              {loading ? <Spinner size="sm" className="mr-2" /> : <Save size={18} className="mr-2" />}
              Save Settings
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommunitySettingsModal;
