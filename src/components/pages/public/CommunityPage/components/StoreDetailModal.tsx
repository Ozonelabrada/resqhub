import React from 'react';
import { Card, Button } from '@/components/ui';
import { X, Loader2, CheckCircle2, ExternalLink, MapPin, Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoreDetailModalProps {
  isOpen: boolean;
  store: any;
  storeDetail: any;
  isLoading: boolean;
  onClose: () => void;
  onActionClick: (type: 'approve' | 'reject' | 'suspend' | 'reopen') => void;
  actionMenuOpen: boolean;
  onActionMenuToggle: (open: boolean) => void;
  activeSellerSubTab: string;
}

/**
 * Modal component for displaying detailed store information
 * Includes owner profile, store stats, and action menu
 * Follows the 200-line rule by focusing on rendering only
 */
export const StoreDetailModal: React.FC<StoreDetailModalProps> = ({
  isOpen,
  store,
  storeDetail,
  isLoading,
  onClose,
  onActionClick,
  actionMenuOpen,
  onActionMenuToggle,
  activeSellerSubTab,
}) => {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-blue-400';
      case 'approved':
        return 'bg-emerald-400';
      case 'denied':
        return 'bg-rose-400';
      case 'suspended':
        return 'bg-amber-400';
      default:
        return 'bg-slate-400';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-blue-100 text-blue-700';
      case 'approved':
        return 'bg-emerald-100 text-emerald-700';
      case 'denied':
        return 'bg-rose-100 text-rose-700';
      case 'suspended':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-3xl rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto bg-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
        >
          <X size={20} className="text-slate-600" />
        </button>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-emerald-600" size={48} />
          </div>
        ) : storeDetail ? (
          <>
            {/* Store Header */}
            <div className="mb-8">
              <div className="flex items-start gap-6 mb-6">
                {storeDetail.storeProfileUrl ? (
                  <img
                    src={storeDetail.storeProfileUrl}
                    alt={storeDetail.storeName}
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div
                    className={cn(
                      'w-24 h-24 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg',
                      getStatusColor(activeSellerSubTab)
                    )}
                  >
                    {storeDetail.storeName?.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">
                    {storeDetail.storeName}
                  </h2>
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className={cn('px-3 py-1 rounded-lg font-black uppercase text-xs', getStatusBadgeColor(storeDetail.status))}>
                      {storeDetail.status}
                    </span>
                    {storeDetail.isStoreVerified && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-black uppercase text-xs flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Verified
                      </span>
                    )}

                    {/* Import StoreActionMenu here */}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{storeDetail.storeDescription}</p>
                </div>
              </div>

              {/* Store Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <StatCard label="Items" value={storeDetail.storeItemsCount || 0} />
                <StatCard label="Rating" value={`⭐ ${storeDetail.storeRate || '0.0'}`} />
                <StatCard label="Store ID" value={`#${storeDetail.storeId}`} />
              </div>

              {/* Store Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DetailCard icon={<MapPin size={16} />} label="Location" value={storeDetail.location} />
                <DetailCard icon={<Mail size={16} />} label="Contact" value={storeDetail.storeContactInfo} />
                <DetailCard label="Community" value={storeDetail.communityName} isWide />
                {storeDetail.businessPermitUrl && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Business Permit</p>
                    <a href={storeDetail.businessPermitUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline">
                      View Permit →
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Section */}
            <OwnerCard storeDetail={storeDetail} />

            {/* Close Button */}
            <div className="mt-8">
              <Button onClick={onClose} className="w-full h-12 bg-slate-100 hover:bg-slate-150 text-slate-700 font-bold rounded-lg uppercase tracking-wide transition-all border border-slate-200">
                Close
              </Button>
            </div>
          </>
        ) : null}
      </Card>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-black text-slate-900">{value}</p>
  </div>
);

interface DetailCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
  isWide?: boolean;
}

const DetailCard: React.FC<DetailCardProps> = ({ icon, label, value, isWide }) => (
  <div className={cn('p-4 bg-slate-50 rounded-2xl border border-slate-100', isWide && 'md:col-span-2')}>
    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
      {icon && <span className="text-slate-400">{icon}</span>}
      {value}
    </p>
  </div>
);

interface OwnerCardProps {
  storeDetail: any;
}

const OwnerCard: React.FC<OwnerCardProps> = ({ storeDetail }) => (
  <div className="border-t border-slate-200 pt-8">
    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6">Store Owner</h3>

    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-[2.5rem] overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-6">
          {storeDetail.ownerProfilePictureUrl ? (
            <img src={storeDetail.ownerProfilePictureUrl} alt={storeDetail.ownerName} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center font-black text-2xl text-white shadow-lg flex-shrink-0">
              {storeDetail.ownerName?.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1">{storeDetail.ownerName}</h4>

            <div className="space-y-2">
              <ContactItem icon={<Mail size={16} />} label="email" value={storeDetail.ownerEmail} color="blue" />
              {storeDetail.ownerPhoneNumber && <ContactItem icon={<Phone size={16} />} label="phone" value={storeDetail.ownerPhoneNumber} color="green" />}
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

interface ContactItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green';
}

const ContactItem: React.FC<ContactItemProps> = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100">
    <span className={cn('flex-shrink-0', color === 'blue' ? 'text-blue-600' : 'text-green-600')}>{icon}</span>
    <span className="text-sm font-bold text-slate-900 truncate">{value}</span>
  </div>
);
