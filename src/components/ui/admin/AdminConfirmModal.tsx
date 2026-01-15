import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Button } from '../Button/Button';
import { cn } from '@/lib/utils';

interface AdminConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'success' | 'info';
  loading?: boolean;
}

export const AdminConfirmModal: React.FC<AdminConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  loading = false
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="text-red-600" size={48} />,
          headerBg: 'bg-red-50',
          headerText: 'text-red-800',
          confirmBtn: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="text-orange-600" size={48} />,
          headerBg: 'bg-orange-50',
          headerText: 'text-orange-800',
          confirmBtn: 'bg-orange-600 hover:bg-orange-700 text-white'
        };
      case 'success':
        return {
          icon: <CheckCircle className="text-green-600" size={48} />,
          headerBg: 'bg-green-50',
          headerText: 'text-green-800',
          confirmBtn: 'bg-green-600 hover:bg-green-700 text-white'
        };
      default:
        return {
          icon: <CheckCircle className="text-blue-600" size={48} />,
          headerBg: 'bg-blue-50',
          headerText: 'text-blue-800',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className={cn('px-6 py-6 text-center', styles.headerBg)}>
          <div className="flex justify-center mb-4">
            {styles.icon}
          </div>
          <h2 className={cn('text-xl font-black tracking-tight', styles.headerText)}>
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-slate-600 text-center leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 font-bold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={cn('flex-1 font-bold rounded-xl', styles.confirmBtn)}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminConfirmModal;