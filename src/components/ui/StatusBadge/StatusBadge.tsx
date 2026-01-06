import React from "react";
import { Badge } from "../badge";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "resolved" | "expired" | "lost" | "found" | "reunited" | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { variant: "outline" | "default" | "secondary" | "destructive" | "success" | "warning" | "info"; label: string }> = {
      active: { variant: "success", label: "Active" },
      found: { variant: "success", label: "Found" },
      inactive: { variant: "secondary", label: "Inactive" },
      pending: { variant: "warning", label: "Pending" },
      resolved: { variant: "info", label: "Resolved" },
      reunited: { variant: "info", label: "Reunited" },
      expired: { variant: "destructive", label: "Expired" },
      lost: { variant: "destructive", label: "Lost" },
    };
    return configs[status.toLowerCase()] || { variant: "secondary", label: status };
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={config.variant as any}
      className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider", className)}
    >
      {config.label}
    </Badge>
  );
};
