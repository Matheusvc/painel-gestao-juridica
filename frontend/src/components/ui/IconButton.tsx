import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface IconButtonProps {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  /** Cor do ícone (ex.: "text-danger" para excluir). */
  tone?: "default" | "danger";
  className?: string;
}

/** Botão de ação quadrado 28px (Figma: bg gray-500, rounded-5). */
export function IconButton({
  label,
  onClick,
  children,
  tone = "default",
  className,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-sm bg-gray-500 transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-base focus-visible:ring-offset-1",
        tone === "danger" ? "text-danger" : "text-gray-100",
        className,
      )}
    >
      {children}
    </button>
  );
}
