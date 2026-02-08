import React from 'react';
import { MoreVertical, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface StoreActionMenuProps {
  storeStatus: string;
  isLoading: boolean;
  menuOpen: boolean;
  onMenuToggle: (open: boolean) => void;
  onApprove: () => void;
  onReject: () => void;
  onSuspend: () => void;
  onReopen: () => void;
}

/**
 * Dropdown menu component for store management actions
 * Displays different actions based on store status
 * ~100 lines - follows single responsibility principle
 */
export const StoreActionMenu: React.FC<StoreActionMenuProps> = ({
  storeStatus,
  isLoading,
  menuOpen,
  onMenuToggle,
  onApprove,
  onReject,
  onSuspend,
  onReopen,
}) => {
  const statusLower = storeStatus?.toLowerCase() || '';
  const isApproveAvailable = statusLower === 'pending' || statusLower === 'rejected';
  const isRejectAvailable = statusLower === 'pending';
  const isSuspendAvailable = statusLower === 'approved';
  const isReopenAvailable = statusLower === 'suspended';

  const hasAnyActions = isApproveAvailable || isRejectAvailable || isSuspendAvailable || isReopenAvailable;

  if (!hasAnyActions) return null;

  return (
    <div className="relative">
      <button
        onClick={() => onMenuToggle(!menuOpen)}
        className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900"
        aria-label="Store actions menu"
      >
        <MoreVertical size={20} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Approve Action */}
          {isApproveAvailable && (
            <MenuButton
              icon={<CheckCircle2 size={16} />}
              label="Approve Store"
              colorClass="text-emerald-600"
              bgHover="hover:bg-emerald-50"
              onClick={() => {
                onApprove();
                onMenuToggle(false);
              }}
              disabled={isLoading}
            />
          )}

          {/* Reject Action */}
          {isRejectAvailable && (
            <MenuButton
              icon={<X size={16} />}
              label="Reject Store"
              colorClass="text-rose-600"
              bgHover="hover:bg-rose-50"
              onClick={() => {
                onReject();
                onMenuToggle(false);
              }}
              disabled={isLoading}
              showBorder={isApproveAvailable}
            />
          )}

          {/* Suspend Action */}
          {isSuspendAvailable && (
            <MenuButton
              icon={<AlertCircle size={16} />}
              label="Suspend Store"
              colorClass="text-amber-600"
              bgHover="hover:bg-amber-50"
              onClick={() => {
                onSuspend();
                onMenuToggle(false);
              }}
              disabled={isLoading}
            />
          )}

          {/* Reopen Action */}
          {isReopenAvailable && (
            <MenuButton
              icon={<CheckCircle2 size={16} />}
              label="Re-open Store"
              colorClass="text-emerald-600"
              bgHover="hover:bg-emerald-50"
              onClick={() => {
                onReopen();
                onMenuToggle(false);
              }}
              disabled={isLoading}
            />
          )}
        </div>
      )}
    </div>
  );
};

interface MenuButtonProps {
  icon: React.ReactNode;
  label: string;
  colorClass: string;
  bgHover: string;
  onClick: () => void;
  disabled: boolean;
  showBorder?: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({ icon, label, colorClass, bgHover, onClick, disabled, showBorder }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full px-4 py-2.5 text-left text-sm font-bold text-slate-900 ${bgHover} transition-colors flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed ${showBorder ? 'border-t border-slate-100' : ''}`}
  >
    <span className={colorClass}>{icon}</span>
    {label}
  </button>
);
