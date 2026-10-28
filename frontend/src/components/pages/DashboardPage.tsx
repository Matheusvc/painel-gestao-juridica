import { useCallback, type CSSProperties, type ReactNode } from "react";

import { BarChart3, UserCircle } from "lucide-react";
import { ExportReportButton } from "@/components/dashboard/ExportReportButton";
import { useFetch } from "@/hooks/useFetch";
import { dashboardApi, type DashboardStats } from "@/lib/api";

const rawDate = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
}).format(new Date());
const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

const salesforceColors = [
  "#1B96FF", // azul brilhante
  "#04844B", // verde
  "#E3066A", // rosa
  "#FF6B2B", // laranja
  "#7526E5", // roxo
  "#0EB58C", // verde-agua
  "#FE5C4C", // vermelho
  "#3A7AF2", // azul médio
  "#B7560E", // marrom
  "#27AAE1", // ciano
] as const;

function stagger(index: number): CSSProperties {
  return { animationDelay: `${index * 70}ms` };
}

/* ------------------------------------------------------------------ */
/*  KPI Card                                                           */
/* ------------------------------------------------------------------ */

function KpiCard({
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
      className={`group flex flex-col gap-3 rounded-2xl border border-gray-500/60 bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-base/30 hover:shadow-card-hover ${className ?? ""}`}
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

/* ------------------------------------------------------------------ */
/*  Section Card                                                       */
/* ------------------------------------------------------------------ */

function SectionCard({
  title,
  icon,
  caption,
  children,
  style,
  className,
}: {
  title: string;
  icon?: ReactNode;
  caption?: string;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <section
      style={style}
      className={`flex min-w-0 animate-fade-in-up flex-col rounded-2xl border border-gray-500/60 bg-surface shadow-card transition-shadow duration-200 motion-reduce:animate-none hover:shadow-card-hover ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-gray-500/40 px-6 py-4">
        <div className="flex items-center gap-2.5">
          {icon && (
            <span className="flex size-8 items-center justify-center rounded-lg bg-blue-base/10 text-blue-base">
              {icon}
            </span>
          )}
          <h2 className="text-sm font-bold text-gray-100">{title}</h2>
        </div>
        {caption && (
          <span className="shrink-0 rounded-full bg-gray-500/40 px-3 py-1 text-xs font-bold tabular-nums text-gray-100">
            {caption}
          </span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Horizontal Bar Chart                                               */
/* ------------------------------------------------------------------ */

function HorizontalBar({
  data,
  ariaLabel,
}: {
  data: { label: string; value: number; color: string }[];
  ariaLabel: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <ul className="flex flex-col gap-4" role="img" aria-label={ariaLabel}>
      {data.map((d) => {
        const pct = Math.round((d.value / total) * 100);
        return (
          <li key={d.label} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2.5 text-gray-100">
                <span
                  className="size-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: d.color }}
                  aria-hidden="true"
                />
                <span className="truncate">{d.label}</span>
              </span>
              <span className="shrink-0 tabular-nums text-gray-400">
                <span className="font-bold text-gray-100">{d.value}</span> · {pct}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-border-light">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{
                  width: `${(d.value / max) * 100}%`,
                  backgroundColor: d.color,
                  minWidth: d.value > 0 ? "0.5rem" : 0,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  Corretor Ranking                                                   */
/* ------------------------------------------------------------------ */

function CorretorRanking({
  data,
}: {
  data: { name: string; clients: number }[];
}) {
  const max = Math.max(...data.map((d) => d.clients), 1);
  const totalClients = data.reduce((sum, d) => sum + d.clients, 0);

  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => {
        const initials = d.name
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0])
          .join("")
          .toUpperCase();
        const color = salesforceColors[i % salesforceColors.length];
        const pct = totalClients > 0 ? Math.round((d.clients / totalClients) * 100) : 0;

        return (
          <div
            key={d.name}
            className="flex items-center gap-4 rounded-xl border border-gray-500/30 bg-gray-600/30 px-4 py-3 transition-colors hover:bg-gray-600/50"
          >
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {initials}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate font-semibold text-gray-100">{d.name}</span>
                <span className="shrink-0 tabular-nums text-gray-400">
                  <span className="font-bold text-gray-100">{d.clients}</span>{" "}
                  {d.clients === 1 ? "cliente" : "clientes"} · {pct}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-border-light">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{
                    width: `${(d.clients / max) * 100}%`,
                    backgroundColor: color,
                    minWidth: d.clients > 0 ? "0.5rem" : 0,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function mapToSalesforceChartData(record: Record<string, number>) {
  return Object.entries(record).map(([label, value], i) => ({
    label,
    value,
    color: salesforceColors[i % salesforceColors.length],
  }));
}

function sumValues(record: Record<string, number>) {
  return Object.values(record).reduce((a, b) => a + b, 0);
}

/* ------------------------------------------------------------------ */
/*  Dashboard Page                                                     */
/* ------------------------------------------------------------------ */

export function DashboardPage() {
  const { data: stats, loading, error, refetch } = useFetch<DashboardStats>(
    useCallback(() => dashboardApi.stats(), []),
  );

  if (!stats && error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-gray-400">Não foi possível carregar o dashboard.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex h-10 items-center gap-2 rounded-sm bg-blue-base px-4 text-sm font-bold text-white transition-colors hover:bg-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-base focus-visible:ring-offset-2"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400">Carregando dashboard…</p>
      </div>
    );
  }

  const { clients, processos, corretores, totalRecebido, totalAReceber, encerrados } = stats;

  const categoriasEntries = Object.entries(processos);
  const corretoresEntries = Object.entries(corretores ?? {});

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const kpis = [
    { label: "Total de clientes", value: clients.total },
    { label: "Ativos", value: clients.active },
    { label: "Encerrados", value: encerrados ?? 0 },
    { label: "Valor recebido", value: fmt(totalRecebido ?? 0) },
    { label: "Valor a receber", value: fmt(totalAReceber ?? 0) },
  ];

  return (
    <div className="scrollbar-slim flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-6 pb-8 pt-7 lg:px-10 lg:pb-12 lg:pt-[52px]">
      {/* Header */}
      <header className="flex animate-fade-in-up flex-col gap-4 motion-reduce:animate-none sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-tight text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-400">
            Visão geral do escritório · {dateLabel}
          </p>
        </div>
        <ExportReportButton
          data={{
            dateLabel,
            clients,
            processos,
          }}
        />
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi, i) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            className="animate-fade-in-up motion-reduce:animate-none"
            style={stagger(i + 1)}
          />
        ))}
      </div>

      {/* Corretores + Processos lado a lado */}
      <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
        {/* Coluna esquerda: Clientes por Corretor */}
        <SectionCard
          title="Clientes por Corretor"
          icon={<UserCircle size={16} />}
          caption={`${corretoresEntries.length} corretores`}
          style={stagger(6)}
        >
          {corretoresEntries.length > 0 ? (
            <div className="scrollbar-slim -mr-2 max-h-[420px] overflow-y-auto pr-2">
              <CorretorRanking
                data={corretoresEntries.map(([name, clients]) => ({ name, clients }))}
              />
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-gray-400">
              Nenhum corretor encontrado. Importe uma planilha com dados de corretores.
            </p>
          )}
        </SectionCard>

        {/* Coluna direita: Gráficos de processos */}
        {categoriasEntries.length > 0 ? (
          <div className="flex flex-col gap-5">
            {categoriasEntries.map(([categoria, statusMap], i) => {
              const data = mapToSalesforceChartData(statusMap);
              const totalCat = sumValues(statusMap);
              return (
                <SectionCard
                  key={categoria}
                  title={categoria}
                  icon={<BarChart3 size={16} />}
                  caption={`${totalCat} no total`}
                  style={stagger(8 + i)}
                >
                  {data.length > 0 ? (
                    <div className="scrollbar-slim -mr-2 max-h-[420px] overflow-y-auto pr-2">
                      <HorizontalBar
                        ariaLabel={`${categoria}: ${data.map((d) => `${d.value} ${d.label}`).join(", ")}`}
                        data={data}
                      />
                    </div>
                  ) : (
                    <p className="py-4 text-center text-sm text-gray-400">
                      Sem dados de status
                    </p>
                  )}
                </SectionCard>
              );
            })}
          </div>
        ) : (
          <SectionCard
            title="Processos"
            icon={<BarChart3 size={16} />}
            style={stagger(8)}
          >
            <p className="py-4 text-center text-sm text-gray-400">
              Nenhuma planilha importada
            </p>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
