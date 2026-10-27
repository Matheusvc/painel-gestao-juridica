import { useCallback, useRef, useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { clientsApi, importApi, servicesApi } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";

interface UploadResult {
  success: boolean;
  categoria?: string;
  total?: number;
  error?: string;
}

export function ImportarPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const {
    data: categorias,
    refetch,
  } = useFetch<string[]>(useCallback(() => importApi.categorias(), []));

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        setResult({ success: false, error: "Envie um arquivo .xlsx" });
        return;
      }
      setLoading(true);
      setResult(null);
      try {
        const res = await importApi.upload(file);
        setResult(res);
        refetch();
      } catch {
        setResult({ success: false, error: "Erro ao enviar arquivo" });
      } finally {
        setLoading(false);
      }
    },
    [refetch],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile],
  );

  const handleRemove = useCallback(
    async (categoria: string) => {
      await importApi.remover(categoria);
      refetch();
    },
    [refetch],
  );

  const handleRemoveAll = useCallback(async () => {
    if (!confirm("Deseja retirar todos os dados (clientes, serviços e dashboard)?")) return;
    await Promise.all([
      servicesApi.removeAll(),
      clientsApi.removeAll(),
    ]);
  }, []);

  return (
    <div className="scrollbar-slim flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-6 pb-8 pt-7 lg:px-12 lg:pb-12 lg:pt-[52px]">
      <header className="flex animate-fade-in-up items-start justify-between gap-4 motion-reduce:animate-none">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-tight text-gray-100">
            Importar Planilhas
          </h1>
          <p className="text-sm text-gray-400">
            Envie qualquer planilha .xlsx — o gráfico será gerado automaticamente
            com o título da planilha
          </p>
        </div>
        <button
          type="button"
          onClick={handleRemoveAll}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-sm bg-danger/15 px-4 text-sm font-bold text-danger transition-colors hover:bg-danger/25"
        >
          <Trash2 size={16} />
          Retirar Dados
        </button>
      </header>

      {/* Upload area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-10 transition-colors ${
          dragOver
            ? "border-blue-base bg-blue-base/10"
            : "border-gray-500/70 bg-surface hover:border-gray-400"
        }`}
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-blue-base/15">
          <FileSpreadsheet size={32} className="text-blue-base" />
        </div>

        <div className="text-center">
          <h3 className="text-base font-bold text-gray-100">
            Enviar planilha
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            O título do gráfico será extraído automaticamente da planilha
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={onChange}
          className="hidden"
        />

        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-10 items-center gap-2 rounded-sm bg-blue-base px-5 text-sm font-bold text-gray-600 transition-colors hover:bg-blue-dark disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Importando…
            </>
          ) : (
            <>
              <Upload size={16} />
              Selecionar arquivo
            </>
          )}
        </button>

        <p className="text-xs text-gray-400">
          ou arraste e solte o arquivo aqui
        </p>

        {result && (
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm ${
              result.success
                ? "bg-status-done/15 text-status-done"
                : "bg-danger/15 text-danger"
            }`}
          >
            {result.success ? (
              <>
                <CheckCircle2 size={16} />
                <span>
                  <strong>{result.total}</strong> processos importados em{" "}
                  <strong>{result.categoria}</strong>
                </span>
              </>
            ) : (
              <>
                <AlertCircle size={16} />
                {result.error}
              </>
            )}
          </div>
        )}
      </div>

      {/* Lista de categorias importadas */}
      {categorias && categorias.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-100">
            Planilhas importadas
          </h2>
          <div className="flex flex-col gap-2">
            {categorias.map((cat) => (
              <div
                key={cat}
                className="flex items-center justify-between rounded-lg border border-gray-500/70 bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={18} className="text-blue-base" />
                  <span className="text-sm font-medium text-gray-200">
                    {cat}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(cat)}
                  className="rounded p-1.5 text-gray-400 transition-colors hover:bg-danger/15 hover:text-danger"
                  title={`Remover ${cat}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
