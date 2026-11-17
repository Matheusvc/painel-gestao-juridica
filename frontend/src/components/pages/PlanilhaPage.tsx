import { useCallback, useMemo, useState, useRef, useEffect, type CSSProperties, type ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  BarChart3,
  Table2,
  Search,
  X,
} from "lucide-react";
import { importApi, planilhaApi } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { HorizontalBar } from "@/components/dashboard/HorizontalBar";
import { SearchInput } from "@/components/ui/SearchInput";
import { CHART_COLORS } from "@/lib/charts";
import type { ChartDatum } from "@/lib/charts";
import type { PlanilhaData, PlanilhaStats } from "@/types/planilha";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function stagger(index: number): CSSProperties {
  return { animationDelay: `${index * 70}ms` };
}

/* ------------------------------------------------------------------ */
/*  Section Card (mesmo padrão do Dashboard)                           */
/* ------------------------------------------------------------------ */

function SectionCard({
  title,
  icon,
  caption,
  children,
  style,
  className,
  searchable,
  searchValue,
  onSearchChange,
}: {
  title: string;
  icon?: ReactNode;
  caption?: string;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const handleToggle = () => {
    if (searchOpen) {
      onSearchChange?.("");
      setSearchOpen(false);
    } else {
      setSearchOpen(true);
    }
  };

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
        <div className="flex items-center gap-2">
          {searchable && searchOpen && (
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Filtrar…"
                className="h-8 w-40 rounded-lg border border-gray-500/40 bg-gray-600/30 pl-3 pr-8 text-xs text-gray-100 placeholder:text-gray-400 focus-visible:border-blue-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-base/30"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange?.("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-100"
                >
                  <X size={12} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
          {searchable && (
            <button
              type="button"
              onClick={handleToggle}
              aria-label={searchOpen ? "Fechar busca" : "Buscar"}
              className={`flex size-8 items-center justify-center rounded-lg border transition-colors ${
                searchOpen
                  ? "border-blue-base/40 bg-blue-base/10 text-blue-base"
                  : "border-gray-500/30 text-gray-400 hover:border-blue-base/30 hover:text-gray-100"
              }`}
            >
              <Search size={14} aria-hidden="true" />
            </button>
          )}
          {caption && (
            <span className="shrink-0 rounded-full bg-gray-500/40 px-3 py-1 text-xs font-bold tabular-nums text-gray-100">
              {caption}
            </span>
          )}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Planilha Page                                                      */
/* ------------------------------------------------------------------ */

export function PlanilhaPage() {
  const [categoria, setCategoria] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [busca, setBusca] = useState("");
  const [view, setView] = useState<"dashboard" | "tabela">("dashboard");
  const [chartSearch, setChartSearch] = useState<Record<string, string>>({});

  const s = (key: string) => chartSearch[key] ?? "";
  const setS = (key: string) => (v: string) =>
    setChartSearch((prev) => ({ ...prev, [key]: v }));

  const { data: categorias } = useFetch<string[]>(
    useCallback(() => importApi.categorias(), []),
  );

  const { data: dadosResp } = useFetch<PlanilhaData>(
    useCallback(
      () => (categoria ? planilhaApi.dados(categoria, pagina, 50) : Promise.resolve(null as never)),
      [categoria, pagina],
    ),
  );

  const { data: stats } = useFetch<PlanilhaStats>(
    useCallback(
      () => (categoria ? planilhaApi.stats(categoria) : Promise.resolve(null as never)),
      [categoria],
    ),
  );

  const linhasFiltradas = useMemo(() => {
    if (!dadosResp?.linhas) return [];
    if (!busca.trim()) return dadosResp.linhas;
    const termo = busca.toLowerCase();
    return dadosResp.linhas.filter((l) =>
      Object.values(l).some((v) => v?.toLowerCase().includes(termo)),
    );
  }, [dadosResp, busca]);

  const totalPaginas = dadosResp ? Math.ceil(dadosResp.total / dadosResp.tamanhoPagina) : 0;

  const handleExportCSV = useCallback(() => {
    if (!dadosResp?.colunas || !dadosResp.linhas.length) return;
    const headers = dadosResp.colunas.map((c) => c.nome);
    const csvRows = [
      headers.join(";"),
      ...dadosResp.linhas.map((l) =>
        headers.map((h) => `"${(l[h] ?? "").replace(/"/g, '""')}"`).join(";"),
      ),
    ];
    const blob = new Blob(["﻿" + csvRows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${categoria ?? "dados"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dadosResp, categoria]);

  if (!categorias || categorias.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-6">
        <div className="text-center">
          <BarChart3 size={48} className="mx-auto mb-4 text-gray-500" />
          <h2 className="text-lg font-bold text-gray-100">Nenhuma planilha importada</h2>
          <p className="mt-1 text-sm text-gray-400">
            Importe uma planilha na aba "Importar" para ver os dados aqui
          </p>
        </div>
      </div>
    );
  }

  if (!categoria) {
    setCategoria(categorias[0]);
    return null;
  }

  const kpis = [
    { label: "Total de registros", value: stats?.totalLinhas ?? 0 },
    ...(stats?.kpis?.map((kpi) => ({ label: kpi.coluna, value: formatBRL(kpi.soma) })) ?? []),
  ];

  return (
    <div className="scrollbar-slim flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-6 pb-8 pt-7 lg:px-10 lg:pb-12 lg:pt-[52px]">
      {/* Header */}
      <header className="relative z-10 flex animate-fade-in-up flex-col gap-4 motion-reduce:animate-none">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold leading-tight text-gray-100">Planilha</h1>
            <p className="text-sm text-gray-400">Visualização dinâmica dos dados importados</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={categoria}
              onChange={(e) => {
                setCategoria(e.target.value);
                setPagina(0);
                setBusca("");
                setChartSearch({});
              }}
              className="h-9 rounded-lg border border-gray-500/40 bg-surface px-3 text-sm font-medium text-gray-100 transition-colors hover:border-blue-base/40 focus-visible:border-blue-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-base/30"
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="flex overflow-hidden rounded-lg border border-gray-500/40">
              <button
                type="button"
                onClick={() => setView("dashboard")}
                className={`flex h-9 items-center gap-1.5 px-3 text-sm font-medium transition-colors ${
                  view === "dashboard"
                    ? "bg-blue-base text-white"
                    : "bg-surface text-gray-400 hover:text-gray-100"
                }`}
              >
                <BarChart3 size={15} />
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => setView("tabela")}
                className={`flex h-9 items-center gap-1.5 px-3 text-sm font-medium transition-colors ${
                  view === "tabela"
                    ? "bg-blue-base text-white"
                    : "bg-surface text-gray-400 hover:text-gray-100"
                }`}
              >
                <Table2 size={15} />
                Tabela
              </button>
            </div>
            {view === "tabela" && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-500/40 bg-surface px-3 text-sm font-medium text-gray-100 transition-colors hover:border-blue-base/40 hover:bg-gray-600"
              >
                <Download size={15} className="text-blue-base" />
                <span className="font-bold">Exportar CSV</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Dashboard View */}
      {view === "dashboard" && stats && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

          {/* Gráficos em SectionCards */}
          <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
            {stats.graficos.map((g, i) => {
              const allData: ChartDatum[] = Object.entries(g.distribuicao).map(
                ([label, value], j) => ({
                  label,
                  value,
                  color: CHART_COLORS[j % CHART_COLORS.length],
                }),
              );
              const searchKey = `graf_${i}`;
              const term = s(searchKey).toLowerCase();
              const data = term
                ? allData.filter((d) => d.label.toLowerCase().includes(term))
                : allData;
              const total = allData.reduce((sum, d) => sum + d.value, 0);

              return (
                <SectionCard
                  key={g.coluna}
                  title={g.coluna}
                  icon={<BarChart3 size={16} />}
                  caption={`${total} no total`}
                  style={stagger(kpis.length + 1 + i)}
                  searchable
                  searchValue={s(searchKey)}
                  onSearchChange={setS(searchKey)}
                >
                  {data.length > 0 ? (
                    <div className="scrollbar-slim -mr-2 max-h-[420px] overflow-y-auto pr-2">
                      <HorizontalBar data={data} ariaLabel={`Distribuição de ${g.coluna}`} />
                    </div>
                  ) : (
                    <p className="py-4 text-center text-sm text-gray-400">
                      Nenhum resultado para esta busca
                    </p>
                  )}
                </SectionCard>
              );
            })}
          </div>
        </>
      )}

      {/* Table View */}
      {view === "tabela" && dadosResp && (
        <div className="flex animate-fade-in-up flex-col gap-5 motion-reduce:animate-none">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SearchInput value={busca} onChange={setBusca} label="Buscar nos dados" placeholder="Buscar..." />
            <span className="shrink-0 rounded-full bg-gray-500/40 px-3 py-1 text-xs font-bold tabular-nums text-gray-100">
              {dadosResp.total} registros
            </span>
          </div>

          <section className="overflow-x-auto rounded-2xl border border-gray-500/60 bg-surface shadow-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-500/40">
                  {dadosResp.colunas.map((col) => (
                    <th
                      key={col.nome}
                      className="whitespace-nowrap px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-400"
                    >
                      {col.nome}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {linhasFiltradas.map((linha, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-500/30 transition-colors hover:bg-blue-base/5"
                  >
                    {dadosResp.colunas.map((col) => (
                      <td key={col.nome} className="whitespace-nowrap px-5 py-3 text-gray-100">
                        {linha[col.nome] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
                {linhasFiltradas.length === 0 && (
                  <tr>
                    <td
                      colSpan={dadosResp.colunas.length}
                      className="px-5 py-10 text-center text-sm text-gray-400"
                    >
                      Nenhum registro encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          {/* Pagination */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={pagina === 0}
                onClick={() => setPagina((p) => Math.max(0, p - 1))}
                className="flex size-9 items-center justify-center rounded-lg border border-gray-500/40 bg-surface text-gray-400 transition-colors hover:border-blue-base/30 hover:text-gray-100 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-400">
                Página <span className="font-bold text-gray-100">{pagina + 1}</span> de{" "}
                <span className="font-bold text-gray-100">{totalPaginas}</span>
              </span>
              <button
                type="button"
                disabled={pagina >= totalPaginas - 1}
                onClick={() => setPagina((p) => p + 1)}
                className="flex size-9 items-center justify-center rounded-lg border border-gray-500/40 bg-surface text-gray-400 transition-colors hover:border-blue-base/30 hover:text-gray-100 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
