interface BrandLogoProps {
  /** Tamanho do ícone do logo em px (Figma usa 44). */
  iconSize?: number;
}

/** Marca "CASTRO ADVOCACIA" com o ícone do Figma (public/assets/logo.svg). */
export function BrandLogo({ iconSize = 44 }: BrandLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/assets/logo.svg"
        alt="Castro Advocacia"
        width={iconSize}
        height={iconSize}
        className="shrink-0"
        style={{ width: iconSize, height: iconSize }}
      />
      <div className="flex flex-col leading-none">
        <span className="font-bold text-lg text-gray-100">CASTRO</span>
        <span className="font-bold text-xxs uppercase tracking-[0.6px] text-blue-light">
          ADVOCACIA
        </span>
      </div>
    </div>
  );
}
