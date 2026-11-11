import { EmbedResource } from "../components/embed-dialog/embed-dialog.types";
import { CompareEmbedResourceConfig } from "./compare-embed.types";
import {
  BAD_DATABASE_COMPARE_URL_TOAST_ID,
  BAD_SERVER_COMPARE_URL_TOAST_ID,
} from "./toast-ids";
import {
  INVALID_DATABASE_COMPARE_URL_TOAST_ACTION_LABEL,
  INVALID_DATABASE_COMPARE_URL_TOAST_BODY,
  INVALID_SERVER_COMPARE_URL_TOAST_ACTION_LABEL,
  INVALID_SERVER_COMPARE_URL_TOAST_BODY,
} from "./url-toast-content";

export const COMPARE_EMBED_RESOURCES: Record<
  EmbedResource,
  CompareEmbedResourceConfig
> = {
  server: {
    comparePath: "/servers/compare",
    listingPath: "/servers",
    toastId: BAD_SERVER_COMPARE_URL_TOAST_ID,
    toastBody: INVALID_SERVER_COMPARE_URL_TOAST_BODY,
    toastActionLabel: INVALID_SERVER_COMPARE_URL_TOAST_ACTION_LABEL,
  },
  database: {
    comparePath: "/databases/compare",
    listingPath: "/databases",
    toastId: BAD_DATABASE_COMPARE_URL_TOAST_ID,
    toastBody: INVALID_DATABASE_COMPARE_URL_TOAST_BODY,
    toastActionLabel: INVALID_DATABASE_COMPARE_URL_TOAST_ACTION_LABEL,
  },
};
