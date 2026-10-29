import { useState, useEffect, useCallback, useMemo } from "react";
import { dashboardApi, type MonthDetail } from "@/lib/api";

interface MonthlyCountData {
  mes: string;
  total: number;
}

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  if (points.length === 2)
    return `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)} L${points[1].x.toFixed(1)},${points[1].y.toFixed(1)}`;

  const t = 0.25;
  let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) * t;
    const cp1y = p1.y + (p2.y - p0.y) * t;
    const cp2x = p2.x - (p3.x - p1.x) * t;
    const cp2y = p2.y - (p3.y - p1.y) * t;

    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  return d;
}

function isPeak(values: number[], i: number): boolean {
  const prev = values[i - 1] ?? 0;
  const next = values[i + 1] ?? 0;
  return values[i] > prev && values[i] >= next;
}

function parseMonthLabel(mes: string): { ano: string; mesNum: number } | null {
  const match = mes.match(/^(\w+)\/(\d{2})$/);
  if (!match) return null;
  const idx = MONTH_NAMES.findIndex(
    (m) => m.toLowerCase() === match[1].toLowerCase(),
  );
  if (idx < 0) return null;
  return { ano: "20" + match[2], mesNum: idx + 1 };
}

/* ------------------------------------------------------------------ */
/*  Month/Year selector                                                */
/* ------------------------------------------------------------------ */

function MonthYearSelector({
  years,
  monthsForYear,
  selectedAno,
  selectedMes,
  onSelect,
  onBack,
}: {
  years: string[];
  monthsForYear: (ano: string) => { mesNum: number; label: string; total: number }[];
  selectedAno: string | null;
  selectedMes: number | null;
  onSelect: (ano: string, mesNum: number) => void;
  onBack: () => void;
}) {
  const [activeYear, setActiveYear] = useState(selectedAno ?? years[years.length - 1]);
  const months = monthsForYear(activeYear);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg border border-gray-500/40 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-blue-base/40 hover:text-gray-100"
        >
          <span className="text-base leading-none">&larr;</span>
          Voltar
        </button>
        <span className="text-xs text-gray-400">Selecione o mês</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {years.map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => setActiveYear(y)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeYear === y
                ? "bg-blue-base/20 text-blue-base"
                : "text-gray-400 hover:bg-gray-500/10 hover:text-gray-200"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {MONTH_NAMES.map((name, idx) => {
          const mesNum = idx + 1;
          const found = months.find((m) => m.mesNum === mesNum);
          const isSelected = selectedAno === activeYear && selectedMes === mesNum;

          return (
            <button
              key={mesNum}
              type="button"
              disabled={!found}
              onClick={() => found && onSelect(activeYear, mesNum)}
              className={`relative flex flex-col items-center rounded-lg px-2 py-2.5 text-xs transition-colors ${
                isSelected
                  ? "bg-blue-base/20 text-blue-base ring-1 ring-blue-base/40"
                  : found
                    ? "border border-gray-500/20 text-gray-300 hover:border-blue-base/30 hover:bg-blue-base/5 hover:text-gray-100"
                    : "cursor-not-allowed text-gray-600/30"
              }`}
            >
              <span className="font-semibold">{name}</span>
              {found && (
                <span className="mt-0.5 tabular-nums text-[10px] opacity-70">
                  {found.total}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Area chart (monthly overview)                                      */
/* ------------------------------------------------------------------ */

function AreaChart({
  data,
  onPointClick,
}: {
  data: MonthlyCountData[];
  onPointClick: (mes: string) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const W = 580;
  const H = 240;
  const PL = 44;
  const PR = 20;
  const PT = 32;
  const PB = 40;
  const cw = W - PL - PR;
  const ch = H - PT - PB;

  const labelStep =
    data.length > 24 ? 6 : data.length > 12 ? 3 : data.length > 6 ? 2 : 1;

  const nTicks = 4;
  const tickStep = Math.ceil(maxVal / nTicks) || 1;
  const ticks = Array.from({ length: nTicks + 1 }, (_, i) => i * tickStep);
  const yMax = ticks[ticks.length - 1] || 1;
  const baseline = PT + ch;

  const pts = data.map((d, i) => ({
    x: PL + (data.length === 1 ? cw / 2 : (i / (data.length - 1)) * cw),
    y: PT + ch - (d.total / yMax) * ch,
    ...d,
  }));

  const curve = smoothPath(pts);
  const areaPath =
    curve +
    ` L${pts[pts.length - 1].x.toFixed(1)},${baseline.toFixed(1)} L${pts[0].x.toFixed(1)},${baseline.toFixed(1)} Z`;

  const totals = data.map((d) => d.total);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      onMouseLeave={() => setHovered(null)}
    >
      <defs>
        <linearGradient id="proc-area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B96FF" stopOpacity="0.18" />
          <stop offset="60%" stopColor="#0EB58C" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#0EB58C" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="proc-line-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1B96FF" />
          <stop offset="100%" stopColor="#0EB58C" />
        </linearGradient>
      </defs>

      {ticks.map((t, idx) => {
        const y = PT + ch - (t / yMax) * ch;
        return (
          <g key={t}>
            <line
              x1={PL} y1={y} x2={W - PR} y2={y}
              stroke="var(--c-border-light)"
              strokeWidth={idx === 0 ? "0.8" : "0.4"}
              strokeDasharray={idx === 0 ? undefined : "4,4"}
              opacity={idx === 0 ? 1 : 0.5}
            />
            <text x={PL - 10} y={y + 3.5} textAnchor="end" fill="var(--c-gray-400)" fontSize="9" fontFamily="inherit">
              {t}
            </text>
          </g>
        );
      })}

      <path d={areaPath} fill="url(#proc-area-fill)" />
      <path d={curve} fill="none" stroke="url(#proc-line-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {hovered !== null && (
        <line
          x1={pts[hovered].x} y1={PT} x2={pts[hovered].x} y2={baseline}
          stroke="var(--c-gray-400)" strokeWidth="0.6" strokeDasharray="3,3" opacity="0.5"
        />
      )}

      {pts.map((p, i) => {
        const peak = isPeak(totals, i);
        const isActive = hovered === i;
        const showVal = isActive || i === 0 || i === pts.length - 1 || peak;
        const hitW = cw / data.length;

        return (
          <g key={i}>
            <rect
              x={p.x - hitW / 2} y={PT} width={hitW} height={ch + PB}
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
              onClick={() => onPointClick(p.mes)}
              style={{ cursor: "pointer" }}
            />
            <circle
              cx={p.x} cy={p.y}
              r={isActive ? 4.5 : showVal ? 3 : 1.5}
              fill={isActive || showVal ? "#fff" : "#1B96FF"}
              stroke={isActive ? "#0EB58C" : showVal ? "#1B96FF" : "none"}
              strokeWidth={isActive ? 2.5 : showVal ? 2 : 0}
              style={{ transition: "r 0.15s", pointerEvents: "none" }}
            />
            {showVal && (
              <text
                x={p.x} y={p.y - 10} textAnchor="middle"
                fill={isActive ? "var(--c-gray-100)" : "var(--c-gray-400)"}
                fontSize={isActive ? "9" : "8"} fontWeight={isActive ? "600" : "500"}
                fontFamily="inherit" style={{ pointerEvents: "none" }}
              >
                {p.total}
              </text>
            )}
            {(i % labelStep === 0 || isActive) && (
              <text
                x={p.x} y={H - 10} textAnchor="middle"
                fill={isActive ? "var(--c-gray-100)" : "var(--c-gray-400)"}
                fontSize="8.5" fontWeight={isActive ? "600" : "400"} fontFamily="inherit"
              >
                {p.mes}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Status breakdown chart                                             */
/* ------------------------------------------------------------------ */

const STATUS_COLORS: Record<string, string> = {
  "TRAMITANDO JUDICIAL": "#1B96FF",
  "ARQUIVO MORTO": "#6B7280",
  "RECEBIDA": "#0EB58C",
  "RECEBIDO": "#0EB58C",
  "PENDENTE": "#F59E0B",
  "EM ANÁLISE": "#8B5CF6",
  "EM ANDAMENTO": "#3B82F6",
  "ENCERRADO": "#10B981",
  "ABERTO": "#06B6D4",
};

function getStatusColor(status: string, idx: number): string {
  const upper = status.toUpperCase();
  for (const [key, color] of Object.entries(STATUS_COLORS)) {
    if (upper.includes(key)) return color;
  }
  const fallback = ["#1B96FF", "#0EB58C", "#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4", "#F97316", "#6366F1"];
  return fallback[idx % fallback.length];
}

function StatusChart({ porStatus, total }: { porStatus: Record<string, number>; total: number }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const entries = Object.entries(porStatus);

  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        Sem dados de status para este mês
      </p>
    );
  }

  const maxVal = Math.max(...entries.map(([, v]) => v), 1);
  const W = 580;
  const barH = 28;
  const gap = 6;
  const PL = 8;
  const PR = 50;
  const PT = 8;
  const labelW = 180;
  const chartW = W - PL - PR - labelW;
  const H = PT + entries.length * (barH + gap) - gap + 8;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      onMouseLeave={() => setHovered(null)}
    >
      {entries.map(([status, count], i) => {
        const y = PT + i * (barH + gap);
        const bw = Math.max((count / maxVal) * chartW, 4);
        const isActive = hovered === i;
        const color = getStatusColor(status, i);
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <g
            key={status}
            onMouseEnter={() => setHovered(i)}
            style={{ cursor: "pointer" }}
          >
            <rect x={PL} y={y} width={W - PL} height={barH} fill="transparent" />

            {/* Status label */}
            <text
              x={PL + 4} y={y + barH / 2 + 1}
              dominantBaseline="middle"
              fill={isActive ? "var(--c-gray-100)" : "var(--c-gray-300)"}
              fontSize="10" fontWeight={isActive ? "600" : "500"} fontFamily="inherit"
            >
              {status.length > 24 ? status.slice(0, 22) + "…" : status}
            </text>

            {/* Bar */}
            <rect
              x={PL + labelW} y={y + 4} width={bw} height={barH - 8}
              rx="4"
              fill={color}
              opacity={isActive ? 1 : 0.7}
              style={{ transition: "opacity 0.15s, width 0.3s" }}
            />

            {/* Count + percentage */}
            <text
              x={PL + labelW + bw + 8} y={y + barH / 2 + 1}
              dominantBaseline="middle"
              fill={isActive ? "var(--c-gray-100)" : "var(--c-gray-400)"}
              fontSize="10" fontWeight={isActive ? "700" : "500"} fontFamily="inherit"
            >
              {count}
              <tspan fill="var(--c-gray-500)" fontSize="9" fontWeight="400">
                {" "}· {pct}%
              </tspan>
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

type View = "chart" | "selector" | "detail";

export function MonthlyProcessChart({ data }: { data: MonthlyCountData[] }) {
  const [view, setView] = useState<View>("chart");
  const [selectedAno, setSelectedAno] = useState<string | null>(null);
  const [selectedMes, setSelectedMes] = useState<number | null>(null);
  const [detail, setDetail] = useState<MonthDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const years = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => {
      const p = parseMonthLabel(d.mes);
      if (p) set.add(p.ano);
    });
    return Array.from(set).sort();
  }, [data]);

  const monthsForYear = useCallback(
    (ano: string) => {
      return data
        .map((d) => {
          const p = parseMonthLabel(d.mes);
          if (!p || p.ano !== ano) return null;
          return { mesNum: p.mesNum, label: d.mes, total: d.total };
        })
        .filter(Boolean) as { mesNum: number; label: string; total: number }[];
    },
    [data],
  );

  const fetchDetail = useCallback(async (ano: string, mes: number) => {
    setLoading(true);
    try {
      const result = await dashboardApi.detalhesMes(ano, mes);
      setDetail(result);
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = useCallback(
    (ano: string, mesNum: number) => {
      setSelectedAno(ano);
      setSelectedMes(mesNum);
      setView("detail");
      fetchDetail(ano, mesNum);
    },
    [fetchDetail],
  );

  const handlePointClick = useCallback(
    (mes: string) => {
      const p = parseMonthLabel(mes);
      if (p) handleSelect(p.ano, p.mesNum);
    },
    [handleSelect],
  );

  useEffect(() => {
    if (view !== "detail") setDetail(null);
  }, [view]);

  if (data.length === 0) return null;

  const selectedLabel = selectedAno && selectedMes
    ? `${MONTH_NAMES[(selectedMes - 1)] ?? ""}/${selectedAno.slice(2)}`
    : null;

  const selectedTotal = selectedLabel
    ? data.find((d) => d.mes === selectedLabel)?.total
    : undefined;

  return (
    <div className="flex flex-col gap-3">
      {/* Top bar */}
      {view === "chart" && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setView("selector")}
            className="flex items-center gap-1.5 rounded-lg border border-gray-500/30 bg-gray-500/5 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-blue-base/40 hover:text-gray-100"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Selecionar mês
          </button>
        </div>
      )}

      {view === "detail" && selectedLabel && (
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setView("chart")}
            className="flex items-center gap-1.5 rounded-lg border border-gray-500/40 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-blue-base/40 hover:text-gray-100"
          >
            <span className="text-base leading-none">&larr;</span>
            Voltar
          </button>
          <span className="text-xs font-semibold text-gray-100">
            {selectedLabel}
          </span>
          {selectedTotal != null && (
            <span className="rounded-full bg-blue-base/10 px-2.5 py-0.5 text-xs font-bold tabular-nums text-blue-base">
              {selectedTotal} processos
            </span>
          )}
        </div>
      )}

      {/* Views */}
      {view === "chart" && (
        <AreaChart data={data} onPointClick={handlePointClick} />
      )}

      {view === "selector" && (
        <MonthYearSelector
          years={years}
          monthsForYear={monthsForYear}
          selectedAno={selectedAno}
          selectedMes={selectedMes}
          onSelect={handleSelect}
          onBack={() => setView("chart")}
        />
      )}

      {view === "detail" && (
        loading ? (
          <p className="py-6 text-center text-sm text-gray-400">Carregando…</p>
        ) : detail ? (
          <StatusChart porStatus={detail.porStatus} total={detail.total} />
        ) : (
          <p className="py-6 text-center text-sm text-gray-400">
            Sem dados para este mês
          </p>
        )
      )}
    </div>
  );
}
