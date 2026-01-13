import React from 'react';
import { Switch } from '../../../../ui';
import { formatCurrencyPHP } from '../../../../../utils/formatter';
import type { LucideIcon } from 'lucide-react';

interface FeatureToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon?: LucideIcon;
  iconColor?: string;
  disabled?: boolean;
  premium?: boolean;
  price?: number;
}

export const FeatureToggle: React.FC<FeatureToggleProps> = ({
  label,
  description,
  checked,
  onCheckedChange,
  icon: Icon,
  iconColor = "text-slate-400",
  disabled,
  premium,
  price
}) => {
  return (
    <div className="flex items-center justify-between group">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className={iconColor} />}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="text-xs font-black text-slate-700">{label}</p>
              {premium && (
                <span className="text-[8px] bg-orange-100 text-orange-600 px-1 rounded font-black uppercase tracking-tighter">
                  Premium
                </span>
              )}
            </div>
            {price !== undefined && (
              <p className="text-[9px] font-black text-teal-600">
                {price === 0 ? 'FREE' : `+ ${formatCurrencyPHP(price)}/mo`}
              </p>
            )}
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{description}</p>
      </div>
      <Switch 
        disabled={disabled}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
};
