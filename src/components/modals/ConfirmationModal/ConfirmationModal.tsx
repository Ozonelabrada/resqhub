import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dialog,
  DialogContent,
  Button,
  Logo 
} from '../../ui';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';

interface ConfirmationModalProps {
  visible: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onHide,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  severity = 'warning',
  loading = false
}) => {
  const { t } = useTranslation();
  
  const displayTitle = title || t('common.confirm_action');
  const displayMessage = message || t('common.confirm_question');
  const displayConfirmLabel = confirmLabel || t('common.confirm');
  const displayCancelLabel = cancelLabel || t('common.cancel');

  // Configuration based on severity
  const getSeverityConfig = () => {
    switch (severity) {
      case 'danger':
        return {
          icon: <AlertCircle size={44} strokeWidth={2.5} />,
          gradient: 'from-rose-500 to-red-600',
          shadow: 'shadow-red-200',
          bgGradient: 'from-red-50/50',
          buttonBg: 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={44} strokeWidth={2.5} />,
          gradient: 'from-emerald-500 to-teal-600',
          shadow: 'shadow-emerald-200',
          bgGradient: 'from-emerald-50/50',
          buttonBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
        };
      case 'info':
        return {
          icon: <Info size={44} strokeWidth={2.5} />,
          gradient: 'from-blue-500 to-indigo-600',
          shadow: 'shadow-blue-200',
          bgGradient: 'from-blue-50/50',
          buttonBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
        };
      case 'warning':
      default:
        return {
          icon: <AlertTriangle size={44} strokeWidth={2.5} />,
          gradient: 'from-amber-500 to-orange-600',
          shadow: 'shadow-amber-200',
          bgGradient: 'from-amber-50/50',
          buttonBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
        };
    }
  };

  const config = getSeverityConfig();

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onHide()}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl bg-white">
        <div className="relative p-10 flex flex-col items-center text-center">
          {/* Decorative background element */}
          <div className={`absolute top-0 left-0 w-full h-40 bg-gradient-to-b ${config.bgGradient} to-transparent -z-10`} />
          

          <div className="mb-8">
             <div className={`w-24 h-24 bg-gradient-to-br ${config.gradient} ${config.shadow} rounded-3xl shadow-xl flex items-center justify-center text-white transform -rotate-3 hover:rotate-0 transition-transform duration-300`}>
                {config.icon}
             </div>
          </div>

          <div className="mb-6">
            <Logo variant="full" size={48} />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
            {displayTitle}
          </h2>
          
          <p className="text-slate-500 mb-10 leading-relaxed text-lg font-medium max-w-[320px]">
            {displayMessage}
          </p>

          <div className="flex flex-col w-full gap-4">
            <Button
              onClick={onConfirm}
              loading={loading}
              className={`w-full py-7 rounded-2xl ${config.buttonBg} text-white font-black text-xl shadow-xl transition-all active:scale-[0.98] border-none`}
            >
              {displayConfirmLabel}
            </Button>
            
            <Button
              onClick={onHide}
              variant="ghost"
              className="w-full py-6 rounded-2xl text-slate-400 font-bold hover:bg-slate-50 hover:text-slate-600 text-base"
            >
              {displayCancelLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;