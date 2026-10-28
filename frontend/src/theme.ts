/**
 * theme.ts — Fonte única de tokens de design (Castro Advocacia).
 *
 * Os valores sob `figma` foram extraídos diretamente das variáveis do arquivo
 * Figma (node 3397-795). Os valores sob `assumed` NÃO existiam no Figma e foram
 * assumidos para construir a superfície clara do chat; estão documentados no
 * README (checklist de comparação).
 *
 * Este arquivo é consumido por `tailwind.config.ts` (gera as classes utilitárias)
 * e pode ser importado em TS quando um token precisar ser usado em JS.
 */

export const colors = {
  // --- Extraídos do Figma ---
  blue: {
    base: "#5165E1", // blue/base
    light: "#8996EB", // blue/light — "ADVOCACIA", detalhes
    dark: "#2E3DA3", // blue/dark — link ativo, títulos, avatar
  },
  fuschia: {
    60: "#FCDDEC", // fuschia/60 — texto/ícone de link inativo na sidebar
  },
  gray: {
    100: "var(--c-gray-100)", // grayscale/gray-100 — texto primário / fundo sidebar
    200: "var(--c-gray-200)", // grayscale/gray-200 — bordas, botão hambúrguer
    400: "var(--c-gray-400)", // grayscale/gray-400 — texto secundário/mudo
    500: "var(--c-gray-500)", // grayscale/gray-500 — bordas de tabela
    600: "var(--c-gray-600)", // grayscale/gray-600 — fundo do conteúdo / texto sobre escuro
  },

  // Cores de feedback/status (Figma — página Serviços)
  danger: "#D03E3E", // feedback/danger — ícone de excluir
  status: {
    open: "#CC3D6A", // feedback/open — "Aberto"
    progress: "#355EC5", // feedback/progress — "Em atendimento"
    done: "#508B26", // feedback/done — "Encerrado"
    analise: "#B9770E", // feedback/analise — "Em análise" (não existia no Figma)
  },

  // --- Assumidos (não existiam no Figma) para a superfície clara do chat ---
  surface: "var(--c-surface)", // balão recebido, campo de input
  borderLight: "var(--c-border-light)", // bordas sobre fundo claro
  bubbleReceived: "#FFFFFF",
  bubbleSent: "#5165E1", // = blue.base
} as const;

export const radii = {
  sm: "5px", // links de menu, botões (Figma)
  bubble: "16px", // balões de mensagem (assumido)
  content: "20px", // topo do conteúdo no mobile (Figma)
  shell: "24px", // moldura externa do mobile (Figma)
  full: "9999px", // avatares (Figma)
} as const;

export const fonts = {
  sans: ["Lato", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
} as const;

/**
 * Escala de fontes.
 *
 * Importante: definimos apenas `xxs` (o rótulo "ADVOCACIA") e deixamos
 * xs/sm/base/lg/xl/2xl/3xl usarem a escala PADRÃO do Tailwind — que é em `rem`.
 * Assim, as fontes acompanham o `font-size` do root (ver index.css) e o site
 * fica em tamanho confortável/padrão. Valores em px fixos NÃO escalam, por isso
 * não são usados aqui.
 */
export const fontSize = {
  // 0.625rem ≈ 11px no root de 18px; bold + tracking, para "ADVOCACIA".
  xxs: ["0.625rem", { lineHeight: "1.4", letterSpacing: "0.6px", fontWeight: "700" }],
} as const;

/** Paleta cíclica para gráficos com quantidade dinâmica de categorias. */
export const chartPalette = [
  "#5165E1", // blue.base
  "#508B26", // done
  "#CC3D6A", // open
  "#B9770E", // analise
  "#355EC5", // progress
  "#8996EB", // blue.light
  "#D03E3E", // danger
  "#2E3DA3", // blue.dark
] as const;


/** Breakpoint único que alterna o layout mobile (top bar) para desktop (sidebar). */
export const layoutBreakpoint = "lg"; // 1024px
