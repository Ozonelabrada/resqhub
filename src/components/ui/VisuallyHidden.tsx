import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Visually hidden component for accessibility
 * Hides content visually while keeping it available to screen readers
 */
const VisuallyHidden = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute size-px overflow-hidden whitespace-nowrap border-0 p-0",
      className
    )}
    style={{
      clipPath: "inset(50%)",
    }}
    {...props}
  />
))

VisuallyHidden.displayName = "VisuallyHidden"

export { VisuallyHidden }
