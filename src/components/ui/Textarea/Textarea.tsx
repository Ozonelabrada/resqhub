import React from "react";
import { Textarea as ShadcnTextarea } from "../textarea";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textAreaId = id || (label ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textAreaId} className="text-sm font-bold text-slate-700 ml-1">
            {label}
          </label>
        )}
        <ShadcnTextarea
          id={textAreaId}
          ref={ref}
          className={cn(
            "resize-none rounded-xl",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs font-medium text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "LegacyTextarea";
