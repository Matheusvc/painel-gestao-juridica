import { useState, useRef, useCallback } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const MONTH_ABBR = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export interface Competencia {
  mes: number;
  ano: number;
}

interface Props {
  available: Competencia[];
  selected: Competencia | null;
  onSelect: (c: Competencia | null) => void;
}

export function CompetenciaSelector({ available, selected, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(wrapRef, open, close);

  const years = [...new Set(available.map((c) => c.ano))].sort((a, b) => b - a);
  const [viewYear, setViewYear] = useState(selected?.ano ?? years[0] ?? new Date().getFullYear());

  const isAvailable = (mes: number, ano: number) =>
    available.some((c) => c.mes === mes && c.ano === ano);

  const isSelected = (mes: number, ano: number) =>
    selected?.mes === mes && selected?.ano === ano;

  const handleSelect = (mes: number, ano: number) => {
    if (isSelected(mes, ano)) {
      onSelect(null);
    } else {
      onSelect({ mes, ano });
    }
    setOpen(false);
  };

  const label = selected
    ? `${MONTH_ABBR[selected.mes - 1]}/${String(selected.ano).slice(2)}`
    : "Todas";

  const handlePrev = () => {
    if (!selected) return;
    const idx = available.findIndex((c) => c.mes === selected.mes && c.ano === selected.ano);
    if (idx > 0) {
      const prev = available[idx - 1];
      onSelect(prev);
      setViewYear(prev.ano);
    }
  };

  const handleNext = () => {
    if (!selected) return;
    const idx = available.findIndex((c) => c.mes === selected.mes && c.ano === selected.ano);
    if (idx >= 0 && idx < available.length - 1) {
      const next = available[idx + 1];
      onSelect(next);
      setViewYear(next.ano);
    }
  };

  const canPrev = selected
    ? available.findIndex((c) => c.mes === selected.mes && c.ano === selected.ano) > 0
    : false;
  const canNext = selected
    ? (() => { const idx = available.findIndex((c) => c.mes === selected.mes && c.ano === selected.ano); return idx >= 0 && idx < available.length - 1; })()
    : false;

  return (
    <div ref={wrapRef} className="relative flex items-center gap-1">
      {selected && (
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canPrev}
          className="flex size-9 items-center justify-center rounded-lg border border-gray-500/40 text-gray-400 transition-colors hover:border-blue-base/40 hover:text-gray-100 disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-500/40 bg-surface px-3 text-sm font-medium text-gray-100 transition-colors hover:border-blue-base/40 hover:bg-gray-600"
      >
        <CalendarDays size={15} className="text-blue-base" />
        <span className="font-bold">{label}</span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>

      {selected && (
        <button
          type="button"
          onClick={handleNext}
          disabled={!canNext}
          className="flex size-9 items-center justify-center rounded-lg border border-gray-500/40 text-gray-400 transition-colors hover:border-blue-base/40 hover:text-gray-100 disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border border-gray-500/60 bg-surface p-4 shadow-card-hover">
          {/* "Todas" button */}
          <button
            type="button"
            onClick={() => { onSelect(null); setOpen(false); }}
            className={`mb-3 w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
              !selected ? "bg-blue-base/15 text-blue-base" : "text-gray-400 hover:bg-gray-600/50 hover:text-gray-100"
            }`}
          >
            Todas as competências
          </button>

          {/* Year navigation */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              disabled={!years.includes(viewYear - 1)}
              className="flex size-7 items-center justify-center rounded text-gray-400 transition-colors hover:text-gray-100 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold text-gray-100">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              disabled={!years.includes(viewYear + 1)}
              className="flex size-7 items-center justify-center rounded text-gray-400 transition-colors hover:text-gray-100 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-2">
            {MONTH_NAMES.map((_name, idx) => {
              const mesNum = idx + 1;
              const avail = isAvailable(mesNum, viewYear);
              const sel = isSelected(mesNum, viewYear);
              return (
                <button
                  key={mesNum}
                  type="button"
                  disabled={!avail}
                  onClick={() => avail && handleSelect(mesNum, viewYear)}
                  className={`rounded-lg px-2 py-2 text-center text-xs font-medium transition-colors ${
                    sel
                      ? "bg-blue-base text-white shadow-sm"
                      : avail
                        ? "border border-gray-500/30 text-gray-300 hover:border-blue-base/40 hover:bg-blue-base/10 hover:text-gray-100"
                        : "cursor-not-allowed text-gray-600/30"
                  }`}
                >
                  {MONTH_ABBR[idx]}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
