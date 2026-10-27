const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  aberto:          { text: "text-amber-500",   bg: "bg-amber-500/20" },
  "em atendimento":{ text: "text-blue-400",    bg: "bg-blue-400/20" },
  encerrado:       { text: "text-emerald-500", bg: "bg-emerald-500/20" },
  "em análise":    { text: "text-purple-400",  bg: "bg-purple-400/20" },
  pendente:        { text: "text-orange-400",  bg: "bg-orange-400/20" },
  cancelado:       { text: "text-red-400",     bg: "bg-red-400/20" },
  concluído:       { text: "text-emerald-500", bg: "bg-emerald-500/20" },
};

const FALLBACK_PALETTE = [
  { text: "text-cyan-400",    bg: "bg-cyan-400/20" },
  { text: "text-pink-400",    bg: "bg-pink-400/20" },
  { text: "text-yellow-400",  bg: "bg-yellow-400/20" },
  { text: "text-indigo-400",  bg: "bg-indigo-400/20" },
  { text: "text-teal-400",    bg: "bg-teal-400/20" },
  { text: "text-rose-400",    bg: "bg-rose-400/20" },
];

const dynamicAssignments = new Map<string, { text: string; bg: string }>();
let nextIndex = 0;

export function getStatusColor(status: string): { text: string; bg: string } {
  const key = status.toLowerCase().trim();
  const known = STATUS_COLORS[key];
  if (known) return known;

  if (!dynamicAssignments.has(key)) {
    dynamicAssignments.set(key, FALLBACK_PALETTE[nextIndex % FALLBACK_PALETTE.length]);
    nextIndex++;
  }
  return dynamicAssignments.get(key)!;
}
