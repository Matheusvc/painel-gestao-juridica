import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: "bg-blue-base text-white hover:bg-blue-dark",
  secondary: "border border-gray-500 bg-surface text-gray-100 hover:bg-gray-500/30",
  danger: "bg-danger text-white hover:brightness-95",
};

/** Botão de ação para formulários/diálogos. */
export function Button({
  variant = "primary",
  children,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-sm px-4 text-sm font-bold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-base focus-visible:ring-offset-2 disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
