export const CHART_COLORS = [
  "#1B96FF",
  "#04844B",
  "#E3066A",
  "#FF6B2B",
  "#7526E5",
  "#0EB58C",
  "#FE5C4C",
  "#3A7AF2",
  "#B7560E",
  "#27AAE1",
] as const;

export interface ChartDatum {
  label: string;
  value: number;
  color: string;
}

export function mapToChartData(record: Record<string, number>): ChartDatum[] {
  return Object.entries(record).map(([label, value], i) => ({
    label,
    value,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));
}

export function sumValues(record: Record<string, number>): number {
  return Object.values(record).reduce((a, b) => a + b, 0);
}
