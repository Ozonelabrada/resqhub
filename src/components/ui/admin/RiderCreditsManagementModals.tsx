import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../dialog';
import { Button } from '../button';
import { Badge } from '../badge';
import { X, Plus, Minus, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddCreditsFormData) => Promise<void>;
  loading?: boolean;
  riderName?: string;
  currentCredits?: number;
}

interface AddCreditsFormData {
  creditCount: number;
  value: number;
  transactionType: 'purchase' | 'admin_grant' | 'promotion' | 'refund';
  notes: string;
  paymentReference?: string;
}

interface DeductCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DeductCreditsFormData) => Promise<void>;
  loading?: boolean;
  riderName?: string;
  availableCredits?: number;
}

interface DeductCreditsFormData {
  creditCount: number;
  reason: string;
}

export const AddCreditsModal: React.FC<AddCreditsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  riderName = 'Rider',
  currentCredits = 0,
}) => {
  const [creditCount, setCreditCount] = useState<number>(10);
  const [value, setValue] = useState<number>(9.99);
  const [transactionType, setTransactionType] = useState<'purchase' | 'admin_grant' | 'promotion' | 'refund'>('admin_grant');
  const [notes, setNotes] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      creditCount,
      value,
      transactionType,
      notes,
      paymentReference: paymentReference || undefined,
    });
    // Reset form
    setCreditCount(10);
    setValue(9.99);
    setTransactionType('admin_grant');
    setNotes('');
    setPaymentReference('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="text-green-600" size={24} />
            Add Credits
          </DialogTitle>
          <DialogDescription className="mt-2">
            Adding credits to <span className="font-semibold text-gray-900">{riderName}</span>
            <br />
            Current balance: <span className="font-bold text-blue-600">{currentCredits}</span> credits
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Credit Count */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Credit Count <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCreditCount(Math.max(1, creditCount - 10))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                min="1"
                value={creditCount}
                onChange={(e) => setCreditCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={() => setCreditCount(creditCount + 10)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Value (₱) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Rate: ₱{(value / creditCount).toFixed(2)} per credit
            </p>
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Transaction Type <span className="text-red-500">*</span>
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="admin_grant">Admin Grant</option>
              <option value="purchase">Purchase</option>
              <option value="promotion">Promotion</option>
              <option value="refund">Refund</option>
            </select>
          </div>

          {/* Payment Reference */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Reference (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., INV-001-2025"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              placeholder="Add any notes about this transaction..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>

          {/* Summary */}
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-gray-700">
              Will add <span className="font-bold text-green-600">{creditCount}</span> credits
              <span className="text-gray-600"> worth </span>
              <span className="font-bold text-green-600">₱{value.toFixed(2)}</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              New balance: <span className="font-semibold">{currentCredits + creditCount}</span> credits
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || creditCount <= 0 || value <= 0}
              className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
            >
              <Plus size={16} />
              {loading ? 'Adding...' : 'Add Credits'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const DeductCreditsModal: React.FC<DeductCreditsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  riderName = 'Rider',
  availableCredits = 0,
}) => {
  const [creditCount, setCreditCount] = useState<number>(1);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      creditCount,
      reason,
    });
    // Reset form
    setCreditCount(1);
    setReason('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Minus className="text-red-600" size={24} />
            Deduct Credits
          </DialogTitle>
          <DialogDescription className="mt-2">
            Deducting credits from <span className="font-semibold text-gray-900">{riderName}</span>
            <br />
            Available balance: <span className="font-bold text-blue-600">{availableCredits}</span> credits
          </DialogDescription>
        </DialogHeader>

        {availableCredits <= 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={18} />
            <p className="text-sm text-yellow-800">This rider has no credits available to deduct.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Credit Count */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Credits to Deduct <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCreditCount(Math.max(1, creditCount - 1))}
                disabled={creditCount <= 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                min="1"
                max={availableCredits}
                value={creditCount}
                onChange={(e) => setCreditCount(Math.min(availableCredits, Math.max(1, parseInt(e.target.value) || 1)))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={() => setCreditCount(Math.min(availableCredits, creditCount + 1))}
                disabled={creditCount >= availableCredits}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <Plus size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Available: {availableCredits} credits
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="e.g., Adjustment for booking cancellation, Manual correction, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">This will be recorded in the audit trail.</p>
          </div>

          {/* Summary */}
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-gray-700">
              Will deduct <span className="font-bold text-red-600">{creditCount}</span> credits
            </p>
            <p className="text-xs text-gray-600 mt-1">
              New balance: <span className="font-semibold">{Math.max(0, availableCredits - creditCount)}</span> credits
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || creditCount <= 0 || !reason.trim() || availableCredits <= 0}
              className="flex-1 bg-red-600 hover:bg-red-700 gap-2"
            >
              <Minus size={16} />
              {loading ? 'Deducting...' : 'Deduct Credits'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const UpdateFreeTierModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { isFree: boolean; notes: string }) => Promise<void>;
  loading?: boolean;
  riderName?: string;
  currentStatus?: boolean;
}> = ({ isOpen, onClose, onSubmit, loading = false, riderName = 'Rider', currentStatus = false }) => {
  const [isFree, setIsFree] = useState(currentStatus);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ isFree, notes });
    setNotes('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Rider Tier</DialogTitle>
          <DialogDescription className="mt-2">
            Change <span className="font-semibold text-gray-900">{riderName}</span>'s subscription tier
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tier Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all"
              style={{ borderColor: !isFree ? '#0891b2' : '#e5e7eb' }}>
              <input
                type="radio"
                checked={!isFree}
                onChange={() => setIsFree(false)}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Paid Tier</p>
                <p className="text-xs text-gray-600">Requires credits for bookings</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Credits Required</Badge>
            </label>

            <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all"
              style={{ borderColor: isFree ? '#10b981' : '#e5e7eb' }}>
              <input
                type="radio"
                checked={isFree}
                onChange={() => setIsFree(true)}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Free Tier</p>
                <p className="text-xs text-gray-600">Unlimited bookings, no credits needed</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Unlimited</Badge>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason for Change (Optional)
            </label>
            <textarea
              placeholder="e.g., Upgraded to paid subscription, Promotion offer, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>

          {/* Info Box */}
          <div className={cn(
            'p-3 rounded-lg',
            isFree ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
          )}>
            <p className={cn('text-sm', isFree ? 'text-green-800' : 'text-blue-800')}>
              {isFree
                ? '✓ This rider will have unlimited bookings'
                : '✓ This rider will need credits to accept bookings'
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || isFree === currentStatus}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {loading ? 'Updating...' : 'Update Tier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
