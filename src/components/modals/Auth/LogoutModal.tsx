import React from 'react';
import { LogOut, X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  Button,
  Logo 
} from '../../ui';
import { useTranslation } from 'react-i18next';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl bg-white">
        <div className="relative p-10 flex flex-col items-center text-center">
          {/* Decorative background element */}
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-teal-50/50 to-transparent -z-10" />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={20} />
          </button>

          <div className="mb-8">
             <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl shadow-xl shadow-teal-200 flex items-center justify-center text-white transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <LogOut size={44} strokeWidth={2.5} className="ml-1" />
             </div>
          </div>

          <div className="mb-6">
            <Logo variant="full" size={48} />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
            See you soon!
          </h2>
          
          <p className="text-slate-500 mb-10 leading-relaxed text-lg font-medium max-w-[300px]">
            Are you sure you want to log out of your account?
          </p>

          <div className="flex flex-col w-full gap-4">
            <Button
              onClick={onConfirm}
              loading={isLoading}
              className="w-full py-7 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xl shadow-xl shadow-teal-600/20 transition-all active:scale-[0.98] border-none"
            >
              Log Me Out
            </Button>
            
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full py-6 rounded-2xl text-slate-400 font-bold hover:bg-slate-50 hover:text-slate-600 text-base"
            >
              Nah, Stay Logged In
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutModal;
