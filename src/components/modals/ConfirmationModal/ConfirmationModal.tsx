import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

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
  const defaultIcons = {
    danger: 'pi pi-exclamation-triangle',
    warning: 'pi pi-exclamation-triangle',
    info: 'pi pi-info-circle',
    success: 'pi pi-check-circle'
  };

  const displayIcon = icon || defaultIcons[severity];

  // Color schemes based on severity
  const colorSchemes = {
    danger: {
      headerBg: '#fef2f2',
      headerText: '#dc2626',
      iconColor: '#dc2626',
      confirmButton: 'p-button-danger'
    },
    warning: {
      headerBg: '#fffbeb',
      headerText: '#d97706',
      iconColor: '#d97706',
      confirmButton: 'p-button-warning'
    },
    info: {
      headerBg: '#eff6ff',
      headerText: '#2563eb',
      iconColor: '#2563eb',
      confirmButton: 'p-button-info'
    },
    success: {
      headerBg: '#f0fdf4',
      headerText: '#16a34a',
      iconColor: '#16a34a',
      confirmButton: 'p-button-success'
    }
  };

  const scheme = colorSchemes[severity];

  const headerTemplate = () => (
    <div 
      className="flex align-items-center gap-3 p-3 border-round-top"
      style={{ 
        backgroundColor: scheme.headerBg,
        color: scheme.headerText,
        margin: '-1.5rem -1.5rem 0 -1.5rem'
      }}
    >
      <i 
        className={displayIcon}
        style={{ 
          fontSize: '1.5rem',
          color: scheme.iconColor
        }}
      />
      <h3 className="m-0 font-semibold">{title}</h3>
    </div>
  );

  const footerTemplate = () => (
    <div className="flex justify-content-end gap-2">
      <Button
        label={cancelLabel}
        icon="pi pi-times"
        className="p-button-outlined"
        onClick={onHide}
        disabled={loading}
      />
      <Button
        label={confirmLabel}
        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
        className={scheme.confirmButton}
        onClick={onConfirm}
        loading={loading}
        disabled={loading}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={headerTemplate}
      footer={footerTemplate}
      modal
      closable={!loading}
      className="w-full max-w-md"
      style={{ width: '90vw', maxWidth: '400px' }}
      draggable={false}
      resizable={false}
    >
      <div className="pt-4 pb-2">
        <p className="text-gray-700 line-height-3 m-0 text-center">
          {message}
        </p>
      </div>
    </Dialog>
  );
};

export default ConfirmationModal;