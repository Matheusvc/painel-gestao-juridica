import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Sidebar, type SidebarUser } from "./Sidebar";
import { MobileTopBar } from "./MobileTopBar";

interface DashboardLayoutProps {
  activeId: string;
  onSelect: (id: string) => void;
  user: SidebarUser;
  onLogout?: () => void;
  children: ReactNode;
}

/**
 * Casca do painel com menu hambúrguer em TODAS as telas:
 * - Barra superior fixa (hambúrguer + marca + avatar).
 * - A navegação abre em um drawer sobreposto (backdrop, Esc, clique-fora,
 *   foco gerido) tanto no mobile quanto no desktop.
 * - Abaixo, o conteúdo branco arredondado recebe a página atual.
 */
export function DashboardLayout({
  activeId,
  onSelect,
  user,
  onLogout,
  children,
}: DashboardLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Fecha com Esc, bloqueia scroll do body e move o foco ao abrir.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen, closeDrawer]);

  // Navega, fecha o drawer e devolve o foco ao hambúrguer.
  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
      setDrawerOpen(false);
      topBarRef.current?.querySelector("button")?.focus();
    },
    [onSelect],
  );

  return (
    <div className="flex h-dvh min-h-dvh w-full flex-col overflow-hidden bg-gray-100">
      {/* Barra superior (sempre) */}
      <div ref={topBarRef} className="shrink-0">
        <MobileTopBar
          userInitials={user.initials}
          onOpenMenu={() => setDrawerOpen(true)}
          menuOpen={drawerOpen}
          menuId={drawerId}
        />
      </div>

      {/* Área de conteúdo (painel branco) */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-content bg-gray-600 lg:mx-4 lg:mb-4 lg:rounded-[20px]">
        {children}
      </main>

      {/* Drawer de navegação (todas as telas) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Fechar menu"
            tabIndex={-1}
            onClick={closeDrawer}
            className="absolute inset-0 h-full w-full cursor-default bg-black/50 animate-fade-in-up"
          />
          <div
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            className="absolute inset-y-0 left-0 flex h-full w-[300px] max-w-[85vw] flex-col bg-gray-100 shadow-2xl"
          >
            <div className="flex justify-end px-3 pt-3">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeDrawer}
                aria-label="Fechar menu"
                className="flex size-9 items-center justify-center rounded-sm text-fuschia-60 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-base"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <Sidebar activeId={activeId} onSelect={handleSelect} user={user} onLogout={onLogout} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
