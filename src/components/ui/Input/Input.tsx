import React from "react";
import { Input as ShadcnInput } from "../input";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode; // Compatibility for some pages
}

export const Input: React.FC<InputProps> = ({
  className,
  error,
  label,
  helperText,
  fullWidth = true,
  leftIcon,
  rightIcon,
  icon,
  required,
  id,
  ...props
}) => {
  const displayIcon = leftIcon || icon;
  const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div className={cn("space-y-1.5", fullWidth ? "w-full" : "w-fit")}>
      {label && (
        <label 
          htmlFor={inputId}
          className="text-sm font-bold text-slate-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {displayIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {displayIcon}
          </div>
        )}
        <ShadcnInput
          id={inputId}
          className={cn(
            "rounded-xl h-11 transition-all duration-200",
            displayIcon && "pl-11",
            rightIcon && "pr-11",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs font-medium text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-slate-500 ml-1">
          {helperText}
        </p>
      )}
    </div>
  );
};
