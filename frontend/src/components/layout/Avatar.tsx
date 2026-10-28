import { cn } from "@/lib/cn";

type AvatarSize = "xxs" | "xs" | "sm" | "md";

interface AvatarProps {
  initials: string;
  size?: AvatarSize;
  /** URL da foto de perfil. Quando presente, exibe a foto em vez das iniciais. */
  src?: string;
  /** Indicador de presença (ponto verde). */
  online?: boolean;
  className?: string;
}

const sizeMap: Record<AvatarSize, string> = {
  xxs: "size-5 text-[8.75px] tracking-[0.875px]", // 20px — responsável (Serviços)
  xs: "size-7 text-[12.25px] tracking-[1.225px]", // 28px — linhas de tabela (Clientes)
  sm: "size-8 text-sm tracking-[1.4px]", // 32px — sidebar/desktop (Figma)
  md: "size-10 text-sm tracking-[1.4px]", // 40px — top bar mobile (Figma)
};

/** Avatar circular com iniciais. Fundo blue/dark do Figma. */
export function Avatar({ initials, size = "sm", src, online, className }: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {src ? (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className={cn("rounded-full object-cover", sizeMap[size])}
        />
      ) : (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-blue-dark font-bold uppercase text-white",
            sizeMap[size],
          )}
          aria-hidden="true"
        >
          {initials}
        </span>
      )}
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full border-2",
            size === "md" ? "size-3" : "size-2.5",
            online ? "bg-emerald-500" : "bg-gray-400",
          )}
          style={{ borderColor: "var(--c-surface)" }}
        />
      )}
    </span>
  );
}
