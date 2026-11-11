import { useCallback, useMemo, useState, type CSSProperties } from "react";
import {
  BarChart3,
  ChevronDown,
  FileSpreadsheet,
  Printer,
  UserCircle,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusTag } from "@/components/ui/StatusTag";
import { useFetch } from "@/hooks/useFetch";
import { dashboardApi, type CorretorDetalhe } from "@/lib/api";

const salesforceColors = [
  "#1B96FF", "#04844B", "#E3066A", "#FF6B2B", "#7526E5",
  "#0EB58C", "#FE5C4C", "#3A7AF2", "#B7560E", "#27AAE1",
] as const;

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function KpiCard({ label, value, style }: { label: string; value: string | number; style?: CSSProperties }) {
  return (
    <article
      style={style}
      className="flex flex-col gap-3 rounded-2xl border border-gray-500/60 bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-base/30 hover:shadow-card-hover"
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
      <span className="text-3xl font-bold leading-none tabular-nums text-gray-100">{value}</span>
    </article>
  );
}

function HorizontalBar({ data, ariaLabel }: { data: { label: string; value: number; color: string }[]; ariaLabel: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <ul className="flex flex-col gap-4" role="img" aria-label={ariaLabel}>
      {data.map((d) => (
        <li key={d.label} className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2.5 text-gray-100">
              <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: d.color }} />
              <span className="truncate">{d.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-gray-400">
              <span className="font-bold text-gray-100">{d.value}</span> · {Math.round((d.value / total) * 100)}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-border-light">
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color, minWidth: d.value > 0 ? "0.5rem" : 0 }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(v: string | number) {
  return String(v).replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] ?? ch,
  );
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
      label, value, color: salesforceColors[i % salesforceColors.length],
    }));
  }, [detalhe]);

  const beneficioData = useMemo(() => {
    if (!detalhe) return [];
    return Object.entries(detalhe.processosPorBeneficio).map(([label, value], i) => ({
      label, value, color: salesforceColors[(i + 3) % salesforceColors.length],
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
        <div className="flex items-center gap-3">
          <div className="relative">
            <Users size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="h-10 appearance-none rounded-full border border-gray-500 bg-surface pl-9 pr-10 text-sm font-bold text-gray-100 transition-colors hover:bg-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-base"
            >
              <option value="">Selecionar corretor</option>
              {(corretores ?? []).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
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
