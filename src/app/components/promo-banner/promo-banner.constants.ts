export type PromoBannerVariant = "advisor" | "site";

export type PromoBannerDismissalGroup =
  | "advisor-launch"
  | "advisor-contact"
  | "servers";

export type PromoBannerMessage = {
  variant: PromoBannerVariant;
  lead?: string;
  body: string;
  ariaLabel: string;
  dismissalGroup: PromoBannerDismissalGroup;
  ctaLabel?: string;
  ctaHref?: string;
  ctaId?: string;
};

const PROMO_BANNER_LEAD = "Ready to scale?";

const PROMO_BANNER_BODY =
  "Unlock multi-server optimization, programmatic API access, and workflow automations for advanced cloud management.";

export const SITE_PROMO_BANNER: PromoBannerMessage = {
  variant: "site",
  lead: "Right-sizing your cloud?",
  body: "Workload-aware server recommendations based on cost-efficiency, including egress costs.",
  ariaLabel: "Open the Spare Cores Advisor page from the promo banner",
  dismissalGroup: "advisor-launch",
  ctaLabel: "Launch Advisor",
  ctaHref: "/advisor",
};

export const SERVER_PRICES_PROMO_BANNER: PromoBannerMessage = {
  variant: "site",
  lead: "Searching for servers?",
  body: "Our server navigator now features granular filter for region, country, and price allocation types.",
  ariaLabel: "Open the Spare Cores server navigator from the promo banner",
  dismissalGroup: "servers",
  ctaLabel: "Launch Navigator",
  ctaHref: "/servers",
};

export const STORAGE_PRICES_PROMO_BANNER: PromoBannerMessage = {
  variant: "site",
  lead: "Storage costs vary by region.",
  body: "Evaluate your baseline to find the most cost-effective storage-optimized instances.",
  ariaLabel: "Open the Spare Cores Advisor page from the storage promo banner",
  dismissalGroup: "advisor-launch",
  ctaLabel: "Launch Advisor",
  ctaHref: "/advisor",
};

export const TRAFFIC_PRICES_PROMO_BANNER: PromoBannerMessage = {
  variant: "site",
  lead: "Don't let egress surprise you!",
  body: "Use our updated Advisor to calculate the total cost of a server including traffic patterns.",
  ariaLabel: "Open the Spare Cores Advisor page from the traffic promo banner",
  dismissalGroup: "advisor-launch",
  ctaLabel: "Launch Advisor",
  ctaHref: "/advisor",
};

export const ADVISOR_PROMO_BANNER: PromoBannerMessage = {
  variant: "advisor",
  lead: PROMO_BANNER_LEAD,
  body: PROMO_BANNER_BODY,
  ariaLabel: "Open the Spare Cores advisor meeting scheduler",
  dismissalGroup: "advisor-contact",
  ctaLabel: "Contact Us",
  ctaId: "meeting-advisor-promo-banner",
};

export const PROMO_BANNER_BY_PATH: Readonly<
  Partial<Record<string, PromoBannerMessage>>
> = {
  "/": SITE_PROMO_BANNER,
  "/advisor": ADVISOR_PROMO_BANNER,
  "/server_prices": SERVER_PRICES_PROMO_BANNER,
  "/storages": STORAGE_PRICES_PROMO_BANNER,
  "/traffic-prices": TRAFFIC_PRICES_PROMO_BANNER,
};
