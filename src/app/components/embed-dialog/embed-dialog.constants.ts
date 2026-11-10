import { EmbedPreviewSize } from "./embed-dialog.types";

export const EMBED_PREVIEW_SIZES: EmbedPreviewSize[] = [
  { id: "mobile", name: "Mobile (375px)", widthClass: "w-[375px]" },
  { id: "tablet", name: "Tablet (768px)", widthClass: "w-[768px]" },
  { id: "desktop", name: "Desktop", widthClass: "w-full min-w-[1024px]" },
];
