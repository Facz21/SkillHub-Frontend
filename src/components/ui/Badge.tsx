import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "available" | "low" | "full" | "category" | "primary" | "neutral";
  pulse?: boolean;
}

export function Badge({
  children,
  className,
  variant = "neutral",
  pulse = false,
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-badge-caps text-badge-caps uppercase tracking-wider shadow-sm select-none";

  const variants = {
    available: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    low: "bg-amber-50 text-amber-700 border border-amber-200/60",
    full: "bg-rose-50 text-rose-700 border border-rose-200/60",
    category: "bg-surface-container-lowest/90 backdrop-blur-md text-slate-800 border border-slate-200/60",
    primary: "bg-indigo-50 text-indigo-700 border border-indigo-200/60",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200",
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], className))} {...props}>
      {pulse && (
        <span
          className={clsx(
            "w-1.5 h-1.5 rounded-full mr-0.5",
            variant === "available"
              ? "bg-emerald-500 animate-pulse"
              : variant === "low"
              ? "bg-amber-500 animate-ping"
              : "bg-rose-500"
          )}
        />
      )}
      {children}
    </span>
  );
}
