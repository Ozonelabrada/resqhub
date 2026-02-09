import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../dialog";
import { VisuallyHidden } from "../VisuallyHidden";
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
  skipExitConfirmation?: boolean;
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
  className = "",
  skipExitConfirmation = false
}) => {
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);
  const open = isOpen ?? visible;
  const handleClose = onClose ?? onHide;

  const handleOutsideClick = (e: any) => {
    if (!closeOnOverlayClick) {
      e.preventDefault();
      return;
    }
    
    // If it's the exit confirmation itself, don't show another confirmation
    if (skipExitConfirmation || title === "Confirm Exit") return;

    e.preventDefault();
    setShowExitConfirm(true);
  };

  const handleEscapeKey = (e: any) => {
    if (!closeOnEscape) {
      e.preventDefault();
      return;
    }

    if (skipExitConfirmation || title === "Confirm Exit") return;

    e.preventDefault();
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    handleClose?.();
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

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
          "bg-white rounded-xl shadow-xl p-0 overflow-y-auto max-h-[90vh] outline-none",
          sizeClasses[size],
          className
        )}
        onPointerDownOutside={handleOutsideClick}
        onEscapeKeyDown={handleEscapeKey}
      >
        {/* custom Exit Confirmation Overlay */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-white/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="max-w-xs w-full bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto animate-in scale-in duration-300">
                <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Sure to exit?</h3>
                <p className="text-sm text-slate-500">Any unsaved changes might be lost if you close this now.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={cancelExit}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmExit}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-sm font-bold text-white hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all duration-200"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dialog Title - Always required for accessibility, hidden if no title */}
        {title ? (
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <DialogTitle className="text-xl font-bold text-slate-900 pr-4">
              {title}
            </DialogTitle>
          </div>
        ) : (
          <VisuallyHidden>
            <DialogTitle>Dialog</DialogTitle>
          </VisuallyHidden>
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
