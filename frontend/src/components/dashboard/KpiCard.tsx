import type { CSSProperties } from "react";

export function KpiCard({
  label,
  value,
  className,
  style,
}: {
  label: string;
  value: number | string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <article
      style={style}
      className={`flex flex-col gap-3 rounded-2xl border border-gray-500/60 bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-base/30 hover:shadow-card-hover ${className ?? ""}`}
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <span className="text-3xl font-bold leading-none tabular-nums text-gray-100">
        {value}
      </span>
    </article>
  );
}
