import React from "react";
import { Card as ShadcnCard } from "../card";
import { cn } from "@/lib/utils";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  shadow?: "none" | "sm" | "md" | "lg" | "xl";
  rounded?: boolean;
  hover?: boolean;
  border?: boolean;
  onClick?: () => void;
}

const shadowClasses = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
};

const paddingClasses = {
  none: "p-0",
  sm: "p-3",
  md: "p-6",
  lg: "p-8",
  xl: "p-12",
};

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  padding = "md",
  shadow = "sm",
  rounded = true,
  hover = false,
  border = true,
  onClick,
}) => {
  return (
    <ShadcnCard
      onClick={onClick}
      hover={hover}
      className={cn(
        !border && "border-0 shadow-none",
        rounded && "rounded-xl",
        shadowClasses[shadow],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </ShadcnCard>
  );
};
