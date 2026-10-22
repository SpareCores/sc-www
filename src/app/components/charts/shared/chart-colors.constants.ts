import { ChartColorPair } from "./benchmark-chart.types";

export const chartColors = {
  "amber-400": "#ffb900",
  black: "#000000",
  "blue-500": "#2b7fff",
  "emerald-300": "#5ee9b5",
  "emerald-400": "#00d492",
  "gray-200": "#e5e7eb",
  "gray-600": "#4a5565",
  "indigo-400": "#7c86ff",
  "lime-400": "#9ae600",
  "pink-400": "#fb64b6",
  "red-400": "#ff6467",
  "red-500": "#fb2c36",
  "sky-400": "#00bcff",
  "sky-900": "#024a70",
  "sky-975": "#06263a",
  "slate-400": "#90a1b9",
  white: "#ffffff",
  "yellow-400": "#fdc700",
  "yellow-500": "#f0b100",
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
  "yellow-400",
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
