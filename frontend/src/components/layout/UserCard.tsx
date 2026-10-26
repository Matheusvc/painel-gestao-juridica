import { LogOut } from "lucide-react";
import { Avatar } from "./Avatar";

interface UserCardProps {
  name: string;
  email: string;
  initials: string;
  onLogout?: () => void;
}

export function UserCard({ name, email, initials, onLogout }: UserCardProps) {
  return (
    <div className="flex items-center gap-3 border-t border-gray-200 px-4 py-5">
      <Avatar initials={initials} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm text-gray-600">{name}</span>
        <span className="truncate text-xs text-gray-400">{email}</span>
      </div>
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
