import { useCallback, useState, type FormEvent } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        await login(email, senha);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao fazer login");
      } finally {
        setLoading(false);
      }
    },
    [email, senha, login],
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* ── Left: Image panel ── */}
      <div className="relative hidden overflow-hidden lg:block lg:w-[52%]">
        <img
          src="/assets/ocean-bg.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Wave overlay (white shape creating the organic curve) */}
        <svg
          className="absolute -right-px top-0 h-full"
          viewBox="0 0 200 1000"
          preserveAspectRatio="none"
          style={{ width: "clamp(120px, 16vw, 200px)" }}
        >
          <path
            d="M200,0 C170,80 100,160 130,280 C160,400 200,440 160,560 C120,680 60,760 90,880 C105,940 140,970 200,1000 L200,0Z"
            fill="white"
          />
        </svg>

        {/* Decorative concentric circles (bottom-left) */}
        <svg
          className="absolute -bottom-12 -left-12 h-[260px] w-[260px]"
          viewBox="0 0 260 260"
          fill="none"
        >
          <circle cx="130" cy="130" r="80" stroke="white" strokeWidth="1.2" opacity="0.35" />
          <circle cx="130" cy="130" r="120" stroke="white" strokeWidth="1.2" opacity="0.2" />
        </svg>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="relative flex flex-1 flex-col justify-center px-8 py-14 sm:px-12 lg:px-16 xl:px-20">
        {/* Hamburger icon */}
        <div className="absolute right-6 top-6 lg:right-8 lg:top-8">
          <Menu size={26} strokeWidth={2.5} className="text-[#1a1a1a]" />
        </div>

          {/* Brand */}
          <div className="mb-10">
            <h1 className="text-[clamp(2.5rem,5vw,3.5rem)] font-black leading-none tracking-tight text-[#1a1a1a]">
              CASTRO
            </h1>
            <p className="mt-0.5 text-sm font-medium tracking-[3px] text-[#444]">
              ADVOCACIA
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-sm font-semibold text-[#1a1a1a]">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@gmail.com"
                className="h-12 w-full rounded-lg border border-[#d1d5db] bg-white px-4 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:border-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#1a1a1a]"
              />
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-senha" className="text-sm font-semibold text-[#1a1a1a]">
                Senha
              </label>
              <div className="relative">
                <input
                  id="login-senha"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="*************"
                  className="h-12 w-full rounded-lg border border-[#d1d5db] bg-white px-4 pr-12 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:border-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#1a1a1a]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-colors hover:text-[#1a1a1a]"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember / Recover */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#555]">
                <input
                  type="checkbox"
                  className="size-4 rounded border-[#d1d5db] accent-[#1a1a1a]"
                />
                Lembrar senha
              </label>
              <button type="button" className="text-[#888] transition-colors hover:text-[#1a1a1a]">
                Recuperar senha
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-12 items-center justify-center rounded-lg bg-[#1a1a1a] text-sm font-semibold text-white transition-colors hover:bg-[#333] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Entrando…
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Decorative quarter-circle (bottom-right) */}
          <div className="absolute bottom-0 right-0 hidden h-[130px] w-[130px] overflow-hidden lg:block">
            <svg viewBox="0 0 130 130" className="h-full w-full">
              <path d="M130,130 L130,0 A130,130 0 0,0 0,130 Z" fill="#1a1a1a" />
              <path
                d="M130,130 L130,25 A105,105 0 0,0 25,130"
                fill="none"
                stroke="white"
                strokeWidth="1"
                opacity="0.25"
              />
              <path
                d="M130,130 L130,48 A82,82 0 0,0 48,130"
                fill="none"
                stroke="white"
                strokeWidth="1"
                opacity="0.18"
              />
              <path
                d="M130,130 L130,70 A60,60 0 0,0 70,130"
                fill="none"
                stroke="white"
                strokeWidth="1"
                opacity="0.12"
              />
            </svg>
          </div>
        </div>
    </div>
  );
}
