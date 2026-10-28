import { Moon, Sun } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { Avatar } from "./Avatar";
import { InlineIcon } from "./InlineIcon";
import { useTheme } from "@/context/ThemeContext";
import menuIcon from "@/assets/icon-menu.svg?raw";

interface MobileTopBarProps {
  userInitials: string;
  userPhotoUrl?: string;
  onOpenMenu: () => void;
  menuOpen: boolean;
  menuId: string;
}

export function MobileTopBar({
  userInitials,
  userPhotoUrl,
  onOpenMenu,
  menuOpen,
  menuId,
}: MobileTopBarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between p-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menu de navegação"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          className="flex size-10 items-center justify-center rounded-sm bg-gray-200 text-gray-100 transition-colors hover:bg-gray-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-base"
        >
          <InlineIcon svg={menuIcon} className="size-5 [&>svg]:size-5" />
        </button>
        <BrandLogo iconSize={44} />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Modo claro" : "Modo escuro"}
          className="flex size-10 items-center justify-center rounded-full bg-gray-200 text-gray-100 transition-colors hover:bg-gray-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-base"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <Avatar initials={userInitials} src={userPhotoUrl} size="md" />
      </div>
    </div>
  );
}
