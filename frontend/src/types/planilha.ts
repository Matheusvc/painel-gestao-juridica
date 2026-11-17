export interface ColunaMeta {
  nome: string;
  tipo: "MONETARIO" | "DATA" | "NUMERICO" | "STATUS" | "TEXTO";
}

export interface PlanilhaData {
  categoria: string;
  colunas: ColunaMeta[];
  linhas: Record<string, string>[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
}

export interface PlanilhaKpi {
  coluna: string;
  soma: number;
  media: number;
}

export interface PlanilhaGrafico {
  coluna: string;
  distribuicao: Record<string, number>;
}

export interface PlanilhaStats {
  totalLinhas: number;
  kpis: PlanilhaKpi[];
  graficos: PlanilhaGrafico[];
}
