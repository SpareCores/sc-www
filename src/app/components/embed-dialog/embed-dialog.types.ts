import { WritableSignal } from "@angular/core";

export interface EmbedWidgetOption {
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

export type EmbedResource = "server" | "database";

export type EmbedTarget =
  | { kind: "details"; resource: EmbedResource; vendor: string; id: string }
  | { kind: "compare"; resource: EmbedResource; instances: string };

export interface EmbedPreset {
  modalId: string;
  idPrefix: string;
  captureEventPrefix: string;
  minHeight: number;
  defaultHeight: number;
  aspectRatio: number | null;
  srcFor: (widgetId: string) => string;
}
