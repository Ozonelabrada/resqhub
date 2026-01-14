import React from "react";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | number | any;
  onChange?: (value: any) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  helperText?: string;
  className?: string;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  id?: string;
  leftIcon?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  error,
  disabled = false,
  required = false,
  label,
  helperText,
  className = "",
  fullWidth = true,
  size = "md",
  id,
  leftIcon
}) => {
  return (
    <div className={cn("space-y-2", fullWidth ? "w-full" : "w-fit")} id={id}>
      {label && (
        <label className="text-sm font-bold text-slate-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <ShadcnSelect 
          value={value !== undefined && value !== null && value !== "" ? value.toString() : undefined} 
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger 
            className={cn(
              "rounded-xl border-slate-200 bg-white",
              size === "sm" && "h-9 text-xs",
              size === "lg" && "h-14 text-lg",
              size === "md" && "h-11",
              error && "border-red-500 ring-red-500",
              leftIcon && "pl-11",
              className
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200 shadow-xl">
            {options.map((option) => (
              <SelectItem 
                key={option.value?.toString() || Math.random().toString()} 
                value={option.value !== undefined && option.value !== null && option.value !== "" 
                  ? option.value.toString() 
                  : "none"
                }
                disabled={option.disabled}
                className="rounded-lg focus:bg-teal-50 focus:text-teal-600 cursor-pointer"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </ShadcnSelect>
      </div>

      {helperText && !error && (
        <p className="text-[11px] font-medium text-slate-500">{helperText}</p>
      )}

      {error && (
        <p className="text-[11px] font-bold text-red-500">{error}</p>
      )}
    </div>
  );
};
