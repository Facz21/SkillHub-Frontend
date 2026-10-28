import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BentoCardProps {
  label?: string;
  title?: string;
  value: string | number;
  highlightText?: string;
  badge?: string;
  subtitle?: string;
  iconName?: string;
  icon?: string;
  iconColor?: string;
  iconBg?: string;
  bottomBarColor?: string;
  accentColor?: "primary" | "emerald" | "amber" | "violet" | string;
  className?: string;
}

export function BentoCard({
  label,
  title,
  value,
  highlightText,
  badge,
  subtitle,
  iconName,
  icon,
  iconColor,
  iconBg,
  bottomBarColor,
  accentColor = "primary",
  className,
}: BentoCardProps) {
  const displayLabel = title || label || "";
  const displayHighlight = badge || highlightText;
  const displayIcon = icon || iconName || "school";

  let computedIconBg = iconBg || "bg-indigo-50";
  let computedIconColor = iconColor || "text-primary";
  let computedBarColor = bottomBarColor || "bg-primary";

  if (accentColor === "emerald") {
    computedIconBg = "bg-emerald-50";
    computedIconColor = "text-emerald-600";
    computedBarColor = "bg-emerald-500";
  } else if (accentColor === "amber") {
    computedIconBg = "bg-amber-50";
    computedIconColor = "text-amber-600";
    computedBarColor = "bg-amber-500";
  } else if (accentColor === "violet") {
    computedIconBg = "bg-violet-50";
    computedIconColor = "text-secondary";
    computedBarColor = "bg-secondary";
  }

  return (
    <div
      className={twMerge(
        clsx(
          "bg-white rounded-xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow",
          className
        )
      )}
    >
      <div className="space-y-1 z-10">
        <span className="font-label-sm text-slate-500 block uppercase tracking-wide text-xs">
          {displayLabel}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </span>
          {displayHighlight && (
            <span className={clsx("font-label-md text-xs font-semibold", computedIconColor)}>
              {displayHighlight}
            </span>
          )}
        </div>
        {subtitle && <p className="font-body-sm text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>

      <div
        className={clsx(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 z-10",
          computedIconBg,
          computedIconColor
        )}
      >
        <span className="material-symbols-outlined text-[24px]">{displayIcon}</span>
      </div>

      {/* Colored accent bottom line */}
      <div
        className={clsx(
          "absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5",
          computedBarColor
        )}
      />
    </div>
  );
}

export default BentoCard;
