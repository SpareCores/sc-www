export type PromoBannerVariant = "advisor" | "site";

export type PromoBannerMessage = {
  variant: PromoBannerVariant;
  lead: string;
  body: string;
  ariaLabel: string;
  href?: string;
  ctaLabel?: string;
  ctaId?: string;
};

const PROMO_BANNER_LEAD = "Ready to scale?";

const PROMO_BANNER_BODY =
  "Unlock multi-server optimization, programmatic API access, and workflow automations for advanced cloud management.";

export const SITE_PROMO_BANNER: PromoBannerMessage = {
  variant: "site",
  lead: PROMO_BANNER_LEAD,
  body: PROMO_BANNER_BODY,
  ariaLabel: "Open the Spare Cores Advisor page",
  href: "/advisor",
};

export const ADVISOR_PROMO_BANNER: PromoBannerMessage = {
  variant: "advisor",
  lead: PROMO_BANNER_LEAD,
  body: PROMO_BANNER_BODY,
  ariaLabel: "Open the Spare Cores advisor meeting scheduler",
  ctaLabel: "Try it now",
  ctaId: "meeting-advisor-promo-banner",
};
