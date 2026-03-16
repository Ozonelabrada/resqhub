import { useState, useCallback } from 'react';
import { AdminService } from '@/services';

interface CreditFormState {
  creditsToGrant?: string;
  creditValue?: string;
  creditsToDeduct?: string;
  reason?: string;
}

interface CreditHistoryState {
  userId: string | null;
  history: any;
  currentCredits: any;
  selectedPlanStats: any;
  loading: boolean;
}

export const useRiderCredits = (serviceType: string) => {
  const [creditHistoryState, setCreditHistoryState] = useState<CreditHistoryState>({
    userId: null,
    history: null,
    currentCredits: null,
    selectedPlanStats: null,
    loading: false,
  });

  const [grantForm, setGrantForm] = useState<CreditFormState>({ creditsToGrant: '', creditValue: '', reason: '' });
  const [deductForm, setDeductForm] = useState<CreditFormState>({ creditsToDeduct: '', reason: '' });
  const [error, setError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const loadCreditHistory = useCallback(async (userId: string, page: number = 1) => {
    try {
      setCreditHistoryState(prev => ({ ...prev, loading: true }));
      const history = await AdminService.getUserCreditHistory(userId, serviceType, page, 20);
      setCreditHistoryState(prev => ({
        ...prev,
        userId,
        history,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading credit history:', error);
      setCreditHistoryState(prev => ({ ...prev, loading: false }));
    }
  }, [serviceType]);

  const loadUserCurrentCredits = useCallback(async (userId: string) => {
    try {
      setCreditHistoryState(prev => ({ ...prev, loading: true }));
      const credits = await AdminService.getUserCurrentCredits(userId, serviceType);
      setCreditHistoryState(prev => ({
        ...prev,
        currentCredits: credits,
        loading: false,
      }));
      return credits;
    } catch (error) {
      console.error('Error loading user credits:', error);
      setCreditHistoryState(prev => ({ ...prev, loading: false }));
    }
  }, [serviceType]);

  const handleGrantCredits = useCallback(async (userId: string, onSuccess: () => void) => {
    setError('');
    if (!userId.trim() || !grantForm.creditsToGrant || !grantForm.creditValue) {
      setError('Please fill in all required fields');
      return false;
    }

    try {
      setModalLoading(true);
      const response = await AdminService.grantCreditsToUser({
        userId,
        serviceType,
        creditsToGrant: parseInt(grantForm.creditsToGrant || '0'),
        creditValue: parseFloat(grantForm.creditValue || '0'),
        reason: grantForm.reason || '',
      });

      if (response.succeeded) {
        await loadCreditHistory(userId);
        setGrantForm({ creditsToGrant: '', creditValue: '', reason: '' });
        onSuccess();
        return true;
      } else {
        setError(response.message || 'Failed to grant credits');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Error granting credits');
      return false;
    } finally {
      setModalLoading(false);
    }
  }, [grantForm, serviceType, loadCreditHistory]);

  const handleDeductCredits = useCallback(async (userId: string, onSuccess: () => void) => {
    setError('');
    if (!userId.trim() || !deductForm.creditsToDeduct) {
      setError('Please fill in all required fields');
      return false;
    }

    try {
      setModalLoading(true);
      const response = await AdminService.deductCreditsFromUser({
        userId,
        serviceType,
        creditsToDeduct: parseInt(deductForm.creditsToDeduct || '0'),
        reason: deductForm.reason || '',
      });

      if (response.succeeded) {
        await loadCreditHistory(userId);
        setDeductForm({ creditsToDeduct: '', reason: '' });
        onSuccess();
        return true;
      } else {
        setError(response.message || 'Failed to deduct credits');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Error deducting credits');
      return false;
    } finally {
      setModalLoading(false);
    }
  }, [deductForm, serviceType, loadCreditHistory]);

  return {
    creditHistoryState,
    grantForm,
    setGrantForm,
    deductForm,
    setDeductForm,
    error,
    setError,
    modalLoading,
    loadCreditHistory,
    loadUserCurrentCredits,
    handleGrantCredits,
    handleDeductCredits,
  };
};
