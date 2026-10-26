import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import type { SidebarUser } from "@/components/layout/Sidebar";
import { DashboardPage } from "@/components/pages/DashboardPage";
import { ClientesPage } from "@/components/pages/ClientesPage";
import { ServicosPage } from "@/components/pages/ServicosPage";
import { useHashRoute } from "@/hooks/useHashRoute";

const currentUser: SidebarUser = {
  name: "Usuário Adm",
  email: "user.adm@test.com",
  initials: "UA",
};

const ROUTES = ["dashboard", "clientes", "servicos"] as const;
type Route = (typeof ROUTES)[number];

const PAGES: Record<Route, ReactNode> = {
  dashboard: <DashboardPage />,
  clientes: <ClientesPage />,
  servicos: <ServicosPage />,
};

export default function App() {
  const [route, navigate] = useHashRoute<Route>(ROUTES, "dashboard");

  return (
    <DashboardLayout
      activeId={route}
      onSelect={(id) => navigate(id as Route)}
      user={currentUser}
    >
      {PAGES[route]}
    </DashboardLayout>
  );
}
