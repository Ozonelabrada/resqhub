import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  Button,
  Spinner
} from '../ui';
import { Check, Zap, Shield, Crown, Sparkles } from 'lucide-react';
import { SubscriptionService } from '../../services/subscriptionService';
import { cn } from '../../lib/utils';
import { SITE } from '@/constants/site';
import { formatCurrencyPHP } from '@/utils/formatter';

interface DisplayPlan {
  id: string;
  name: string;
  price: number;
  interval?: 'month' | 'year' | string;
  features: string[];
  status?: string;
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [plans, setPlans] = useState<DisplayPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    setLoading(true);
    const data = await SubscriptionService.getPlans();

    const uiPlans: DisplayPlan[] = (data && data.length > 0)
      ? data.map(p => ({
          id: p.code ?? String(p.id),
          name: p.name,
          price: (p.monthlyPrice ?? p.annualPrice ?? 0),
          interval: 'month',
          features: Array.isArray(p.features) ? p.features.map(f => String(f)) : [],
          status: p.status,
        }))
      : [
          { id: 'free', name: 'Free', price: 0, interval: 'month', features: ['Basic community features'] },
          { id: 'pro', name: 'Pro', price: 2499, interval: 'month', features: ['Advanced analytics', 'Priority support'] },
          { id: 'premium', name: 'Premium', price: 4999, interval: 'month', features: ['White-label', '24/7 support'] },
        ];

    setPlans(uiPlans);
    setLoading(false);
  };

  const handleSubscribe = async (planId: string) => {
    setProcessing(planId);
    try {
      const result = await SubscriptionService.subscribe(planId);
      if (result?.checkoutUrl) {
         window.location.href = result.checkoutUrl;
      } else {
        // Simulate local success for demo if no backend URL
        (window as any).showToast?.('success', 'Subscription Active', `Welcome to ${SITE.name} Premium!`);
        onSuccess?.();
        onClose();
      }
    } catch (error) {
       (window as any).showToast?.('error', 'Payment Failed', 'Something went wrong with the transaction.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[800px] border-none shadow-2xl rounded-[3rem] p-0 overflow-hidden bg-slate-50">
        <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Side: Info */}
            <div className="lg:col-span-5 bg-slate-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-teal-500/20">
                        <Sparkles size={24} className="text-white fill-white" />
                    </div>
                    <h2 className="text-3xl font-black mb-4 leading-tight">Elevate Your Presence</h2>
                    <p className="text-slate-400 font-medium leading-relaxed">
                        Join the elite tier of {SITE.name} communities. Unlock tools designed for scale, engagement, and safety.
                    </p>

                    <div className="mt-10 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                <Zap size={16} className="text-teal-400" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Instant Approval</p>
                                <p className="text-xs text-slate-500">Skip the manual review queue</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                <Shield size={16} className="text-teal-400" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Certified Trust</p>
                                <p className="text-xs text-slate-500">Get the Verified Community badge</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 pt-12">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Secure Checkout</p>
                    <p className="text-xs font-medium text-slate-600 mt-1">Powered by Stripe & SecurePay</p>
                </div>

                {/* Decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
            </div>

            {/* Right Side: Plans */}
            <div className="lg:col-span-7 p-10">
                <DialogHeader className="mb-8">
                    <DialogTitle className="text-2xl font-black text-slate-900">Choose your plan</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">Transparent pricing for every community size.</DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Spinner size="lg" className="text-teal-600" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {plans.map(plan => (
                            <div 
                                key={plan.id}
                                className={cn(
                                    "p-6 rounded-[2rem] border-2 transition-all cursor-pointer relative",
                                    (['premium','pro'].includes(plan.id))
                                        ? "border-teal-600 bg-white shadow-xl shadow-teal-600/5 ring-4 ring-teal-50" 
                                        : "border-slate-100 bg-white hover:border-slate-200"
                                )}
                                onClick={() => (['premium','pro'].includes(plan.id)) && handleSubscribe(plan.id)}
                            >
                                {(['premium','pro'].includes(plan.id)) && (
                                    <div className="absolute top-0 right-10 -translate-y-1/2 bg-teal-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <Crown size={12} />
                                        Recommended
                                    </div>
                                )}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="text-xl font-black text-slate-900">{plan.name}</h4>
                                        <p className="text-xs font-bold text-slate-400 capitalize">{plan.interval}ly billing</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-slate-900">{formatCurrencyPHP(plan.price)}</p>
                                        <p className="text-[10px] font-black text-slate-400">PHP</p>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-6">
                                    {plan.features.map((f, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", (['premium','pro'].includes(plan.id) ? "bg-teal-50 text-teal-600" : "bg-slate-50 text-slate-400"))}>
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            <span className="text-sm font-medium text-slate-600">{f}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button 
                                    className={cn(
                                        "w-full h-12 rounded-2xl font-black transition-all",
                                        (['premium','pro'].includes(plan.id)) 
                                            ? "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-100" 
                                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                    )}
                                    disabled={plan.id === 'free' || processing === plan.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSubscribe(plan.id);
                                    }}
                                >
                                    {processing === plan.id ? <Spinner size="sm" className="mr-2" /> : null}
                                    {plan.id === 'free' ? 'Current Plan' : 'Select Premium'}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
