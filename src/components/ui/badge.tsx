import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "active" | "pending" | "completed" | "rejected" | "default";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      completed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      rejected: "bg-red-500/15 text-red-400 border-red-500/30",
      default: "bg-slate-700 text-slate-300 border-slate-600",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
