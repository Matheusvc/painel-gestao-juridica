import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { PenLine, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { IconButton } from "@/components/ui/IconButton";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
import { Avatar } from "@/components/layout/Avatar";
import { useFetch } from "@/hooks/useFetch";
import { usuariosApi, type UsuarioDTO } from "@/lib/api";

const PERFIL_OPTIONS = [
  { value: "ADMIN", label: "Administrador" },
  { value: "ADVOGADO", label: "Advogado" },
  { value: "ATENDENTE", label: "Atendente" },
];

const PERFIL_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  ADVOGADO: "Advogado",
  ATENDENTE: "Atendente",
};

function UsuarioFormModal({
  open,
  usuario,
  onSave,
  onClose,
}: {
  open: boolean;
  usuario: UsuarioDTO | null;
  onSave: (values: { nome: string; email: string; senha: string; perfil: string; cargo: string }) => void;
  onClose: () => void;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("ATENDENTE");
  const [cargo, setCargo] = useState("");

  useEffect(() => {
    if (!open) return;
    setNome(usuario?.nome ?? "");
    setEmail(usuario?.email ?? "");
    setSenha("");
    setPerfil(usuario?.perfil ?? "ATENDENTE");
    setCargo(usuario?.cargo ?? "");
  }, [open, usuario]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) return;
    if (!usuario && !senha.trim()) return;
    onSave({
      nome: nome.trim(),
      email: email.trim(),
      senha: senha.trim(),
      perfil,
      cargo: cargo.trim(),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={usuario ? "Editar usuario" : "Novo usuario"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField label="Nome" value={nome} onChange={setNome} required />
        <TextField label="Email" value={email} onChange={setEmail} type="email" required />
        <TextField
          label={usuario ? "Nova senha (deixe vazio para manter)" : "Senha"}
          value={senha}
          onChange={setSenha}
          required={!usuario}
        />
        <SelectField label="Perfil" value={perfil} onChange={setPerfil} options={PERFIL_OPTIONS} />
        <TextField label="Cargo" value={cargo} onChange={setCargo} placeholder="Ex: Advogado Junior" />
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{usuario ? "Salvar" : "Criar"}</Button>
        </div>
      </form>
    </Modal>
  );
}

export function UsuariosPage() {
  const { data: usuarios, loading, refetch } = useFetch<UsuarioDTO[]>(
    useCallback(() => usuariosApi.list(), []),
  );
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UsuarioDTO | null>(null);
  const [deleting, setDeleting] = useState<UsuarioDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = usuarios ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((u) =>
      [u.nome, u.email, u.perfil, u.cargo].join(" ").toLowerCase().includes(q),
    );
  }, [usuarios, query]);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
    setError(null);
  };

  const openEdit = (u: UsuarioDTO) => {
    setEditing(u);
    setFormOpen(true);
    setError(null);
  };

  const handleSave = async (values: { nome: string; email: string; senha: string; perfil: string; cargo: string }) => {
    try {
      setError(null);
      if (editing) {
        const payload: Record<string, string> = {
          nome: values.nome,
          email: values.email,
          perfil: values.perfil,
          cargo: values.cargo,
        };
        if (values.senha) payload.senha = values.senha;
        await usuariosApi.update(editing.id, payload);
      } else {
        await usuariosApi.create(values);
      }
      setFormOpen(false);
      setEditing(null);
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      setError(msg);
    }
  };

  const removeUsuario = async () => {
    if (!deleting) return;
    await usuariosApi.remove(deleting.id);
    setDeleting(null);
    refetch();
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400">Carregando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="scrollbar-slim flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 pt-7 lg:px-12 lg:pb-12 lg:pt-[52px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Usuarios" />
        <div className="flex items-center gap-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            label="Buscar usuarios"
            placeholder="Buscar por nome, email ou perfil..."
          />
          <Button onClick={openNew} className="shrink-0">
            <Plus size={16} aria-hidden="true" className="mr-1.5" />
            Novo
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[760px] overflow-hidden rounded-[10px] border border-gray-500">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Lista de usuarios</caption>
            <thead>
              <tr className="h-12 border-b border-gray-500">
                <th scope="col" className="w-[220px] px-3 text-sm font-bold text-gray-400">
                  Nome
                </th>
                <th scope="col" className="w-[220px] px-3 text-sm font-bold text-gray-400">
                  Email
                </th>
                <th scope="col" className="w-[120px] px-3 text-sm font-bold text-gray-400">
                  Perfil
                </th>
                <th scope="col" className="w-[160px] px-3 text-sm font-bold text-gray-400">
                  Cargo
                </th>
                <th scope="col" className="w-[112px] px-3">
                  <span className="sr-only">Acoes</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const initials = u.nome
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <tr key={u.id} className="h-16 border-b border-gray-500 last:border-b-0">
                    <td className="px-3">
                      <div className="flex items-center gap-3">
                        <Avatar initials={initials} size="xs" />
                        <span className="truncate text-sm font-bold text-gray-100">
                          {u.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-3">
                      <span className="truncate text-sm text-gray-100">{u.email}</span>
                    </td>
                    <td className="px-3">
                      <span className="inline-flex items-center rounded-full bg-blue-base/10 px-2.5 py-0.5 text-xs font-medium text-blue-base">
                        {PERFIL_LABEL[u.perfil] ?? u.perfil}
                      </span>
                    </td>
                    <td className="px-3">
                      <span className="truncate text-sm text-gray-300">{u.cargo}</span>
                    </td>
                    <td className="px-3">
                      <div className="flex items-center justify-end gap-2">
                        <IconButton
                          label={`Excluir ${u.nome}`}
                          tone="danger"
                          onClick={() => setDeleting(u)}
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          label={`Editar ${u.nome}`}
                          onClick={() => openEdit(u)}
                        >
                          <PenLine size={14} aria-hidden="true" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-sm text-gray-400">
                    {query
                      ? `Nenhum usuario encontrado para "${query}".`
                      : "Nenhum usuario cadastrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UsuarioFormModal
        open={formOpen}
        usuario={editing}
        onSave={handleSave}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
          setError(null);
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir usuario"
        message={`Tem certeza que deseja excluir ${deleting?.nome ?? "este usuario"}? Esta acao nao pode ser desfeita.`}
        onConfirm={removeUsuario}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
