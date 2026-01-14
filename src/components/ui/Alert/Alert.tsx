import React from "react";
import { Alert as ShadcnAlert, AlertTitle, AlertDescription } from "../alert";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export interface AlertProps {
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  message?: string;
  children?: React.ReactNode;
  variant?: "success" | "error" | "warning" | "info" | "destructive" | "danger";
  onClose?: () => void;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export const Alert: React.FC<AlertProps> = ({
  type,
  variant,
  title,
  message,
  children,
  onClose,
  className = "",
  showIcon = true,
  size = "md",
}) => {
  const alertType = type || (variant === "error" || variant === "destructive" || variant === "danger" ? "error" : variant) || "info";
  const Icon = icons[alertType as keyof typeof icons] || icons.info;

  return (
    <ShadcnAlert
      variant={alertType === "error" ? "destructive" : alertType as any}
      className={cn(
        "rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300",
        size === "sm" && "py-2 px-3",
        size === "lg" && "py-5 px-6",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {showIcon && Icon && (
          <Icon className={cn("h-5 w-5 shrink-0 transition-colors", 
            alertType === "success" && "text-emerald-600",
            alertType === "error" && "text-red-600",
            alertType === "warning" && "text-orange-600",
            alertType === "info" && "text-teal-600"
          )} />
        )}
        <div className="flex-1">
          {title && <AlertTitle className="font-bold text-slate-800">{title}</AlertTitle>}
          {message && <AlertDescription className="text-slate-600">{message}</AlertDescription>}
          {children}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </ShadcnAlert>
  );
};
