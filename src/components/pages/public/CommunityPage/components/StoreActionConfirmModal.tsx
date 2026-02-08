import React from 'react';
import { Card, Button } from '@/components/ui';
import { Loader2, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface StoreActionConfirmModalProps {
  isOpen: boolean;
  actionType: 'approve' | 'reject' | 'suspend' | 'reopen' | null;
  storeName: string | undefined;
  reason: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onReasonChange: (reason: string) => void;
}

/**
 * Confirmation modal for store management actions
 * Handles approve, reject, suspend, and reopen actions
 * ~180 lines - focused on action confirmation UI
 */
export const StoreActionConfirmModal: React.FC<StoreActionConfirmModalProps> = ({
  isOpen,
  actionType,
  storeName,
  reason,
  isLoading,
  onConfirm,
  onCancel,
  onReasonChange,
}) => {
  if (!isOpen || !actionType) return null;

  const getActionConfig = () => {
    switch (actionType) {
      case 'approve':
        return {
          title: 'Approve Store?',
          message: `Once approved, "${storeName}" will be visible to all community members.`,
          icon: CheckCircle2,
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
          buttonBg: 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300',
          buttonLabel: 'Approve',
          needsReason: false,
        };
      case 'reject':
        return {
          title: 'Reject Store?',
          message: 'Please provide a reason for the rejection.',
          icon: X,
          iconBg: 'bg-rose-100',
          iconColor: 'text-rose-600',
          buttonBg: 'bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300',
          buttonLabel: 'Reject',
          needsReason: true,
          reasonPlaceholder: 'E.g., Missing business permit, Incomplete documentation...',
          focusRing: 'focus:ring-rose-500',
        };
      case 'suspend':
        return {
          title: 'Suspend Store?',
          message: 'Please provide a reason for the suspension.',
          icon: AlertCircle,
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          buttonBg: 'bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300',
          buttonLabel: 'Suspend',
          needsReason: true,
          reasonPlaceholder: 'E.g., Policy violation, Unethical behavior, Suspicious activity...',
          focusRing: 'focus:ring-amber-500',
        };
      case 'reopen':
        return {
          title: 'Re-open Store?',
          message: `"${storeName}" will be restored and visible to community members.`,
          icon: CheckCircle2,
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
          buttonBg: 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300',
          buttonLabel: 'Re-open',
          needsReason: false,
        };
      default:
        return null;
    }
  };

  const config = getActionConfig();
  if (!config) return null;

  const IconComponent = config.icon;
  const isFormValid = !config.needsReason || reason.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl bg-white">
        {/* Icon & Title */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 ${config.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <IconComponent size={32} className={config.iconColor} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">{config.title}</h3>
          <p className="text-slate-600 text-sm">{config.message}</p>
        </div>

        {/* Reason Input (if needed) */}
        {config.needsReason && (
          <div className="mb-6">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
              {actionType === 'reject' ? 'Rejection' : 'Suspension'} Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder={config.reasonPlaceholder}
              className={`w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${config.focusRing} focus:border-transparent resize-none`}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 h-11 bg-slate-100 hover:bg-slate-150 text-slate-700 font-bold rounded-2xl transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading || !isFormValid}
            className={`flex-1 h-11 ${config.buttonBg} text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2`}
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <IconComponent size={16} />}
            {config.buttonLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
};
