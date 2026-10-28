import { ChartColorPair } from "./benchmark-chart.types";

export const chartColors = {
  black: "#000000",
  "blue-500": "#3b82f6",
  "emerald-400": "#34d399",
  "gray-200": "#e5e7eb",
  "gray-600": "#4b5563",
  "indigo-400": "#818cf8",
  "lime-400": "#a3e635",
  "pink-400": "#f472b6",
  "red-400": "#f87171",
  "red-500": "#ef4444",
  "sky-400": "#38bdf8",
  "sky-900": "#0c4a6e",
  "sky-975": "#06263a",
  "slate-400": "#94a3b8",
  white: "#ffffff",
  "yellow-500": "#eab308",
} as const;

export type ChartColorToken = keyof typeof chartColors;

export function chartColor(token: ChartColorToken, alpha: number): string {
  const channel = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${chartColors[token]}${channel}`;
}

const radarDatasetTokens: ChartColorToken[] = [
  "emerald-400",
  "gray-200",
  "sky-400",
  "yellow-500",
  "red-400",
  "lime-400",
  "indigo-400",
  "slate-400",
];

export const radarDatasetColors: ChartColorPair[] = radarDatasetTokens.map(
  (token) => ({
    borderColor: chartColors[token],
    backgroundColor: chartColor(token, 0.2),
  }),
);
