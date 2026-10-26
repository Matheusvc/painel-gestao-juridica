import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardPage } from "@/components/pages/DashboardPage";
import { ClientesPage } from "@/components/pages/ClientesPage";
import { ServicosPage } from "@/components/pages/ServicosPage";
import { ImportarPage } from "@/components/pages/ImportarPage";
import { LoginPage } from "@/components/pages/LoginPage";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useHashRoute } from "@/hooks/useHashRoute";

const ROUTES = ["dashboard", "clientes", "servicos", "importar", "login"] as const;
type Route = (typeof ROUTES)[number];

const PAGES: Record<Exclude<Route, "login">, ReactNode> = {
  dashboard: <DashboardPage />,
  clientes: <ClientesPage />,
  servicos: <ServicosPage />,
  importar: <ImportarPage />,
};

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [route, navigate] = useHashRoute<Route>(ROUTES, "dashboard");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app">
        <p className="text-sm text-gray-400">Carregando…</p>
      </div>
    );
  }

  if (!user || route === "login") {
    if (!user) return <LoginPage />;
    navigate("dashboard");
    return null;
  }

  const initials = user.nome
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DashboardLayout
      activeId={route === "login" ? "dashboard" : route}
      onSelect={(id) => navigate(id as Route)}
      user={{ name: user.nome, email: user.email, initials }}
      onLogout={logout}
    >
      {PAGES[route as Exclude<Route, "login">] ?? <DashboardPage />}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
