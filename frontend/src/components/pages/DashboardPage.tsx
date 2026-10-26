import { useCallback, type CSSProperties, type ReactNode } from "react";
import { Clock3, Users, UserCheck, UserX } from "lucide-react";
import { chartPalette } from "@/theme";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBarChart } from "@/components/dashboard/StatusBarChart";
import { ExportReportButton } from "@/components/dashboard/ExportReportButton";
import { useFetch } from "@/hooks/useFetch";
import { dashboardApi, type DashboardStats } from "@/lib/api";

const rawDate = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
}).format(new Date());
const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

function stagger(index: number): CSSProperties {
  return { animationDelay: `${index * 70}ms` };
}

function ChartCard({
  title,
  caption,
  children,
  style,
}: {
  title: string;
  caption?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section
      style={style}
      className="flex min-w-0 animate-fade-in-up flex-col gap-5 rounded-xl border border-gray-500/70 bg-surface p-5 shadow-card transition-shadow duration-200 motion-reduce:animate-none sm:p-6 hover:shadow-card-hover"
    >
      <div className="flex items-baseline justify-between gap-2 border-b border-gray-500/60 pb-4">
        <h2 className="text-sm font-bold text-gray-100">{title}</h2>
        {caption && (
          <span className="shrink-0 text-xs font-medium text-gray-400">{caption}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function mapToChartData(record: Record<string, number>) {
  return Object.entries(record).map(([label, value], i) => ({
    label,
    value,
    color: chartPalette[i % chartPalette.length],
  }));
}

function sumValues(record: Record<string, number>) {
  return Object.values(record).reduce((a, b) => a + b, 0);
}

export function DashboardPage() {
  const { data: stats, loading } = useFetch<DashboardStats>(
    useCallback(() => dashboardApi.stats(), []),
  );

  if (loading || !stats) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400">Carregando dashboard…</p>
      </div>
    );
  }

  const { clients, processos } = stats;
  const { total, active, inactive, pending } = clients;

  const categoriasEntries = Object.entries(processos);

  const kpis = [
    {
      label: "Total de clientes",
      value: total,
      icon: <Users size={18} aria-hidden="true" />,
    },
    {
      label: "Ativos",
      value: active,
      icon: <UserCheck size={18} aria-hidden="true" />,
      accent: "text-status-done",
      accentBg: "bg-status-done/15",
    },
    {
      label: "Inativos",
      value: inactive,
      icon: <UserX size={18} aria-hidden="true" />,
      accent: "text-gray-400",
      accentBg: "bg-gray-400/15",
    },
    {
      label: "Pendentes",
      value: pending,
      icon: <Clock3 size={18} aria-hidden="true" />,
      accent: "text-status-open",
      accentBg: "bg-status-open/15",
    },
  ];

  return (
    <div className="scrollbar-slim flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-6 pb-8 pt-7 lg:px-12 lg:pb-12 lg:pt-[52px]">
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
            clients: { total, active, inactive, pending },
            processos,
          }}
        />
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            accent={kpi.accent}
            accentBg={kpi.accentBg}
            className="animate-fade-in-up motion-reduce:animate-none"
            style={stagger(i + 1)}
          />
        ))}
      </div>

      {/* Gráficos dinâmicos — um por planilha importada */}
      {categoriasEntries.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {categoriasEntries.map(([categoria, statusMap], i) => {
            const data = mapToChartData(statusMap);
            const totalCat = sumValues(statusMap);
            return (
              <ChartCard
                key={categoria}
                title={categoria}
                caption={`${totalCat} no total`}
                style={stagger(5 + i)}
              >
                {data.length > 0 ? (
                  <StatusBarChart
                    ariaLabel={`${categoria}: ${data.map((d) => `${d.value} ${d.label}`).join(", ")}`}
                    data={data}
                  />
                ) : (
                  <p className="py-4 text-center text-sm text-gray-400">
                    Sem dados de status
                  </p>
                )}
              </ChartCard>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <ChartCard title="Processos" style={stagger(5)}>
            <p className="py-4 text-center text-sm text-gray-400">
              Nenhuma planilha importada
            </p>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
