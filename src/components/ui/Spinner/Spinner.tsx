import React from "react";
import { Spinner as ShadcnSpinner } from "../spinner";
import { cn } from "@/lib/utils";

export interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "teal" | "gray" | "white" | "current";
  variant?: "primary" | "secondary" | "teal" | "gray" | "white" | "current" | string;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  color = "teal",
  variant,
  className = "",
  showLabel = false,
  label = "Loading...",
}) => {
  const finalColor = variant || color;
  return (
    <div className={cn("inline-flex flex-col items-center justify-center gap-2", className)}>
      <ShadcnSpinner size={size} color={finalColor as any} />
      {showLabel && label && (
        <span className="text-sm font-medium text-slate-500 animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
};
