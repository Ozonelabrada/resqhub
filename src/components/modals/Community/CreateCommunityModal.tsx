import React, { useState, useEffect } from 'react';
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
import { Users, Globe, Lock, Zap, ArrowRight, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { CommunityService } from '../../../services/communityService';
import { SITE } from '@/constants/site';
import { SubscriptionService, type SubscriptionStatus } from '../../../services/subscriptionService';
import SubscriptionModal from '../SubscriptionModal';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 'details' | 'review' | 'success';

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subStatus, setSubStatus] = useState<SubscriptionStatus>({ isActive: false, isPremium: false });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    privacy: 'public'
  });

  useEffect(() => {
    if (isOpen) {
      fetchSubscription();
      setStep('details');
      setFormData({
        name: '',
        description: '',
        location: '',
        privacy: 'public'
      });
    }
  }, [isOpen]);

  const fetchSubscription = async () => {
    const status = await SubscriptionService.getCurrentSubscription();
    setSubStatus(status);
  };

  const handleNext = () => {
    if (!formData.name || !formData.description || !formData.location) return;
    setStep('review');
  };

  const handleSubmit = async (isPremiumUpgrade: boolean = false) => {
    setLoading(true);
    
    try {
      if (isPremiumUpgrade) {
          // Handle payment flow first? 
          // For now simulate immediate premium creation
          console.log('Premium creation...');
      }

      const result = await CommunityService.submitForReview(formData);
      
      if (result) {
        setStep('success');
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Failed to create community:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDetails = () => (
    <form className="p-8 pt-6 space-y-6">
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
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location</label>
          <Input 
            required
            placeholder="e.g. City, Region or 'Online'"
            className="h-12 rounded-xl border-slate-200 focus:ring-teal-500/20 font-bold"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('community.privacy')}</label>
          <Select value={formData.privacy} onValueChange={(v) => setFormData({...formData, privacy: v})}>
            <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-teal-500/20 font-bold bg-white">
              <SelectValue placeholder="Select Privacy" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl p-2 bg-white sticky z-[110]">
              <SelectItem value="public" className="py-3 rounded-lg focus:bg-teal-50 focus:text-teal-700 font-bold">
                <div className="flex items-center gap-2">
                  <Globe size={16} />
                  <span>Public</span>
                </div>
              </SelectItem>
              <SelectItem value="private" className="py-3 rounded-lg focus:bg-teal-50 focus:text-teal-700 font-bold">
                <div className="flex items-center gap-2">
                  <Lock size={16} />
                  <span>Private</span>
                </div>
              </SelectItem>
              <SelectItem value="government" className="py-3 rounded-lg focus:bg-teal-50 focus:text-teal-700 font-bold">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} />
                  <span>Government</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter className="pt-4 flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose} className="font-bold text-slate-500">
          {t('common.cancel')}
        </Button>
        <Button 
            type="button" 
            onClick={handleNext} 
            className="bg-teal-600 hover:bg-teal-700 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-teal-100"
        >
          {t('common.continue')} <ArrowRight size={18} className="ml-2" />
        </Button>
      </DialogFooter>
    </form>
  );

  const renderReview = () => (
    <div className="p-8 pt-6 space-y-8">
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Request Overview</h4>
         <div className="space-y-4">
            <div>
               <p className="text-xs font-bold text-slate-400 mb-1">Community Name</p>
               <p className="font-black text-slate-800">{formData.name}</p>
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 mb-1">Privacy Mode</p>
               <div className="flex items-center gap-2 text-slate-700 font-bold">
                  {formData.privacy === 'public' ? <Globe size={14} /> : <Lock size={14} />}
                  <span className="capitalize">{formData.privacy}</span>
               </div>
            </div>
         </div>
      </div>

      {!subStatus.isPremium && (
        <div className="space-y-4">
           <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
              <AlertCircle className="text-amber-600 shrink-0" size={20} />
              <div className="text-sm">
                 <p className="font-black text-amber-900">Review Period Required</p>
                 <p className="text-amber-700 font-medium">Free requests usually take 24-48 hours for admin approval.</p>
              </div>
           </div>

           {/* <div className="p-6 rounded-[2rem] bg-orange-600 text-white relative overflow-hidden shadow-xl shadow-orange-200">
              <div className="relative z-10">
                 <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-2">
                       <Zap size={14} className="fill-white" />
                       <span className="text-[10px] font-black uppercase tracking-wider">Instant Approval</span>
                    </div>
                    <span className="text-xl font-black">$29/mo</span>
                 </div>
                 <h4 className="text-lg font-black mb-1">Go Premium</h4>
                 <p className="text-orange-100 text-xs font-medium mb-4 leading-relaxed">
                    Skip the queue, get immediate approval, and unlock advanced community analytics.
                 </p>
                 <Button 
                    onClick={() => setIsSubModalOpen(true)}
                    className="w-full bg-white text-orange-600 hover:bg-orange-50 font-black rounded-xl h-11"
                 >
                    Upgrade & Create Now
                 </Button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
           </div> */}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
         <Button variant="ghost" onClick={() => setStep('details')} className="font-bold text-slate-500">
            Back
         </Button>
         <Button 
            onClick={() => handleSubmit(false)} 
            disabled={loading}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-black h-12 rounded-xl shadow-lg shadow-teal-100"
         >
            {loading ? 'Submitting...' : 'Submit for Review'}
         </Button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="p-12 text-center space-y-6">
       <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="text-emerald-500" size={40} />
       </div>
       <div>
          <h3 className="text-2xl font-black text-slate-900">Request Received</h3>
          <p className="text-slate-500 font-medium mt-2 leading-relaxed">
             Our team is reviewing "{formData.name}". We'll notify you via email and in-app notifications once it's live.
          </p>
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-xs text-slate-400 font-medium">
             Note: Your community will not appear in the directory or your hub until it has been approved by our safety team.
          </div>
       </div>
       <Button onClick={onClose} className="bg-slate-900 text-white font-black px-10 h-12 rounded-xl w-full">
          Got it, thanks!
       </Button>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden bg-white">
          {step !== 'success' && (
            <DialogHeader className="p-8 pb-0">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center">
                   <Users className="text-teal-600" size={28} />
                 </div>
                 {step === 'review' && (
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Step 02/02</span>
                       <span className="text-slate-400 font-bold text-xs">Review & Monetization</span>
                    </div>
                 )}
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900">
                 {step === 'details' ? t('community.create') : 'Submit for Review'}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium pt-1">
                 {step === 'details' 
                   ? t('community.create_description') 
                   : `We review all new communities to ensure safety and quality for ${SITE.name} members.`}
              </DialogDescription>
            </DialogHeader>
          )}

          {step === 'details' && renderDetails()}
          {step === 'review' && renderReview()}
          {step === 'success' && renderSuccess()}
        </DialogContent>
      </Dialog>

      <SubscriptionModal 
        isOpen={isSubModalOpen} 
        onClose={() => setIsSubModalOpen(false)}
        onSuccess={() => {
            fetchSubscription();
            handleSubmit(true);
        }}
      />
    </>
  );
};

export default CreateCommunityModal;
