import { useState, type FormEvent } from "react";
import { Camera, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function PerfilPage() {
  const { user, updateProfile } = useAuth();

  const [nome, setNome] = useState(user?.nome ?? "");
  const [sobrenome, setSobrenome] = useState(user?.sobrenome ?? "");
  const [cargo, setCargo] = useState(user?.cargo ?? "");
  const [fotoUrl, setFotoUrl] = useState(user?.fotoUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const initials = [nome, sobrenome]
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "U";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await updateProfile({ nome, sobrenome, cargo, fotoUrl });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="scrollbar-slim flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-6 pb-8 pt-7 lg:px-12 lg:pb-12 lg:pt-[52px]">
      <header className="flex animate-fade-in-up flex-col gap-1 motion-reduce:animate-none">
        <h1 className="text-2xl font-bold leading-tight text-gray-100">
          Configuração de Perfil
        </h1>
        <p className="text-sm text-gray-400">
          Atualize suas informações pessoais
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-8">
        {/* Foto */}
        <div className="flex items-center gap-6">
          <div className="relative">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt="Foto de perfil"
                className="size-20 rounded-full object-cover"
              />
            ) : (
              <span className="inline-flex size-20 items-center justify-center rounded-full bg-blue-dark text-xl font-bold uppercase text-white">
                {initials}
              </span>
            )}
            <label
              className="absolute -bottom-1 -right-1 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-surface bg-blue-base text-white transition-colors hover:bg-blue-dark"
            >
              <Camera size={14} />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-gray-100">Foto de perfil</span>
            <span className="text-xs text-gray-400">JPG, PNG ou WebP. Máx 2MB.</span>
          </div>
        </div>

        {/* Campos */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="perfil-nome" className="text-sm font-semibold text-gray-100">
              Nome
            </label>
            <input
              id="perfil-nome"
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              className="h-11 rounded-lg border border-gray-500 bg-surface px-4 text-sm text-gray-100 placeholder:text-gray-400 focus:border-blue-base focus:outline-none focus:ring-1 focus:ring-blue-base"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="perfil-sobrenome" className="text-sm font-semibold text-gray-100">
              Sobrenome
            </label>
            <input
              id="perfil-sobrenome"
              type="text"
              value={sobrenome}
              onChange={(e) => setSobrenome(e.target.value)}
              placeholder="Seu sobrenome"
              className="h-11 rounded-lg border border-gray-500 bg-surface px-4 text-sm text-gray-100 placeholder:text-gray-400 focus:border-blue-base focus:outline-none focus:ring-1 focus:ring-blue-base"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="perfil-cargo" className="text-sm font-semibold text-gray-100">
            Cargo
          </label>
          <input
            id="perfil-cargo"
            type="text"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            placeholder="Ex: Advogado, Administrador, Estagiário"
            className="h-11 rounded-lg border border-gray-500 bg-surface px-4 text-sm text-gray-100 placeholder:text-gray-400 focus:border-blue-base focus:outline-none focus:ring-1 focus:ring-blue-base"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-100">
            E-mail
          </label>
          <input
            type="email"
            disabled
            value={user?.email ?? ""}
            className="h-11 rounded-lg border border-gray-500 bg-gray-600/50 px-4 text-sm text-gray-400"
          />
          <span className="text-xs text-gray-400">O e-mail não pode ser alterado.</span>
        </div>

        {/* Botão salvar */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-sm bg-blue-base px-6 text-sm font-bold text-white transition-colors hover:bg-blue-dark disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Salvando…
              </>
            ) : (
              "Salvar alterações"
            )}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-status-done">
              <Check size={16} />
              Perfil atualizado
            </span>
          )}
          {error && (
            <span className="text-sm text-danger">{error}</span>
          )}
        </div>
      </form>
    </div>
  );
}
