export type AnnouncementTickerTone = "feature" | "news";

export type AnnouncementTickerSegment = {
  text: string;
  highlight?: boolean;
};

export type AnnouncementTickerMessage = {
  ariaLabel: string;
  href: string;
  icon?: string;
  question: string;
  bodySegments: readonly AnnouncementTickerSegment[];
  ctaLabel: string;
  tone?: AnnouncementTickerTone;
};

type AnnouncementTickerPalette = {
  accent: string;
  backgroundStart: string;
  backgroundMid: string;
  backgroundEnd: string;
  border: string;
  glow: string;
  glowAlt: string;
  focus: string;
};

export const DEFAULT_ANNOUNCEMENT_TICKER_TONE: AnnouncementTickerTone =
  "feature";

export const DEFAULT_ANNOUNCEMENT_TICKER_DISMISS_LABEL = "Close announcement";

export const ANNOUNCEMENT_TICKER_PALETTES: Record<
  AnnouncementTickerTone,
  AnnouncementTickerPalette
> = {
  feature: {
    accent: "#34D399",
    backgroundStart: "#082F49",
    backgroundMid: "#093756",
    backgroundEnd: "#0C4A6E",
    border: "#0C4A6E",
    glow: "rgb(52 211 153 / 0.18)",
    glowAlt: "rgb(20 184 166 / 0.16)",
    focus: "#34D399",
  },
  news: {
    accent: "#14B8A6",
    backgroundStart: "#082F49",
    backgroundMid: "#093756",
    backgroundEnd: "#0C4A6E",
    border: "#0C4A6E",
    glow: "rgb(20 184 166 / 0.18)",
    glowAlt: "rgb(52 211 153 / 0.14)",
    focus: "#14B8A6",
  },
};

export const HOME_HEADER_ANNOUNCEMENT: AnnouncementTickerMessage = {
  ariaLabel: "Try the updated Spare Cores Advisor",
  href: "/advisor",
  icon: "🚀",
  question: "Looking for better cloud server alternatives?",
  bodySegments: [
    { text: "Use our updated" },
    { text: "Advisor", highlight: true },
    {
      text: "to compare your baseline configuration against workload-aware recommendations using measured performance and cost-efficiency metrics, now including storage and network pricing.",
    },
  ],
  ctaLabel: "Try it now",
};
