import { BrandLogo } from "./BrandLogo";
import { SidebarLink } from "./SidebarLink";
import { UserCard } from "./UserCard";
import { navItems } from "./navItems";

export interface SidebarUser {
  name: string;
  email: string;
  initials: string;
  photoUrl?: string;
}

interface SidebarProps {
  activeId: string;
  onSelect: (id: string) => void;
  user: SidebarUser;
  onLogout?: () => void;
  onProfileClick?: () => void;
  navLabel?: string;
}

/** Conteúdo da sidebar (reutilizado no desktop e no drawer mobile). */
export function Sidebar({
  activeId,
  onSelect,
  user,
  onLogout,
  onProfileClick,
  navLabel = "Navegação principal",
}: SidebarProps) {
  return (
    <div className="flex h-full w-full flex-col bg-gray-100">
      <div className="flex items-center border-b border-gray-200 px-5 py-6">
        <BrandLogo iconSize={44} />
      </div>

      <nav aria-label={navLabel} className="flex-1 overflow-y-auto px-4 py-5">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <SidebarLink
              key={item.id}
              item={item}
              active={item.id === activeId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      </nav>

      <UserCard name={user.name} email={user.email} initials={user.initials} photoUrl={user.photoUrl} onLogout={onLogout} onProfileClick={onProfileClick} />
    </div>
  );
}
