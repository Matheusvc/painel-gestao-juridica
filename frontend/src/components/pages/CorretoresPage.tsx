import { useCallback, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  FileSpreadsheet,
  Printer,
  UserCircle,
  Users,
} from "lucide-react";
import { HorizontalBar } from "@/components/dashboard/HorizontalBar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusTag } from "@/components/ui/StatusTag";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useFetch } from "@/hooks/useFetch";
import { CHART_COLORS } from "@/lib/charts";
import { downloadText, escapeHtml } from "@/lib/download";
import { dashboardApi, type CorretorDetalhe } from "@/lib/api";

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function buildCorretorCsv(d: CorretorDetalhe) {
  const rows: string[][] = [
    ["Relatório do Corretor — " + d.corretor],
    ["Gerado em", new Date().toLocaleString("pt-BR")],
    ["Total de Clientes", String(d.totalClientes)],
    ["Total de Processos", String(d.totalProcessos)],
    ["Valor Total", fmt(d.valorTotal)],
    [],
    ["Cliente", "CPF", "Benefício", "Status", "Valor", "Data Protocolo"],
    ...d.clientes.map((c) => [c.nome, c.cpf, c.beneficio, c.status, c.valor, c.dataProtocolo]),
  ];
  return "﻿" + rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(";")).join("\r\n");
}

function buildCorretorHtml(d: CorretorDetalhe) {
  const clientesRows = d.clientes
    .map(
      (c) =>
        `<tr><td>${escapeHtml(c.nome)}</td><td>${escapeHtml(c.cpf)}</td><td>${escapeHtml(c.beneficio)}</td><td>${escapeHtml(c.status)}</td><td class="num">${escapeHtml(c.valor)}</td><td>${escapeHtml(c.dataProtocolo)}</td></tr>`,
    )
    .join("\n");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Relatório — ${escapeHtml(d.corretor)}</title>
<style>
  :root{color-scheme:light}*{box-sizing:border-box}
  body{font-family:"Lato","Segoe UI",Roboto,sans-serif;color:#151619;margin:40px}
  header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #2e3da3;padding-bottom:16px;margin-bottom:24px}
  .brand{font-size:20px;font-weight:700;color:#2e3da3}.brand small{display:block;font-size:10px;letter-spacing:1px;color:#8996eb}
  h1{font-size:18px;margin:0 0 2px}.sub{color:#858b99;font-size:12px}
  .kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
  .kpi{border:1px solid #e3e5e8;border-radius:8px;padding:12px}.kpi .l{font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#858b99}.kpi .v{font-size:24px;font-weight:700;margin-top:4px}
  table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #e3e5e8}
  th{color:#858b99;font-size:11px;text-transform:uppercase;letter-spacing:.5px}td.num{text-align:right}
  footer{margin-top:32px;color:#858b99;font-size:11px;border-top:1px solid #e3e5e8;padding-top:12px}
  @media print{body{margin:16mm}}
</style></head><body>
  <header><div><h1>Relatório do Corretor: ${escapeHtml(d.corretor)}</h1><div class="sub">Gerado em ${new Date().toLocaleString("pt-BR")}</div></div><div class="brand">CASTRO<small>ADVOCACIA</small></div></header>
  <section class="kpis">
    <div class="kpi"><div class="l">Total de Clientes</div><div class="v">${d.totalClientes}</div></div>
    <div class="kpi"><div class="l">Total de Processos</div><div class="v">${d.totalProcessos}</div></div>
    <div class="kpi"><div class="l">Valor Total</div><div class="v">${escapeHtml(fmt(d.valorTotal))}</div></div>
  </section>
  <table><thead><tr><th>Cliente</th><th>CPF</th><th>Benefício</th><th>Status</th><th class="num">Valor</th><th>Data Protocolo</th></tr></thead><tbody>${clientesRows}</tbody></table>
  <footer>Gerado em ${new Date().toLocaleString("pt-BR")} · Castro Advocacia</footer>
</body></html>`;
}

function printCorretorReport(d: CorretorDetalhe) {
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (!doc) { iframe.remove(); return; }
  doc.open();
  doc.write(buildCorretorHtml(d));
  doc.close();
  const win = iframe.contentWindow;
  const cleanup = () => setTimeout(() => iframe.remove(), 1000);
  if (win) {
    win.onafterprint = cleanup;
    setTimeout(() => { win.focus(); win.print(); cleanup(); }, 250);
  } else cleanup();
}

function CorretorSelector({
  corretores,
  selected,
  onSelect,
}: {
  corretores: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(wrapRef, open, close);

  const label = selected || "Selecionar corretor";

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-500/40 bg-surface px-3 text-sm font-medium text-gray-100 transition-colors hover:border-blue-base/40 hover:bg-gray-600"
      >
        <Users size={15} className="text-blue-base" />
        <span className="font-bold">{label}</span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 max-h-72 w-64 overflow-y-auto rounded-xl border border-gray-500/60 bg-surface py-1 shadow-card-hover">
          <button
            type="button"
            onClick={() => { onSelect(""); setOpen(false); }}
            className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
              !selected ? "bg-blue-base/15 text-blue-base" : "text-gray-400 hover:bg-gray-600/50 hover:text-gray-100"
            }`}
          >
            Todos os corretores
          </button>
          {corretores.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => { onSelect(name); setOpen(false); }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                selected === name
                  ? "bg-blue-base/15 font-bold text-blue-base"
                  : "text-gray-100 hover:bg-gray-600/50"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CorretoresPage() {
  const { data: corretores, loading: loadingList } = useFetch<string[]>(
    useCallback(() => dashboardApi.corretores(), []),
  );

  const [selected, setSelected] = useState<string>("");

  const fetchDetalhe = useCallback(
    () => (selected ? dashboardApi.corretorDetalhe(selected) : Promise.resolve(null)),
    [selected],
  );
  const { data: detalhe, loading: loadingDetalhe } = useFetch<CorretorDetalhe | null>(fetchDetalhe);

  const statusData = useMemo(() => {
    if (!detalhe) return [];
    return Object.entries(detalhe.processosPorStatus).map(([label, value], i) => ({
      label, value, color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [detalhe]);

  const beneficioData = useMemo(() => {
    if (!detalhe) return [];
    return Object.entries(detalhe.processosPorBeneficio).map(([label, value], i) => ({
      label, value, color: CHART_COLORS[(i + 3) % CHART_COLORS.length],
    }));
  }, [detalhe]);

  const handleExportCsv = () => {
    if (!detalhe) return;
    const stamp = new Date().toISOString().slice(0, 10);
    downloadText(`relatorio-corretor-${detalhe.corretor}-${stamp}.csv`, buildCorretorCsv(detalhe), "text/csv;charset=utf-8");
  };

  const handlePrint = () => {
    if (!detalhe) return;
    printCorretorReport(detalhe);
  };

  if (loadingList) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400">Carregando corretores…</p>
      </div>
    );
  }

  return (
    <div className="scrollbar-slim flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-6 pb-8 pt-7 lg:px-10 lg:pb-12 lg:pt-[52px]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Corretores" />
        <CorretorSelector
          corretores={corretores ?? []}
          selected={selected}
          onSelect={setSelected}
        />
      </header>

      {!selected && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
          <div className="flex size-20 items-center justify-center rounded-full bg-blue-base/10">
            <UserCircle size={40} className="text-blue-base" />
          </div>
          <p className="text-center text-sm text-gray-400">
            Selecione um corretor para ver seus dados e gráficos
          </p>
        </div>
      )}

      {selected && loadingDetalhe && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-400">Carregando dados do corretor…</p>
        </div>
      )}

      {selected && detalhe && !loadingDetalhe && (
        <>
          {/* KPIs + Export */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
              <KpiCard label="Total de clientes" value={detalhe.totalClientes} />
              <KpiCard label="Total de processos" value={detalhe.totalProcessos} />
              <KpiCard label="Valor total" value={fmt(detalhe.valorTotal)} />
            </div>
          </div>

          {/* Botões de exportação */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex h-10 items-center gap-2 rounded-sm bg-blue-base px-4 text-sm font-bold text-white transition-colors hover:bg-blue-dark"
            >
              <Printer size={16} />
              Imprimir relatório
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex h-10 items-center gap-2 rounded-sm border border-gray-500 bg-surface px-4 text-sm font-bold text-gray-100 transition-colors hover:bg-gray-600"
            >
              <FileSpreadsheet size={16} />
              Baixar CSV
            </button>
          </div>

          {/* Gráficos */}
          <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
            {statusData.length > 0 && (
              <section className="flex flex-col rounded-2xl border border-gray-500/60 bg-surface shadow-card">
                <div className="flex items-center gap-2.5 border-b border-gray-500/40 px-6 py-4">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-blue-base/10 text-blue-base">
                    <BarChart3 size={16} />
                  </span>
                  <h2 className="text-sm font-bold text-gray-100">Processos por Status</h2>
                </div>
                <div className="p-6">
                  <HorizontalBar data={statusData} ariaLabel="Processos por status do corretor" />
                </div>
              </section>
            )}
            {beneficioData.length > 0 && (
              <section className="flex flex-col rounded-2xl border border-gray-500/60 bg-surface shadow-card">
                <div className="flex items-center gap-2.5 border-b border-gray-500/40 px-6 py-4">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-blue-base/10 text-blue-base">
                    <BarChart3 size={16} />
                  </span>
                  <h2 className="text-sm font-bold text-gray-100">Processos por Benefício</h2>
                </div>
                <div className="p-6">
                  <HorizontalBar data={beneficioData} ariaLabel="Processos por benefício do corretor" />
                </div>
              </section>
            )}
          </div>

          {/* Tabela de clientes */}
          <section className="flex flex-col rounded-2xl border border-gray-500/60 bg-surface shadow-card">
            <div className="flex items-center gap-2.5 border-b border-gray-500/40 px-6 py-4">
              <span className="flex size-8 items-center justify-center rounded-lg bg-blue-base/10 text-blue-base">
                <Users size={16} />
              </span>
              <h2 className="text-sm font-bold text-gray-100">Clientes do Corretor</h2>
              <span className="ml-auto rounded-full bg-gray-500/40 px-3 py-1 text-xs font-bold tabular-nums text-gray-100">
                {detalhe.clientes.length}
              </span>
            </div>
            <div className="scrollbar-slim overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="h-12 border-b border-gray-500/40">
                    <th className="px-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Cliente</th>
                    <th className="px-4 text-xs font-semibold uppercase tracking-wide text-gray-400">CPF</th>
                    <th className="px-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Benefício</th>
                    <th className="px-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                    <th className="px-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Valor</th>
                    <th className="px-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Data Protoc.</th>
                  </tr>
                </thead>
                <tbody>
                  {detalhe.clientes.map((c, i) => (
                    <tr key={i} className="h-14 border-b border-gray-500/30 transition-colors last:border-b-0 hover:bg-gray-600/30">
                      <td className="px-4 text-sm font-medium text-gray-100">{c.nome}</td>
                      <td className="px-4 text-sm tabular-nums text-gray-100">{c.cpf}</td>
                      <td className="px-4 text-sm text-gray-100">{c.beneficio}</td>
                      <td className="px-4"><StatusTag status={c.status} /></td>
                      <td className="px-4 text-sm tabular-nums text-gray-100">{c.valor}</td>
                      <td className="px-4 text-sm tabular-nums text-gray-100">{c.dataProtocolo}</td>
                    </tr>
                  ))}
                  {detalhe.clientes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                        Nenhum cliente encontrado para este corretor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
