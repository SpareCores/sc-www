import { EmbedPreviewSize } from "./embed-dialog.types";

export const EMBED_PREVIEW_SIZES: EmbedPreviewSize[] = [
  { id: "mobile", name: "Mobile (360px)", widthClass: "w-90" },
  { id: "tablet", name: "Tablet (768px)", widthClass: "w-(--breakpoint-md)" },
  {
    id: "desktop",
    name: "Desktop",
    widthClass: "w-full min-w-(--breakpoint-lg)",
  },
];

export const COMPARE_EMBED_PATHS = {
  server: "compare",
  database: "database-compare",
} as const;
