import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Textarea, Button, Spinner } from '@/components/ui';
import { Minus } from 'lucide-react';

interface DeductCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  form: { creditsToDeduct?: string; reason?: string };
  onFormChange: (updates: Partial<{ creditsToDeduct: string; reason: string }>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  error: string;
}

export const DeductCreditsModal: React.FC<DeductCreditsModalProps> = ({
  open,
  onOpenChange,
  userId,
  form,
  onFormChange,
  onSubmit,
  loading,
  error,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Deduct Credits from User</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
          <Input type="text" value={userId} disabled className="bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Credits to Deduct *</label>
          <Input
            type="number"
            min="1"
            placeholder="e.g., 50"
            value={form.creditsToDeduct || ''}
            onChange={(e) => onFormChange({ creditsToDeduct: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <Textarea
            placeholder="e.g., Fraud correction, Duplicate transaction..."
            value={form.reason || ''}
            onChange={(e) => onFormChange({ reason: e.target.value })}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{(form.reason || '').length}/500</p>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !form.creditsToDeduct} 
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Spinner size="sm" /> : <Minus size={16} />}
            {loading ? 'Processing...' : 'Deduct Credits'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);
