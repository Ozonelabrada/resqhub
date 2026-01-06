import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'teal' | 'gray' | 'white' | 'current';
}

const sizeMap = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

const colorMap = {
  teal: 'text-teal-600',
  gray: 'text-slate-600',
  white: 'text-white',
  current: 'text-current',
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = "md", color = "teal", className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex items-center justify-center", className)} {...props}>
        <Loader2 className={cn("animate-spin", sizeMap[size], colorMap[color])} />
      </div>
    )
  }
)
Spinner.displayName = "Spinner"

export { Spinner }
