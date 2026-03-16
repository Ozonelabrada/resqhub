import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Textarea, Button, Spinner } from '@/components/ui';
import { Plus } from 'lucide-react';

interface GrantCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  form: { creditsToGrant?: string; creditValue?: string; reason?: string };
  onFormChange: (updates: Partial<{ creditsToGrant: string; creditValue: string; reason: string }>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  error: string;
}

export const GrantCreditsModal: React.FC<GrantCreditsModalProps> = ({
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
        <DialogTitle>Grant Credits to User</DialogTitle>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Credits to Grant *</label>
          <Input
            type="number"
            min="1"
            placeholder="e.g., 100"
            value={form.creditsToGrant || ''}
            onChange={(e) => onFormChange({ creditsToGrant: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Credit Value (₱) *</label>
          <Input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g., 99.99"
            value={form.creditValue || ''}
            onChange={(e) => onFormChange({ creditValue: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <Textarea
            placeholder="e.g., Welcome promotion, Service recovery..."
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
            disabled={loading || !form.creditsToGrant || !form.creditValue} 
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Spinner size="sm" /> : <Plus size={16} />}
            {loading ? 'Processing...' : 'Grant Credits'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);
