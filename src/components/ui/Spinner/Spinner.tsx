import React from "react";
import { Spinner as ShadcnSpinner } from "../spinner";
import { cn } from "@/lib/utils";

export interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "blue" | "gray" | "white" | "current";
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  color = "blue",
  className = "",
  showLabel = false,
  label = "Loading...",
}) => {
  return (
    <div className={cn("inline-flex flex-col items-center justify-center gap-2", className)}>
      <ShadcnSpinner size={size} color={color} />
      {showLabel && label && (
        <span className="text-sm font-medium text-slate-500 animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
};
