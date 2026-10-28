import { useCallback, useMemo, useState } from "react";
import { PenLine, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { IconButton } from "@/components/ui/IconButton";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Avatar } from "@/components/layout/Avatar";
import {
  ClientFormModal,
  type ClientFormValues,
} from "@/components/clientes/ClientFormModal";
import { useFetch } from "@/hooks/useFetch";
import { clientsApi } from "@/lib/api";
import type { Client } from "@/types/entities";

export function ClientesPage() {
  const { data: clients, loading, refetch } = useFetch<Client[]>(
    useCallback(() => clientsApi.list(), []),
  );
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);

  const filtered = useMemo(() => {
    const list = clients ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) =>
      [c.name, c.cpf, c.processNumber].join(" ").toLowerCase().includes(q),
    );
  }, [clients, query]);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setFormOpen(true);
  };

  const handleSave = async (values: ClientFormValues) => {
    if (editing) {
      await clientsApi.update(editing.id, values);
    } else {
      await clientsApi.create(values);
    }
    setFormOpen(false);
    setEditing(null);
    refetch();
  };

  const removeClient = async () => {
    if (!deleting) return;
    await clientsApi.remove(deleting.id);
    setDeleting(null);
    refetch();
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400">Carregando clientes…</p>
      </div>
    );
  }

  return (
    <div className="scrollbar-slim flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 pt-7 lg:px-12 lg:pb-12 lg:pt-[52px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Clientes" />
        <div className="flex items-center gap-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            label="Buscar clientes"
            placeholder="Buscar por nome, CPF ou processo…"
          />
          <Button onClick={openNew} className="shrink-0">
            <Plus size={16} aria-hidden="true" className="mr-1.5" />
            Novo
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px] overflow-hidden rounded-[10px] border border-gray-500">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Lista de clientes</caption>
            <thead>
              <tr className="h-12 border-b border-gray-500">
                <th scope="col" className="w-[240px] px-3 text-sm font-bold text-gray-400">
                  Nome
                </th>
                <th scope="col" className="w-[170px] px-3 text-sm font-bold text-gray-400">
                  CPF
                </th>
                <th scope="col" className="w-[280px] pl-12 pr-3 text-sm font-bold text-gray-400">
                  Número do processo
                </th>
                <th scope="col" aria-hidden="true" />
                <th scope="col" className="w-[112px] px-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr
                  key={client.id}
                  className="h-16 border-b border-gray-500 last:border-b-0"
                >
                  <td className="px-3">
                    <div className="flex items-center gap-3">
                      <Avatar initials={client.initials} size="xs" />
                      <span className="truncate text-sm font-bold text-gray-100">
                        {client.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3">
                    <span className="truncate text-sm tabular-nums text-gray-100">
                      {client.cpf}
                    </span>
                  </td>
                  <td className="pl-12 pr-3">
                    <span className="truncate text-sm tabular-nums text-gray-100">
                      {client.processNumber}
                    </span>
                  </td>
                  <td aria-hidden="true" />
                  <td className="px-3">
                    <div className="flex items-center justify-end gap-2">
                      <IconButton
                        label={`Excluir ${client.name}`}
                        tone="danger"
                        onClick={() => setDeleting(client)}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </IconButton>
                      <IconButton
                        label={`Editar ${client.name}`}
                        onClick={() => openEdit(client)}
                      >
                        <PenLine size={14} aria-hidden="true" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-sm text-gray-400">
                    {query
                      ? `Nenhum cliente encontrado para "${query}".`
                      : "Nenhum cliente cadastrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ClientFormModal
        open={formOpen}
        client={editing}
        onSave={handleSave}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir cliente"
        message={`Tem certeza que deseja excluir ${deleting?.name ?? "este cliente"}? Esta ação não pode ser desfeita.`}
        onConfirm={removeClient}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
