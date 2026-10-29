import { useState } from "react";

interface Slice {
  label: string;
  value: number;
}

const COLORS = [
  "#1B96FF", "#04844B", "#E3066A", "#FF6B2B", "#7526E5",
  "#0EB58C", "#FE5C4C", "#3A7AF2", "#B7560E", "#27AAE1",
] as const;

function fmtCurrency(v: number): string {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(1)}k`;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const span = endAngle - startAngle;
  if (span >= 359.99) {
    const m = polarToCartesian(cx, cy, r, startAngle);
    const h = polarToCartesian(cx, cy, r, startAngle + 180);
    return [
      `M ${m.x} ${m.y}`,
      `A ${r} ${r} 0 1 1 ${h.x} ${h.y}`,
      `A ${r} ${r} 0 1 1 ${m.x} ${m.y}`,
      "Z",
    ].join(" ");
  }
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const large = span > 180 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${s.x} ${s.y}`,
    `A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`,
    "Z",
  ].join(" ");
}

export function ValuePieChart({ data }: { data: Slice[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        Nenhum dado de valor encontrado.
      </p>
    );
  }

  const total = data.reduce((acc, d) => acc + d.value, 0);
  if (total <= 0) return null;

  const cx = 140;
  const cy = 140;
  const r = 120;
  const rHover = 128;

  let cumAngle = 0;
  const slices = data.map((d, i) => {
    const pct = d.value / total;
    const startAngle = cumAngle;
    const sweepAngle = pct * 360;
    cumAngle += sweepAngle;
    return {
      ...d,
      pct,
      startAngle,
      sweepAngle,
      color: COLORS[i % COLORS.length],
    };
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
      {/* Pie */}
      <svg
        viewBox="0 0 280 280"
        className="w-full max-w-[220px] shrink-0"
        role="img"
        aria-label={`Gráfico de pizza: ${data.map((d) => `${d.label} ${fmtCurrency(d.value)}`).join(", ")}`}
      >
        {slices.map((s, i) => {
          const isHovered = hovered === i;
          const radius = isHovered ? rHover : r;
          return (
            <path
              key={s.label}
              d={arcPath(cx, cy, radius, s.startAngle, s.startAngle + s.sweepAngle)}
              fill={s.color}
              opacity={hovered !== null && !isHovered ? 0.45 : 1}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {slices.map((s, i) => {
          const isHovered = hovered === i;
          return (
            <div
              key={s.label}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors ${isHovered ? "bg-white/5" : ""}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-sm"
                style={{ backgroundColor: s.color }}
              />
              <span className="min-w-0 flex-1 truncate text-sm text-gray-300">
                {s.label}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-gray-400">
                {fmtCurrency(s.value)}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-gray-500">
                {(s.pct * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
