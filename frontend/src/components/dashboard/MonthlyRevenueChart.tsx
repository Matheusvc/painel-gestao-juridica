import { useState } from "react";

interface MonthlyValueData {
  mes: string;
  valor: number;
}

function fmtCurrency(v: number): string {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(1)}k`;
  return `R$ ${Math.round(v)}`;
}

export function MonthlyRevenueChart({ data }: { data: MonthlyValueData[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.valor), 1);
  const W = 580;
  const H = 240;
  const PL = 60;
  const PR = 20;
  const PT = 32;
  const PB = 40;
  const cw = W - PL - PR;
  const ch = H - PT - PB;

  const bw = Math.min(22, Math.max(6, cw / data.length - 5));
  const labelStep =
    data.length > 24 ? 6 : data.length > 12 ? 3 : data.length > 6 ? 2 : 1;

  const nTicks = 4;
  const ticks = Array.from(
    { length: nTicks + 1 },
    (_, i) => (maxVal / nTicks) * i,
  );
  const baseline = PT + ch;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full cursor-crosshair"
      role="img"
      aria-label={`Valor recebido: ${data.map((d) => `${d.mes} ${fmtCurrency(d.valor)}`).join(", ")}`}
      onMouseLeave={() => setHovered(null)}
    >
      <defs>
        <linearGradient id="rev-bar-grad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#04844B" />
          <stop offset="100%" stopColor="#0EB58C" />
        </linearGradient>
        <linearGradient id="rev-bar-dim" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#04844B" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0EB58C" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {ticks.map((t, idx) => {
        const y = PT + ch - (t / maxVal) * ch;
        return (
          <g key={idx}>
            <line
              x1={PL}
              y1={y}
              x2={W - PR}
              y2={y}
              stroke="var(--c-border-light)"
              strokeWidth={idx === 0 ? "0.8" : "0.4"}
              strokeDasharray={idx === 0 ? undefined : "4,4"}
              opacity={idx === 0 ? 1 : 0.5}
            />
            <text
              x={PL - 10}
              y={y + 3.5}
              textAnchor="end"
              fill="var(--c-gray-400)"
              fontSize="8"
              fontFamily="inherit"
            >
              {fmtCurrency(t)}
            </text>
          </g>
        );
      })}

      {/* Bars + interactions */}
      {data.map((d, i) => {
        const cx = PL + ((i + 0.5) / data.length) * cw;
        const bh = Math.max((d.valor / maxVal) * ch, 2);
        const x = cx - bw / 2;
        const y = baseline - bh;
        const isActive = hovered === i;
        const isSignificant = d.valor >= maxVal * 0.3;
        const rx = Math.min(4, bw / 2);

        const hitW = cw / data.length;

        return (
          <g key={i}>
            {/* Invisible hit area */}
            <rect
              x={cx - hitW / 2}
              y={PT}
              width={hitW}
              height={ch + PB}
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
              style={{ cursor: "pointer" }}
            />

            {/* Bar */}
            <rect
              x={x}
              y={y}
              width={bw}
              height={bh}
              rx={rx}
              fill={
                isActive
                  ? "url(#rev-bar-grad)"
                  : isSignificant
                    ? "url(#rev-bar-grad)"
                    : "url(#rev-bar-dim)"
              }
              opacity={isActive ? 1 : isSignificant ? 0.85 : 0.6}
              style={{ transition: "opacity 0.15s" }}
            />

            {/* Value label */}
            {(isActive || isSignificant) && (
              <text
                x={cx}
                y={y - 8}
                textAnchor="middle"
                fill={isActive ? "var(--c-gray-100)" : "var(--c-gray-400)"}
                fontSize={isActive ? "8" : "7.5"}
                fontWeight={isActive ? "600" : "500"}
                fontFamily="inherit"
                style={{ transition: "fill 0.15s", pointerEvents: "none" }}
              >
                {fmtCurrency(d.valor)}
              </text>
            )}

            {/* X-axis label */}
            {i % labelStep === 0 && (
              <text
                x={cx}
                y={H - 10}
                textAnchor="middle"
                fill={isActive ? "var(--c-gray-100)" : "var(--c-gray-400)"}
                fontSize="8.5"
                fontWeight={isActive ? "600" : "400"}
                fontFamily="inherit"
                style={{ transition: "fill 0.15s" }}
              >
                {d.mes}
              </text>
            )}

            {/* Hover tooltip for non-labeled points */}
            {isActive && i % labelStep !== 0 && (
              <text
                x={cx}
                y={H - 10}
                textAnchor="middle"
                fill="var(--c-gray-100)"
                fontSize="8.5"
                fontWeight="600"
                fontFamily="inherit"
              >
                {d.mes}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
