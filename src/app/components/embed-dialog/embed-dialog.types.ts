import { WritableSignal } from "@angular/core";

export interface EmbedChartOption {
  id: string;
  name: string;
}

export interface EmbedPreviewSize {
  id: "mobile" | "tablet" | "desktop";
  name: string;
  widthClass: string;
}

export interface EmbedStepper {
  id: "height" | "width";
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: WritableSignal<number>;
}
