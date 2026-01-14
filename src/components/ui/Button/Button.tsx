import React from "react";
import { Button as ShadcnButton } from "../button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      label,
      children,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantMap: Record<string, any> = {
      primary: "default",
      secondary: "secondary",
      danger: "destructive",
      outline: "outline",
      ghost: "ghost",
      link: "link",
    };

    const sizeMap: Record<string, any> = {
      sm: "sm",
      md: "default",
      lg: "lg",
      icon: "icon",
    };

    return (
      <ShadcnButton
        ref={ref}
        variant={variantMap[variant] || "default"}
        size={sizeMap[size] || "default"}
        className={cn(
          "rounded-xl font-medium transition-all duration-200",
          fullWidth && "w-full",
          loading && "cursor-not-allowed opacity-70",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {label || children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </ShadcnButton>
    );
  }
);

Button.displayName = "LegacyButton";
