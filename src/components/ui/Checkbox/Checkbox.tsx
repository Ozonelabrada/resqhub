import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onCheckedChange,
  disabled = false,
  className = '',
  id,
}) => {
  return (
    <button
      id={id}
      type="button"
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      disabled={disabled}
      className={`
        w-5 h-5 rounded-lg border-2 border-slate-300 flex items-center justify-center
        transition-all duration-200 flex-shrink-0
        ${checked ? 'bg-teal-600 border-teal-600' : 'bg-white border-slate-300 hover:border-teal-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-teal-500'}
        ${className}
      `}
    >
      {checked && <Check size={16} className="text-white" strokeWidth={3} />}
    </button>
  );
};