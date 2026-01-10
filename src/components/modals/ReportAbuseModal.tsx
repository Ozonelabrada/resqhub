import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  Button,
  Textarea,
  Spinner,
  ShadcnSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { ShieldAlert, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReportAbuseModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string | number;
  targetType: 'report' | 'comment';
}

const ReportAbuseModal: React.FC<ReportAbuseModalProps> = ({ 
  isOpen, 
  onClose, 
  targetId, 
  targetType 
}) => {
  const [reason, setReason] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(`Reported ${targetType} ${targetId} for ${reason}: ${details}`);
      setIsSuccess(true);
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setDetails('');
    setIsSuccess(false);
    onClose();
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[400px] p-8 rounded-[2.5rem] bg-white border-none text-center">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900 mb-2">Report Submitted</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Thank you for helping keep our community safe. Our moderators will review this shortly.
            </DialogDescription>
            <Button 
              onClick={handleClose}
              className="mt-8 w-full bg-teal-600 hover:bg-teal-700 text-white font-black h-12 rounded-xl"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 rounded-[2.5rem] bg-white border-none overflow-hidden">
        <DialogHeader className="p-8 pb-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-orange-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Report Content</DialogTitle>
          </div>
          <DialogDescription className="text-slate-500 font-medium">
            Help us understand why this {targetType} violates our community guidelines.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Reason</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-teal-500/20 font-bold bg-white">
                <SelectValue placeholder="What is the problem?" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl p-2 bg-white">
                <SelectItem value="spam" className="py-3 rounded-lg focus:bg-teal-50 focus:text-teal-700 font-bold">Spam or misleading</SelectItem>
                <SelectItem value="harassment" className="py-3 rounded-lg focus:bg-teal-50 focus:text-teal-700 font-bold">Harassment or hate speech</SelectItem>
                <SelectItem value="inappropriate" className="py-3 rounded-lg focus:bg-teal-50 focus:text-teal-700 font-bold">Inappropriate content</SelectItem>
                <SelectItem value="scam" className="py-3 rounded-lg focus:bg-teal-50 focus:text-teal-700 font-bold">Scam or fraud</SelectItem>
                <SelectItem value="other" className="py-3 rounded-lg focus:bg-teal-50 focus:text-teal-700 font-bold">Something else</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Additional Details (Optional)</label>
            <Textarea 
              placeholder="Please provide more context..."
              className="min-h-[100px] rounded-xl border-slate-200 focus:ring-teal-500/20 font-medium resize-none"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Your report is anonymous. If someone is in immediate danger, please contact local emergency services.
            </p>
          </div>
        </div>

        <DialogFooter className="p-8 pt-0 flex gap-3">
          <Button 
            variant="ghost" 
            onClick={handleClose} 
            className="flex-1 font-bold text-slate-500 h-12 rounded-xl"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-black h-12 rounded-xl shadow-lg shadow-teal-100"
          >
            {isSubmitting ? <Spinner size="sm" /> : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportAbuseModal;
