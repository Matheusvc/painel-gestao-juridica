import type { ReactNode } from "react";
import { Upload } from "lucide-react";
import { InlineIcon } from "./InlineIcon";
import dashboardIcon from "@/assets/icon-dashboard.svg?raw";
import clientesIcon from "@/assets/icon-clientes.svg?raw";
import servicosIcon from "@/assets/icon-servicos.svg?raw";

export interface NavItem {
  id: string;
  label: string;
  /** Ícone já dimensionado (20px), herda a cor do texto (currentColor). */
  icon: ReactNode;
  href: string;
}

const iconClass = "size-[22px] [&>svg]:size-[22px]";

/** Links de navegação (Dashboard / Clientes / Serviços / Importar). */
export const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <InlineIcon svg={dashboardIcon} className={iconClass} />,
    href: "#dashboard",
  },
  {
    id: "clientes",
    label: "Clientes",
    icon: <InlineIcon svg={clientesIcon} className={iconClass} />,
    href: "#clientes",
  },
  {
    id: "servicos",
    label: "Serviços",
    icon: <InlineIcon svg={servicosIcon} className={iconClass} />,
    href: "#servicos",
  },
  {
    id: "importar",
    label: "Importar",
    icon: <Upload size={22} />,
    href: "#importar",
  },
];
