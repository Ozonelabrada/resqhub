import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Card, Button } from '@/components/ui';

interface ViewCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
}

export const ViewCreditsModal: React.FC<ViewCreditsModalProps> = ({ open, onOpenChange, data }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>User's Current Available Credits</DialogTitle>
      </DialogHeader>
      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-sm text-gray-600">Total Available</p>
              <p className="text-2xl font-bold text-teal-600">{data.summary.totalAvailableCredits}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Active Allocations</p>
              <p className="text-2xl font-bold text-blue-600">{data.summary.activeAllocations}</p>
            </Card>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Allocation Breakdown</h4>
            <div className="space-y-2">
              {data.allocations.map((allocation: any) => (
                <Card key={allocation.allocationId} className="p-4 border-l-4 border-teal-500">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900">Allocation #{allocation.allocationId}</span>
                    <span className="text-sm font-bold text-teal-600">{allocation.creditsRemaining} credits</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full"
                      style={{ width: `${allocation.percentageUsed}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Used: {allocation.creditsUsed}</span>
                    <span>Progress: {allocation.percentageUsed.toFixed(1)}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Expires: {new Date(allocation.expiresAt).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
      <DialogFooter>
        <Button onClick={() => onOpenChange(false)}>Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
