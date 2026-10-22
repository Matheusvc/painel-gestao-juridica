export interface ProcessSegment {
  label: string;
  value: number;
  /** Cor da coluna (hex). */
  color: string;
}

interface ProcessStatusChartProps {
  segments: ProcessSegment[];
  /** Rótulo acessível do gráfico como um todo. */
  ariaLabel: string;
}

/** Altura máxima da coluna mais alta (px) — deixa ar acima para o rótulo. */
const MAX_BAR = 136;
/** Piso de altura (px) para valores pequenos continuarem visíveis/clicáveis. */
const MIN_BAR = 6;

/**
 * Processos por status em colunas verticais — uma barra por status, crescendo
 * de uma linha de base comum (identidade por rótulo + cor; valor sempre
 * rotulado diretamente, nunca só por cor ou só no hover).
 */
export function ProcessStatusChart({ segments, ariaLabel }: ProcessStatusChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const max = Math.max(...segments.map((s) => s.value), 1);

  return (
    <div>
      <ul
        className="flex items-end justify-between gap-2 border-b border-gray-500/60 sm:gap-4"
        role="img"
        aria-label={ariaLabel}
      >
        {segments.map((s) => {
          const pct = Math.round((s.value / total) * 100);
          const barHeight = s.value > 0 ? Math.max((s.value / max) * MAX_BAR, MIN_BAR) : 0;
          return (
            <li key={s.label} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-sm font-bold leading-none tabular-nums text-gray-100">
                {s.value}
              </span>
              <div
                tabIndex={0}
                title={`${s.label}: ${s.value} (${pct}%)`}
                className="w-5 rounded-t-md outline-none transition-[filter,transform] duration-150 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-blue-base focus-visible:ring-offset-2 sm:w-6"
                style={{ height: barHeight, backgroundColor: s.color }}
              />
            </li>
          );
        })}
      </ul>

      <ul className="mt-2 flex justify-between gap-2 sm:gap-4">
        {segments.map((s) => {
          const pct = Math.round((s.value / total) * 100);
          return (
            <li key={s.label} className="flex flex-1 flex-col items-center gap-0.5">
              <span className="text-xs font-medium text-gray-200">{s.label}</span>
              <span className="text-xs text-gray-400">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
