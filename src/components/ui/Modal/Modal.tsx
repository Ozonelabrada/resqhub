import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../dialog";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  // Compatibility with older version
  visible?: boolean;
  onHide?: () => void;
  
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  visible,
  onHide,
  title,
  children,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = ""
}) => {
  const open = isOpen ?? visible;
  const handleClose = onClose ?? onHide;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw] sm:max-w-[90vw]"
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose?.()}>
      <DialogContent 
        className={cn(
          "bg-white rounded-xl shadow-xl p-0 overflow-hidden outline-none",
          sizeClasses[size],
          className
        )}
        onPointerDownOutside={(e) => {
          if (!closeOnOverlayClick) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (!closeOnEscape) e.preventDefault();
        }}
      >
        {/* Custom Header if title or showCloseButton exists */}
        {(title || (showCloseButton && !handleClose)) && (
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            {title && (
              <DialogTitle className="text-xl font-bold text-slate-900 pr-4">
                {title}
              </DialogTitle>
            )}
          </div>
        )}

        <div className="p-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ModalHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <DialogHeader className={cn("mb-4 text-left", className)}>
    {children}
  </DialogHeader>
);

export const ModalBody: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={cn("py-2", className)}>
    {children}
  </div>
);

export const ModalFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <DialogFooter className={cn("mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3", className)}>
    {children}
  </DialogFooter>
);
