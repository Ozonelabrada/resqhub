import { useState } from 'react';
import { ModalContext } from '../types/subscription';

export const useSubscriptionModals = () => {
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string; message: string } | null>(null);
  const [modalContext, setModalContext] = useState<ModalContext | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [grantForm, setGrantForm] = useState({ amount: '', reason: '' });
  const [deductForm, setDeductForm] = useState({ amount: '', reason: '' });

  const closeGrantModal = () => {
    setShowGrantModal(false);
    setModalContext(null);
    setGrantForm({ amount: '', reason: '' });
  };

  const closeDeductModal = () => {
    setShowDeductModal(false);
    setModalContext(null);
    setDeductForm({ amount: '', reason: '' });
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setModalContext(null);
  };

  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  return {
    showGrantModal,
    setShowGrantModal,
    closeGrantModal,
    showDeductModal,
    setShowDeductModal,
    closeDeductModal,
    showViewModal,
    setShowViewModal,
    closeViewModal,
    showConfirmDialog,
    setShowConfirmDialog,
    closeConfirmDialog,
    confirmAction,
    setConfirmAction,
    modalContext,
    setModalContext,
    modalLoading,
    setModalLoading,
    grantForm,
    setGrantForm,
    deductForm,
    setDeductForm,
  };
};
