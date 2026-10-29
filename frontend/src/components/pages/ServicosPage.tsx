import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Download, PenLine, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { IconButton } from "@/components/ui/IconButton";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { StatusTag } from "@/components/ui/StatusTag";
import { Avatar } from "@/components/layout/Avatar";
import {
  ServiceFormModal,
  type ServiceFormValues,
} from "@/components/servicos/ServiceFormModal";
import { useFetch } from "@/hooks/useFetch";
import { servicesApi } from "@/lib/api";
import { formatTotalDisplay } from "@/lib/currency";
import type { Service } from "@/types/entities";

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

function buildServicesCsv(services: Service[]): string {
  const header = [
    "Id",
    "Atualizado em",
    "Título",
    "Serviço",
    "Valor total",
    "Corretor",
    "Status",
  ];
  const rows = services.map((s) => [
    s.id,
    s.updatedAt,
    s.title,
    s.service,
    formatTotalDisplay(s.total),
    s.owner.name,
    s.status,
  ]);
  const body = [header, ...rows]
    .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";"))
    .join("\r\n");
  return `﻿${body}`;
}

export function ServicosPage() {
  const [selectedCategoria, setSelectedCategoria] = useState<string>("all");

  const { data: categorias } = useFetch<string[]>(
    useCallback(() => servicesApi.categorias(), []),
  );

  const fetchServices = useCallback(
    () => servicesApi.list(selectedCategoria === "all" ? undefined : selectedCategoria),
    [selectedCategoria],
  );
  const { data: services, loading, refetch } = useFetch<Service[]>(fetchServices);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  useEffect(() => {
    setStatusFilter("all");
  }, [selectedCategoria]);

  const list = services ?? [];

  const dynamicStatuses = useMemo(() => {
    const seen = new Map<string, number>();
    for (const s of list) {
      seen.set(s.status, (seen.get(s.status) ?? 0) + 1);
    }
    return Array.from(seen.entries()).map(([value, count]) => ({
      value,
      label: value,
      count,
    }));
  }, [list]);

  const filters = useMemo(
    () => [
      { value: "all", label: "Geral", count: list.length },
      ...dynamicStatuses,
    ],
    [dynamicStatuses, list.length],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (!q) return true;
      return [s.id, s.title, s.service, s.owner.name]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [list, query, statusFilter]);

  const handleExport = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadText(
      `servicos-${stamp}.csv`,
      buildServicesCsv(filtered),
      "text/csv;charset=utf-8",
    );
  };

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setFormOpen(true);
  };

  const handleSave = async (values: ServiceFormValues) => {
    if (editing) {
      await servicesApi.update(editing.id, values);
    } else {
      await servicesApi.create(values);
    }
    setFormOpen(false);
    setEditing(null);
    refetch();
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400">Carregando serviços…</p>
      </div>
    );
  }

  return (
    <div className="scrollbar-slim flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 pt-7 lg:px-12 lg:pb-12 lg:pt-[52px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <PageHeader title="Serviços" />
          {categorias && categorias.length > 0 && (
            <div className="relative">
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="h-9 appearance-none rounded-full border border-gray-500 bg-surface pl-4 pr-9 text-sm font-bold text-gray-100 transition-colors hover:bg-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-base"
              >
                <option value="all">Todas as planilhas</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            label="Buscar serviços"
            placeholder="Buscar por título, serviço ou corretor…"
          />
          <Button
            variant="secondary"
            onClick={handleExport}
            className="shrink-0"
            disabled={filtered.length === 0}
          >
            <Download size={16} aria-hidden="true" className="mr-1.5" />
            Exportar planilhas
          </Button>
          <Button onClick={openNew} className="shrink-0">
            <Plus size={16} aria-hidden="true" className="mr-1.5" />
            Novo
          </Button>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Filtrar serviços por status"
        className="flex flex-wrap items-center gap-2"
      >
        {filters.map((f) => {
          const active = statusFilter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setStatusFilter(f.value)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-base focus-visible:ring-offset-1 ${
                active
                  ? "bg-blue-base text-white"
                  : "border border-gray-500 text-gray-100 hover:bg-gray-600"
              }`}
            >
              {f.label.toUpperCase()}
              <span
                className={`rounded-full px-1.5 text-xs ${
                  active ? "bg-gray-600/25" : "bg-gray-500 text-gray-400"
                }`}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="scrollbar-slim -mx-4 overflow-x-auto px-4 sm:-mx-0 sm:px-0">
        <div className="min-w-[720px] overflow-hidden rounded-[10px] border border-gray-500">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Lista de serviços e chamados</caption>
            <thead>
              <tr className="h-12 border-b border-gray-500">
                <th scope="col" className="whitespace-nowrap px-3 text-sm font-bold text-gray-400">
                  Atualizado em
                </th>
                <th scope="col" className="whitespace-nowrap px-3 text-sm font-bold text-gray-400">
                  Id
                </th>
                <th scope="col" className="min-w-[180px] px-3 text-sm font-normal text-gray-400">
                  Planilhas
                </th>
                <th scope="col" className="whitespace-nowrap px-3 text-sm font-bold text-gray-400">
                  Valor total
                </th>
                <th scope="col" className="min-w-[120px] px-3 text-sm font-normal text-gray-400">
                  Corretor
                </th>
                <th scope="col" className="whitespace-nowrap px-3 text-sm font-bold text-gray-400">
                  Status
                </th>
                <th scope="col" className="w-[52px] px-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((service) => (
                <tr
                  key={service.id}
                  className="h-16 border-b border-gray-500 transition-colors last:border-b-0 hover:bg-gray-600"
                >
                  <td className="whitespace-nowrap px-3 align-middle text-sm text-gray-100">
                    {service.updatedAt}
                  </td>
                  <td className="px-3 align-middle text-sm font-bold text-gray-100">
                    {service.id}
                  </td>
                  <td className="px-3 align-middle">
                    <span className="block truncate text-sm font-bold text-gray-100">
                      {service.title}
                    </span>
                    <span className="block truncate text-xs text-gray-100">
                      {service.service}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 align-middle text-sm font-bold tabular-nums text-gray-100">
                    {formatTotalDisplay(service.total)}
                  </td>
                  <td className="px-3 align-middle">
                    <div className="flex items-center gap-2">
                      <Avatar initials={service.owner.initials} size="xxs" />
                      <span className="truncate text-sm text-gray-100">
                        {service.owner.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 align-middle">
                    <StatusTag status={service.status} />
                  </td>
                  <td className="px-3 align-middle">
                    <div className="flex justify-center">
                      <IconButton
                        label={`Editar serviço ${service.id}`}
                        onClick={() => openEdit(service)}
                      >
                        <PenLine size={14} aria-hidden="true" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-sm text-gray-400">
                    {query
                      ? `Nenhum serviço encontrado para "${query}".`
                      : statusFilter !== "all"
                        ? "Nenhum serviço com esse status."
                        : "Nenhum serviço cadastrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ServiceFormModal
        open={formOpen}
        service={editing}
        statusOptions={dynamicStatuses.map((s) => ({ value: s.value, label: s.label }))}
        onSave={handleSave}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      />
    </div>
  );
}
