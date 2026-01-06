import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Textarea,
  ShadcnSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui';
import { Users, Globe, Lock } from 'lucide-react';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy: 'public'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // API call would go here
      // await communityService.create(formData);
      console.log('Creating community:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create community:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden bg-white">
        <DialogHeader className="p-8 pb-0">
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
            <Users className="text-teal-600" size={28} />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900">{t('community.create')}</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium pt-1">
            {t('community.create_description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('community.name')}</label>
              <Input 
                required
                placeholder="e.g. Green Valley Residents"
                className="h-12 rounded-xl border-slate-200 focus:ring-teal-500/20 font-bold"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('community.description')}</label>
              <Textarea 
                required
                placeholder="What is this community about?"
                className="min-h-[100px] rounded-xl border-slate-200 focus:ring-teal-500/20 font-medium"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('community.privacy')}</label>
              <Select value={formData.privacy} onValueChange={(v) => setFormData({...formData, privacy: v})}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-teal-500/20 font-bold bg-white">
                  <SelectValue placeholder="Select Privacy" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl p-2 bg-white">
                  <SelectItem value="public" className="py-3 rounded-lg focus:bg-teal-50 focus:text-teal-700 font-bold">
                    <div className="flex items-center gap-2">
                      <Globe size={16} />
                      <span>{t('community.privacy_public')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private" className="py-3 rounded-lg focus:bg-teal-50 focus:text-teal-700 font-bold">
                    <div className="flex items-center gap-2">
                      <Lock size={16} />
                      <span>{t('community.privacy_private')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4 flex items-center justify-end gap-2">
            <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose}
                className="font-bold text-slate-500"
            >
              {t('common.cancel')}
            </Button>
            <Button 
                type="submit" 
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-700 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-teal-100"
            >
              {loading ? t('common.loading') : t('community.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCommunityModal;
