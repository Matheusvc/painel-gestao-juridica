import { LogOut, Sun, Moon } from "lucide-react";
import { Avatar } from "./Avatar";
import { useTheme } from "@/context/ThemeContext";

interface UserCardProps {
  name: string;
  email: string;
  initials: string;
  photoUrl?: string;
  onLogout?: () => void;
  onProfileClick?: () => void;
}

export function UserCard({ name, email, initials, photoUrl, onLogout, onProfileClick }: UserCardProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 border-t border-gray-200 px-4 py-5">
      <button
        type="button"
        onClick={onProfileClick}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 -m-1 transition-colors hover:bg-gray-200"
        title="Configuração de perfil"
      >
        <Avatar initials={initials} src={photoUrl} size="sm" />
        <div className="flex min-w-0 flex-1 flex-col text-left">
          <span className="truncate text-sm text-gray-600">{name}</span>
          <span className="truncate text-xs text-gray-400">{email}</span>
        </div>
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        title={theme === "dark" ? "Modo claro" : "Modo escuro"}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          title="Sair"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-danger/15 hover:text-danger"
        >
          <LogOut size={16} />
        </button>
      )}
    </div>
  );
}
