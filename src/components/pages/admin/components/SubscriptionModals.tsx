import React from 'react';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditHistory, UserRecord } from '../types/subscription';

interface SubscriptionModalsProps {
  showGrantModal: boolean;
  closeGrantModal: () => void;
  showDeductModal: boolean;
  closeDeductModal: () => void;
  showViewModal: boolean;
  closeViewModal: () => void;
  showConfirmDialog: boolean;
  closeConfirmDialog: () => void;
  modalContext: { userId: string; userName: string; currentCredits: number } | null;
  modalLoading: boolean;
  grantForm: { amount: string; reason: string };
  setGrantForm: (form: any) => void;
  deductForm: { amount: string; reason: string };
  setDeductForm: (form: any) => void;
  confirmAction: { type: string; id: string; message: string } | null;
  onGrantSubmit: () => void;
  onDeductSubmit: () => void;
  handleConfirm: () => void;
  historyData: CreditHistory[];
}

export const SubscriptionModals: React.FC<SubscriptionModalsProps> = ({
  showGrantModal,
  closeGrantModal,
  showDeductModal,
  closeDeductModal,
  showViewModal,
  closeViewModal,
  showConfirmDialog,
  closeConfirmDialog,
  modalContext,
  modalLoading,
  grantForm,
  setGrantForm,
  deductForm,
  setDeductForm,
  confirmAction,
  onGrantSubmit,
  onDeductSubmit,
  handleConfirm,
  historyData,
}) => {
  return (
    <>
      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Confirm Action</h3>
              <p className="text-gray-700">{confirmAction.message}</p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={closeConfirmDialog}
                  disabled={modalLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleConfirm}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Processing...' : 'Confirm'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Grant Credits Modal */}
      {showGrantModal && modalContext && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900">Grant Credits</h3>
              <button
                onClick={closeGrantModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">User: {modalContext.userName}</p>
                <p className="text-sm text-gray-600">Current Credits: {modalContext.currentCredits}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Amount</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={grantForm.amount}
                  onChange={(e) => setGrantForm({ ...grantForm, amount: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Reason</label>
                <Input
                  placeholder="Enter reason"
                  value={grantForm.reason}
                  onChange={(e) => setGrantForm({ ...grantForm, reason: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={closeGrantModal}
                  disabled={modalLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={onGrantSubmit}
                  disabled={modalLoading || !grantForm.amount}
                >
                  {modalLoading ? 'Processing...' : 'Grant'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Deduct Credits Modal */}
      {showDeductModal && modalContext && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900">Deduct Credits</h3>
              <button
                onClick={closeDeductModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">User: {modalContext.userName}</p>
                <p className="text-sm text-gray-600">Current Credits: {modalContext.currentCredits}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Amount</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={deductForm.amount}
                  onChange={(e) => setDeductForm({ ...deductForm, amount: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Reason</label>
                <Input
                  placeholder="Enter reason"
                  value={deductForm.reason}
                  onChange={(e) => setDeductForm({ ...deductForm, reason: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={closeDeductModal}
                  disabled={modalLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={onDeductSubmit}
                  disabled={modalLoading || !deductForm.amount}
                >
                  {modalLoading ? 'Processing...' : 'Deduct'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* View History Modal */}
      {showViewModal && modalContext && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Credit History</h3>
                <p className="text-sm text-gray-600">{modalContext.userName}</p>
              </div>
              <button
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              {historyData.filter(h => h.userId === modalContext.userId).map(record => (
                <div key={record.id} className="p-3 border rounded-lg hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{record.actionType}: {record.amount} credits</p>
                      <p className="text-xs text-gray-600">{record.reason}</p>
                    </div>
                    <p className="text-xs text-gray-500">{new Date(record.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {historyData.filter(h => h.userId === modalContext.userId).length === 0 && (
                <p className="text-center text-gray-500 py-4">No history available</p>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
