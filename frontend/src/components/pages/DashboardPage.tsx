import type { CSSProperties, ReactNode } from "react";
import { Clock3, Users, UserCheck, UserX } from "lucide-react";
import { colors } from "@/theme";
import { StatCard } from "@/components/dashboard/StatCard";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { StatusBarChart } from "@/components/dashboard/StatusBarChart";

import { ExportReportButton } from "@/components/dashboard/ExportReportButton";
import { usePersistentState } from "@/hooks/usePersistentState";
import { clientStats, clientDeltas } from "@/data/mockDashboard";
import { mockServices } from "@/data/mockServices";
import type { Service } from "@/types/entities";

const rawDate = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
}).format(new Date());
const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

/** Atraso de entrada escalonado (fade-in-up) para o i-ésimo elemento. */
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

/** Dashboard: indicadores de clientes + gráficos de status. */
export function DashboardPage() {
  const { total, active, inactive, pending } = clientStats;

  // Lê os serviços persistidos (reflete criações/edições da página Serviços).
  const [services] = usePersistentState<Service[]>("castro.services", mockServices);
  const open = services.filter((s) => s.status === "open").length;
  const progress = services.filter((s) => s.status === "progress").length;
  const done = services.filter((s) => s.status === "done").length;

  const kpis = [
    {
      label: "Total de clientes",
      value: total,
      icon: <Users size={18} aria-hidden="true" />,
      delta: clientDeltas.total,
    },
    {
      label: "Ativos",
      value: active,
      icon: <UserCheck size={18} aria-hidden="true" />,
      accent: "text-status-done",
      accentBg: "bg-status-done/15",
      delta: clientDeltas.active,
    },
    {
      label: "Inativos",
      value: inactive,
      icon: <UserX size={18} aria-hidden="true" />,
      accent: "text-gray-400",
      accentBg: "bg-gray-400/15",
      delta: clientDeltas.inactive,
      invert: true,
    },
    {
      label: "Pendentes",
      value: pending,
      icon: <Clock3 size={18} aria-hidden="true" />,
      accent: "text-status-open",
      accentBg: "bg-status-open/15",
      delta: clientDeltas.pending,
      invert: true,
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
            clients: {
              total,
              active,
              inactive,
              pending,
              deltas: clientDeltas,
            },
            services: {
              open,
              progress,
              done,
              total: services.length,
            },
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
            delta={kpi.delta}
            invert={kpi.invert}
            className="animate-fade-in-up motion-reduce:animate-none"
            style={stagger(i + 1)}
          />
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard
          title="Status dos clientes"
          caption={`${total} no total`}
          style={stagger(5)}
        >
          <DonutChart
            centerValue={total}
            centerLabel="clientes"
            ariaLabel={`Distribuição de clientes: ${active} ativos, ${inactive} inativos, ${pending} pendentes`}
            segments={[
              { label: "Ativos", value: active, color: colors.status.done },
              { label: "Inativos", value: inactive, color: colors.gray[400] },
              { label: "Pendentes", value: pending, color: colors.status.open },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Serviços por status"
          caption={`${services.length} no total`}
          style={stagger(6)}
        >
          <StatusBarChart
            ariaLabel={`Serviços por status: ${open} abertos, ${progress} em atendimento, ${done} encerrados`}
            data={[
              { label: "Aberto", value: open, color: colors.status.open },
              { label: "Em atendimento", value: progress, color: colors.status.progress },
              { label: "Encerrado", value: done, color: colors.status.done },
            ]}
          />
        </ChartCard>
      </div>
    </div>
  );
}
