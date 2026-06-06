import * as React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }>(
  ({ className, label, children, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="text-sm font-medium text-slate-300 mb-1.5 block">{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-slate-100 appearance-none",
            "focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
);
Select.displayName = "Select";

const SelectItem = React.forwardRef<HTMLOptionElement, React.OptionHTMLAttributes<HTMLOptionElement>>(
  ({ className, ...props }, ref) => (
    <option ref={ref} className={cn("bg-slate-800 text-slate-100", className)} {...props} />
  )
);
SelectItem.displayName = "SelectItem";

export { Select, SelectItem };
