import React from 'react';
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button 
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
  icon?: string;
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onHide,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  severity = 'warning',
  icon,
  loading = false
}) => {
  // Default icons based on severity
  const getIcon = () => {
    switch (severity) {
      case 'danger': return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-12 h-12 text-amber-500" />;
      case 'info': return <Info className="w-12 h-12 text-blue-500" />;
      case 'success': return <CheckCircle2 className="w-12 h-12 text-green-500" />;
      default: return <AlertTriangle className="w-12 h-12 text-amber-500" />;
    }
  };

  const getSeverityStyles = () => {
    switch (severity) {
      case 'danger': return 'bg-red-50 text-red-900 border-red-100';
      case 'warning': return 'bg-amber-50 text-amber-900 border-amber-100';
      case 'info': return 'bg-blue-50 text-blue-900 border-blue-100';
      case 'success': return 'bg-green-50 text-green-900 border-green-100';
      default: return 'bg-amber-50 text-amber-900 border-amber-100';
    }
  };

  const getButtonVariant = () => {
    switch (severity) {
      case 'danger': return 'danger';
      default: return 'primary';
    }
  };

  return (
    <Modal 
      isOpen={visible} 
      onClose={onHide} 
      title={title}
      size="sm"
      skipExitConfirmation={true}
    >
      <ModalBody className="p-8 flex flex-col items-center text-center space-y-6">
        <div className={`p-4 rounded-full ${getSeverityStyles().split(' ')[0]} animate-in zoom-in duration-300`}>
          {getIcon()}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <p className="text-slate-600 leading-relaxed">
            {message}
          </p>
        </div>
      </ModalBody>

      <ModalFooter className="bg-slate-50/50 p-6 flex justify-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onHide}
          disabled={loading}
          className="rounded-xl px-6"
        >
          {cancelLabel}
        </Button>
        <Button 
          variant={getButtonVariant() as any}
          onClick={onConfirm}
          isLoading={loading}
          className={`rounded-xl px-8 shadow-lg ${severity === 'danger' ? 'shadow-red-100' : 'shadow-blue-100'}`}
        >
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmationModal;