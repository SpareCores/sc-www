import { EmbedPreset, EmbedTarget } from "./embed-dialog.types";
import { COMPARE_EMBED_PATHS } from "./embed-dialog.constants";

export function embedTargetKey(target: EmbedTarget): string {
  return target.kind === "details"
    ? `${target.resource}/${target.vendor}/${target.id}`
    : `${target.resource}?${target.instances}`;
}

export function buildEmbedPreset(
  target: EmbedTarget,
  baseUrl: string,
): EmbedPreset {
  if (target.kind === "details") {
    const base = `${baseUrl}/embed/${target.resource}/${target.vendor}/${target.id}`;
    return {
      modalId: "embed-widgets-modal",
      idPrefix: `${target.resource}_embed`,
      captureEventPrefix: `${target.resource} embed`,
      minHeight: 400,
      defaultHeight: 510,
      aspectRatio: 0.6,
      srcFor: (widgetId) => `${base}/${widgetId}`,
    };
  }

  const base = `${baseUrl}/embed/${COMPARE_EMBED_PATHS[target.resource]}`;
  const prefix = target.resource === "server" ? "compare" : "database compare";
  return {
    modalId: "embed-compare-modal",
    idPrefix: `${prefix.replace(" ", "_")}_embed`,
    captureEventPrefix: `${prefix} embed`,
    minHeight: 600,
    defaultHeight: 710,
    aspectRatio: null,
    srcFor: (widgetId) => `${base}/${widgetId}?instances=${target.instances}`,
  };
}
