import React from 'react';
import { Clock } from 'lucide-react';

interface PendingApprovalBannerProps {
  show: boolean;
}

const PendingApprovalBanner: React.FC<PendingApprovalBannerProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
        <Clock size={20} className="text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-black text-amber-900 text-sm uppercase tracking-wide mb-1">Pending Approval</h3>
        <p className="text-xs text-amber-800 leading-relaxed">
          Your membership is awaiting approval from community administrators. Some features are currently limited. You'll get full access once your membership is approved.
        </p>
      </div>
    </div>
  );
};

export default PendingApprovalBanner;
